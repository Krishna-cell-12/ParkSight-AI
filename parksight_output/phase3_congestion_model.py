import pandas as pd
import numpy as np
import json
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score, TimeSeriesSplit
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

print("="*60)
print("CONGESTION PREDICTION MODEL — TRAINING")
print("="*60)

# Load clean violations
df = pd.read_csv('parksight_output/clean_violations.csv')
df['created_datetime'] = pd.to_datetime(df['created_datetime'], format='mixed', utc=True)
df['date_only'] = df['created_datetime'].dt.date
df['hour'] = df['hour'].astype(int)
df['dow'] = df['day_of_week'].astype(int)
df['month'] = df['month'].astype(int)

TOP_JUNCTIONS = [
    'BTP051 - Safina Plaza Junction',
    'BTP082 - KR Market Junction',
    'BTP040 - Elite Junction',
    'BTP044 - Sagar Theatre Junction',
    'BTP211 - Central Street Junction',
    'BTP020 - Hosahalli Metro Station'
]

# --- BUILD FEATURES ---
# Aggregate to junction + date + hour level
hourly = (
    df[df['junction_name'].isin(TOP_JUNCTIONS)]
    .groupby(['junction_name', 'date_only', 'hour', 'dow', 'month'])
    .agg(
        violation_count=('id', 'count') if 'id' in df.columns else ('latitude', 'count'),
        severity_mean=('severity_weight', 'mean'),
        high_sev_count=('severity_weight', lambda x: (x==3).sum()),
        unique_vehicles=('vehicle_type', 'nunique')
    )
    .reset_index()
)

# Lag features: violations in previous 1, 2, 3 hours
hourly = hourly.sort_values(['junction_name', 'date_only', 'hour'])
for lag in [1, 2, 3]:
    hourly[f'lag_{lag}h'] = hourly.groupby(['junction_name'])['violation_count'].shift(lag)

# Rolling average: 7-day same-hour average
hourly['hour_day'] = hourly['junction_name'] + '_' + hourly['hour'].astype(str) + '_' + hourly['dow'].astype(str)
rolling_avg = hourly.groupby('hour_day')['violation_count'].transform('mean')
hourly['rolling_7d_avg'] = rolling_avg

# Is weekend
hourly['is_weekend'] = (hourly['dow'] >= 5).astype(int)

# Is peak window
hourly['is_peak'] = hourly['hour'].isin([2,3,4,5,6]).astype(int)

# Junction encoding
junction_map = {j: i for i, j in enumerate(TOP_JUNCTIONS)}
hourly['junction_code'] = hourly['junction_name'].map(junction_map).fillna(-1)

# TARGET: congestion_risk
# Define: congestion likely if violations > mean + 1 std for that junction+hour combo
stats = hourly.groupby(['junction_name', 'hour'])['violation_count'].agg(['mean','std']).reset_index()
stats['threshold'] = stats['mean'] + 0.8 * stats['std'].fillna(0)
hourly = hourly.merge(stats[['junction_name','hour','threshold']], on=['junction_name','hour'], how='left')
hourly['congestion_risk'] = (hourly['violation_count'] >= hourly['threshold']).astype(int)

print(f"\nDataset shape: {hourly.shape}")
print(f"Positive class (congestion risk): {hourly['congestion_risk'].sum()} ({hourly['congestion_risk'].mean()*100:.1f}%)")
print(f"Negative class (no risk):         {(hourly['congestion_risk']==0).sum()}")

# Features for model
FEATURES = ['violation_count','severity_mean','high_sev_count','unique_vehicles',
            'lag_1h','lag_2h','lag_3h','rolling_7d_avg',
            'is_weekend','is_peak','hour','dow','month','junction_code']

# Drop rows with NaN lags
model_df = hourly.dropna(subset=FEATURES)
X = model_df[FEATURES]
y = model_df['congestion_risk']

print(f"\nFinal model dataset: {len(model_df)} rows, {len(FEATURES)} features")

# --- TRAIN MODELS ---
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Time-series cross validation (respects temporal order)
tscv = TimeSeriesSplit(n_splits=5)

print("\n--- LOGISTIC REGRESSION ---")
lr = LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced')
lr_scores = cross_val_score(lr, X_scaled, y, cv=tscv, scoring='f1')
lr_roc = cross_val_score(lr, X_scaled, y, cv=tscv, scoring='roc_auc')
print(f"  F1 Score (CV):      {lr_scores.mean():.3f} ± {lr_scores.std():.3f}")
print(f"  ROC-AUC (CV):       {lr_roc.mean():.3f} ± {lr_roc.std():.3f}")

print("\n--- RANDOM FOREST ---")
rf = RandomForestClassifier(n_estimators=100, random_state=42,
                             class_weight='balanced', n_jobs=-1,
                             max_depth=8, min_samples_leaf=5)
rf_scores = cross_val_score(rf, X, y, cv=tscv, scoring='f1')
rf_roc = cross_val_score(rf, X, y, cv=tscv, scoring='roc_auc')
print(f"  F1 Score (CV):      {rf_scores.mean():.3f} ± {rf_scores.std():.3f}")
print(f"  ROC-AUC (CV):       {rf_roc.mean():.3f} ± {rf_roc.std():.3f}")

# Train final model on all data
rf.fit(X, y)
lr.fit(X_scaled, y)

# Feature importance
importances = pd.DataFrame({
    'feature': FEATURES,
    'importance': rf.feature_importances_
}).sort_values('importance', ascending=False)
print("\n--- FEATURE IMPORTANCE (Random Forest) ---")
for _, row in importances.iterrows():
    bar = '█' * int(row['importance'] * 80)
    print(f"  {row['feature']:<25} {bar} {row['importance']:.4f}")

# --- PREDICT NEXT 12 HOURS FOR ALL JUNCTIONS ---
print("\n--- NEXT 12-HOUR CONGESTION FORECAST ---")
from datetime import datetime, timedelta
import pytz

ist = pytz.timezone('Asia/Kolkata')
now = datetime.now(ist)
forecast_hours = [(now + timedelta(hours=i)).hour for i in range(12)]
forecast_times = [(now + timedelta(hours=i)).strftime('%H:%M') for i in range(12)]

all_forecasts = {}

for junc in TOP_JUNCTIONS:
    junc_data = hourly[hourly['junction_name']==junc]
    forecasts = []

    for h_offset, hour in enumerate(forecast_hours):
        # Build feature vector for this future hour
        hour_avg = junc_data[junc_data['hour']==hour]['violation_count'].mean()
        hour_sev = junc_data[junc_data['hour']==hour]['severity_mean'].mean()
        hour_hsev = junc_data[junc_data['hour']==hour]['high_sev_count'].mean()
        is_peak = 1 if hour in [2,3,4,5,6] else 0
        is_wknd = 1 if now.weekday() >= 5 else 0
        dow = now.weekday()
        month = now.month
        jcode = junction_map.get(junc, -1)

        # Use rolling avg as lag proxy for future hours
        lag1 = hour_avg if pd.notna(hour_avg) else 0
        lag2 = lag1 * 0.9
        lag3 = lag1 * 0.8
        rolling = lag1

        feat = np.array([[
            lag1, hour_sev if pd.notna(hour_sev) else 1.0,
            hour_hsev if pd.notna(hour_hsev) else 0,
            2.0,  # avg unique vehicles
            lag1, lag2, lag3, rolling,
            is_wknd, is_peak, hour, dow, month, jcode
        ]])

        prob = rf.predict_proba(feat)[0][1]
        pred_violations = lag1 if pd.notna(lag1) else 0

        forecasts.append({
            'time': forecast_times[h_offset],
            'hour': hour,
            'predicted_violations': round(float(pred_violations), 1),
            'congestion_probability': round(float(prob), 3),
            'congestion_level': 'HIGH' if prob >= 0.7 else 'MEDIUM' if prob >= 0.4 else 'LOW',
            'alert': bool(prob >= 0.6)
        })

    short = junc.split(' - ')[-1]
    all_forecasts[junc] = forecasts

    # Print summary
    alerts = [f for f in forecasts if f['alert']]
    print(f"\n  {short[:35]}")
    print(f"    Alert hours: {[f['time'] for f in alerts]}")
    print(f"    Max prob:    {max(f['congestion_probability'] for f in forecasts):.2f}")
    for f in forecasts[:4]:
        level_icon = '🔴' if f['congestion_level']=='HIGH' else '🟡' if f['congestion_level']=='MEDIUM' else '🟢'
        print(f"    {f['time']}: {level_icon} {f['congestion_level']} ({f['congestion_probability']:.2f})")

# Save forecast
forecast_output = {
    'generated_at': now.isoformat(),
    'model': 'RandomForestClassifier',
    'features_used': FEATURES,
    'rf_f1_cv': round(float(rf_scores.mean()), 3),
    'rf_roc_auc': round(float(rf_roc.mean()), 3),
    'lr_f1_cv': round(float(lr_scores.mean()), 3),
    'forecast_window': f"{forecast_times[0]} to {forecast_times[-1]}",
    'junctions': all_forecasts
}

with open('parksight_output/congestion_forecast.json', 'w') as f:
    json.dump(forecast_output, f, indent=2)

# Save model + scaler for dashboard use
import pickle
with open('parksight_output/congestion_model.pkl', 'wb') as f:
    pickle.dump({'rf': rf, 'lr': lr, 'scaler': scaler, 'features': FEATURES}, f)

print("\n\nSaved:")
print("  parksight_output/congestion_forecast.json")
print("  parksight_output/congestion_model.pkl")
print("\nPHASE 3 ML UPGRADE COMPLETE.")
print(f"\nBest model: Random Forest")
print(f"  F1:      {rf_scores.mean():.3f}")
print(f"  ROC-AUC: {rf_roc.mean():.3f}")

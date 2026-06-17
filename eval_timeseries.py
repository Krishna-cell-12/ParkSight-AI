#!/usr/bin/env python3
"""eval_timeseries.py — ParkSight AI: Time-Series Prediction Accuracy"""

import pandas as pd
import numpy as np
import json
from sklearn.metrics import precision_score, recall_score, f1_score

print("=" * 60)
print("TIME-SERIES PREDICTION EVALUATION")
print("=" * 60)

df = pd.read_csv('parksight_output/clean_violations.csv')
df['created_datetime'] = pd.to_datetime(df['created_datetime'], format='mixed', utc=True)
df['date_only'] = df['created_datetime'].dt.date
df['hour'] = df['hour'].astype(int)

TOP_JUNCTIONS = [
    'BTP051 - Safina Plaza Junction',
    'BTP082 - KR Market Junction',
    'BTP040 - Elite Junction',
    'BTP044 - Sagar Theatre Junction',
    'BTP211 - Central Street Junction',
    'BTP020 - Hosahalli Metro Station'
]

junc_df = df[df['junction_name'].isin(TOP_JUNCTIONS)].copy()

# Use first 80% of dates as train, last 20% as test (walk-forward split)
all_dates = sorted(junc_df['date_only'].unique())
split_idx = int(len(all_dates) * 0.8)
train_dates = set(all_dates[:split_idx])
test_dates = set(all_dates[split_idx:])

print(f"\n  Total dates:    {len(all_dates)}")
print(f"  Train dates:    {len(train_dates)} ({list(sorted(train_dates))[0]} to {list(sorted(train_dates))[-1]})")
print(f"  Test dates:     {len(test_dates)} ({list(sorted(test_dates))[0]} to {list(sorted(test_dates))[-1]})")

train_df = junc_df[junc_df['date_only'].isin(train_dates)]
test_df  = junc_df[junc_df['date_only'].isin(test_dates)]

# Build baseline from train
train_baseline = (
    train_df.groupby(['junction_name', 'date_only', 'hour'])
    .size().reset_index(name='count')
    .groupby(['junction_name', 'hour'])
    .agg(mean_count=('count', 'mean'), std_count=('count', 'std'))
    .fillna(0).reset_index()
)

# Evaluate on test
test_actual = (
    test_df.groupby(['junction_name', 'date_only', 'hour'])
    .size().reset_index(name='actual')
)
test_actual = test_actual.merge(train_baseline, on=['junction_name', 'hour'], how='left').fillna(0)
test_actual['predicted']  = test_actual['mean_count']
test_actual['error']      = test_actual['actual'] - test_actual['predicted']
test_actual['abs_error']  = test_actual['error'].abs()
test_actual['sq_error']   = test_actual['error'] ** 2

# Overall metrics
mae  = test_actual['abs_error'].mean()
rmse = np.sqrt(test_actual['sq_error'].mean())
nonzero = test_actual[test_actual['actual'] > 0]
mape = (nonzero['abs_error'] / nonzero['actual']).mean() * 100

print(f"\n  OVERALL PREDICTION ACCURACY (on test set)")
print(f"  {'Metric':<30} {'Value':<15} {'Meaning'}")
print(f"  {'-'*70}")
print(f"  {'MAE (Mean Abs Error)':<30} {mae:<15.2f} avg violations off per hour-slot")
print(f"  {'RMSE (Root Mean Sq Error)':<30} {rmse:<15.2f} penalises large misses more")
print(f"  {'MAPE (Mean Abs % Error)':<30} {mape:<15.1f}% avg % deviation from actual")
print(f"  {'Accuracy (100-MAPE)':<30} {max(0,100-mape):<15.1f}% directional accuracy proxy")

# Per-junction breakdown
print(f"\n  PER-JUNCTION BREAKDOWN:")
print(f"  {'Junction':<35} {'MAE':>6} {'RMSE':>7} {'MAPE':>8} {'Accuracy':>10}")
print(f"  {'-'*70}")
for junc in TOP_JUNCTIONS:
    sub = test_actual[test_actual['junction_name'] == junc]
    if len(sub) == 0:
        continue
    j_mae  = sub['abs_error'].mean()
    j_rmse = np.sqrt(sub['sq_error'].mean())
    nz     = sub[sub['actual'] > 0]
    j_mape = (nz['abs_error'] / nz['actual']).mean() * 100 if len(nz) > 0 else 0
    j_acc  = max(0, 100 - j_mape)
    short  = junc.split(' - ')[-1][:32]
    print(f"  {short:<35} {j_mae:>6.2f} {j_rmse:>7.2f} {j_mape:>7.1f}% {j_acc:>9.1f}%")

# Alert accuracy
print(f"\n  ALERT DETECTION ACCURACY (peak window 2-6AM):")
test_actual['is_peak']     = test_actual['hour'].isin([2,3,4,5,6])
test_actual['pred_alert']  = test_actual['predicted'] > test_actual['predicted'].mean() * 1.5
test_actual['actual_alert']= test_actual['actual']    > test_actual['actual'].mean()    * 1.5

try:
    prec = precision_score(test_actual['actual_alert'], test_actual['pred_alert'], zero_division=0)
    rec  = recall_score(   test_actual['actual_alert'], test_actual['pred_alert'], zero_division=0)
    f1   = f1_score(       test_actual['actual_alert'], test_actual['pred_alert'], zero_division=0)
    print(f"  Precision: {prec:.3f}  (of flagged alerts, how many were real spikes)")
    print(f"  Recall:    {rec:.3f}  (of real spikes, how many did we catch)")
    print(f"  F1 Score:  {f1:.3f}  (balance of precision and recall)")
    if f1 > 0.7:
        print("  Verdict:   GOOD alert detection")
    elif f1 > 0.5:
        print("  Verdict:   FAIR alert detection")
    else:
        print("  Verdict:   NEEDS IMPROVEMENT — consider lower threshold")
except Exception as e:
    print(f"  Could not compute alert metrics: {e}")

print("\nTime-series evaluation complete.")

#!/usr/bin/env python3
"""
phase2_timeseries.py — ParkSight AI Phase 2: Time-Series Prediction
"""

import pandas as pd
import numpy as np
import json
from datetime import datetime

df = pd.read_csv('parksight_output/clean_violations.csv')
df['created_datetime'] = pd.to_datetime(df['created_datetime'], format='mixed', utc=True)
df['date_only'] = df['created_datetime'].dt.date
df['hour'] = df['hour'].astype(int)

# Top 6 junctions from approved data (excluding "No Junction")
TOP_JUNCTIONS = [
    'BTP051 - Safina Plaza Junction',
    'BTP082 - KR Market Junction',
    'BTP040 - Elite Junction',
    'BTP044 - Sagar Theatre Junction',
    'BTP211 - Central Street Junction',
    'BTP020 - Hosahalli Metro Station'
]

# Filter to only top junctions
junc_df = df[df['junction_name'].isin(TOP_JUNCTIONS)].copy()
print(f"Rows in top junctions: {len(junc_df):,}")

# Hourly baseline: average violations per hour per junction across all dates
hourly_baseline = (
    junc_df.groupby(['junction_name', 'date_only', 'hour'])
    .size()
    .reset_index(name='daily_count')
    .groupby(['junction_name', 'hour'])
    .agg(avg_violations=('daily_count', 'mean'),
         std_dev=('daily_count', 'std'))
    .fillna(0)
    .reset_index()
)
hourly_baseline['avg_violations'] = hourly_baseline['avg_violations'].round(2)
hourly_baseline['std_dev'] = hourly_baseline['std_dev'].round(2)

hourly_baseline.to_csv('parksight_output/hourly_baseline.csv', index=False)
print("Hourly baseline saved.")
print("\nSafina Plaza Junction hourly baseline:")
print(hourly_baseline[hourly_baseline['junction_name']=='BTP051 - Safina Plaza Junction'].to_string())

# Build next shift prediction (hours 19→06)
SHIFT_HOURS = [19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5, 6]
global_mean = hourly_baseline['avg_violations'].mean()

prediction = {
    "generated_at": datetime.now().isoformat(),
    "shift_window": "19:00 to 06:00",
    "junctions": {}
}

for junc in TOP_JUNCTIONS:
    junc_data = hourly_baseline[hourly_baseline['junction_name'] == junc]
    preds = []
    alerts = []
    for h in SHIFT_HOURS:
        row = junc_data[junc_data['hour'] == h]
        if len(row) > 0:
            avg = float(row['avg_violations'].values[0])
            std = float(row['std_dev'].values[0])
        else:
            avg = 0.0
            std = 0.0
        preds.append(round(avg, 2))
        alerts.append(bool(avg > global_mean * 1.5))

    peak_idx = preds.index(max(preds))
    prediction['junctions'][junc] = {
        "hours": SHIFT_HOURS,
        "predicted": preds,
        "is_alert": alerts,
        "peak_hour": SHIFT_HOURS[peak_idx],
        "max_predicted": max(preds)
    }

with open('parksight_output/next_shift_prediction.json', 'w') as f:
    json.dump(prediction, f, indent=2)

print("\nNext shift prediction saved.")
print(json.dumps(prediction, indent=2))
print("\nphase2_timeseries.py COMPLETE")

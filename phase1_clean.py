#!/usr/bin/env python3
"""
phase1_clean.py — ParkSight AI Phase 1: Data Loading & Cleaning
Reads the large CSV in chunks, filters, engineers features, and saves outputs.
"""

import pandas as pd
import numpy as np
import json
import os
from tqdm import tqdm

CSV_PATH = "jan to may police violation_anonymized791b166.csv"
OUT_DIR = "parksight_output"
os.makedirs(OUT_DIR, exist_ok=True)

# ──────────────────────────────────────────────────────────────────────────────
# (a) + (b)  Chunked read → concatenate
# ──────────────────────────────────────────────────────────────────────────────
print("Reading CSV in chunks …")
chunks = []
total_raw = 0
for chunk in tqdm(pd.read_csv(CSV_PATH, chunksize=10_000, low_memory=False),
                  desc="Loading chunks"):
    total_raw += len(chunk)
    chunks.append(chunk)

df_raw = pd.concat(chunks, ignore_index=True)
print(f"  → {total_raw:,} total raw rows loaded")

# ──────────────────────────────────────────────────────────────────────────────
# (c)  Filter approved rows
# ──────────────────────────────────────────────────────────────────────────────
df = df_raw[df_raw["validation_status"] == "approved"].copy()
print(f"  → {len(df):,} approved rows after filter")

# ──────────────────────────────────────────────────────────────────────────────
# (d)  Parse created_datetime
# ──────────────────────────────────────────────────────────────────────────────
print("Parsing created_datetime …")
df["created_datetime"] = pd.to_datetime(df["created_datetime"],
                                        format="mixed", utc=True)

# ──────────────────────────────────────────────────────────────────────────────
# (e)  Extract temporal features
# ──────────────────────────────────────────────────────────────────────────────
df["hour"]           = df["created_datetime"].dt.hour
df["day_of_week"]    = df["created_datetime"].dt.dayofweek   # 0=Mon, 6=Sun
df["month"]          = df["created_datetime"].dt.month
df["is_weekend"]     = df["day_of_week"] >= 5
df["is_peak_window"] = (df["hour"] >= 2) & (df["hour"] <= 6)
df["date_only"]      = df["created_datetime"].dt.date

# ──────────────────────────────────────────────────────────────────────────────
# (f)  Parse violation_type JSON array strings
# ──────────────────────────────────────────────────────────────────────────────
print("Parsing violation_type JSON …")
df["vt_list"] = df["violation_type"].apply(
    lambda x: json.loads(x) if isinstance(x, str) else []
)

# ──────────────────────────────────────────────────────────────────────────────
# (g)  severity_weight on ORIGINAL (non-exploded) dataframe
# ──────────────────────────────────────────────────────────────────────────────
HIGH_SEVERITY = {
    "PARKING NEAR ROAD CROSSING",
    "DOUBLE PARKING",
    "PARKING ON FOOTPATH",
    "PARKING NEAR TRAFFIC LIGHT OR ZEBRA CROSS",
}
MED_SEVERITY = {
    "PARKING IN A MAIN ROAD",
    "NO PARKING",
}

def compute_severity(vt_list):
    s = set(vt_list)
    if s & HIGH_SEVERITY:
        return 3
    if s & MED_SEVERITY:
        return 2
    return 1

df["severity_weight"] = df["vt_list"].apply(compute_severity)

# ──────────────────────────────────────────────────────────────────────────────
# (h)  Save cleaned dataframe
# ──────────────────────────────────────────────────────────────────────────────
clean_path = os.path.join(OUT_DIR, "clean_violations.csv")
print(f"Saving cleaned data to {clean_path} …")
df.to_csv(clean_path, index=False)
print(f"  → Saved {len(df):,} rows")

# ──────────────────────────────────────────────────────────────────────────────
# (i)  Exploded dataframe — one row per violation type
# ──────────────────────────────────────────────────────────────────────────────
print("Creating exploded dataframe …")
df_exp = df.explode("vt_list").copy()
df_exp.rename(columns={"vt_list": "violation_type_single"}, inplace=True)
exp_path = os.path.join(OUT_DIR, "violations_exploded.csv")
df_exp.to_csv(exp_path, index=False)
print(f"  → Exploded rows: {len(df_exp):,}")

# ──────────────────────────────────────────────────────────────────────────────
# (j)  Summary report
# ──────────────────────────────────────────────────────────────────────────────
print("\n" + "="*70)
print("SUMMARY REPORT")
print("="*70)

print(f"\nTotal raw rows loaded      : {total_raw:,}")
print(f"Total approved rows        : {len(df):,}")
print(f"Date range                 : {df['created_datetime'].min()} → {df['created_datetime'].max()}")

print("\n── violation_type value counts (top 15, from exploded) ──────────────")
vt_counts = df_exp["violation_type_single"].value_counts().head(15)
print(vt_counts.to_string())

print("\n── vehicle_type value counts (top 10) ───────────────────────────────")
veh_counts = df["vehicle_type"].value_counts().head(10)
print(veh_counts.to_string())

print("\n── hour distribution (0–23) ─────────────────────────────────────────")
hour_dist = df["hour"].value_counts().sort_index()
print(hour_dist.to_string())

print("\n── day_of_week distribution (0=Mon … 6=Sun) ─────────────────────────")
dow_dist = df["day_of_week"].value_counts().sort_index()
day_names = {0:"Mon",1:"Tue",2:"Wed",3:"Thu",4:"Fri",5:"Sat",6:"Sun"}
for k, v in dow_dist.items():
    print(f"  {k} ({day_names[k]}): {v:,}")

print("\n── month distribution ───────────────────────────────────────────────")
month_dist = df["month"].value_counts().sort_index()
month_names = {1:"Jan",2:"Feb",3:"Mar",4:"Apr",5:"May",6:"Jun",
               7:"Jul",8:"Aug",9:"Sep",10:"Oct",11:"Nov",12:"Dec"}
for k, v in month_dist.items():
    print(f"  {k} ({month_names[k]}): {v:,}")

print("\n── is_peak_window counts ────────────────────────────────────────────")
print(df["is_peak_window"].value_counts().to_string())

print("\n── Top 10 police_station by count ───────────────────────────────────")
ps_counts = df["police_station"].value_counts().head(10)
print(ps_counts.to_string())

print("\n── Top 8 junction_name (excluding 'No Junction') ────────────────────")
jn_counts = (df[df["junction_name"] != "No Junction"]["junction_name"]
             .value_counts().head(8))
print(jn_counts.to_string())

print("\n── severity_weight distribution ─────────────────────────────────────")
sev_dist = df["severity_weight"].value_counts().sort_index()
print(sev_dist.to_string())

print("\n" + "="*70)
print("phase1_clean.py COMPLETE")
print("="*70)

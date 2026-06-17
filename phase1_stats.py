#!/usr/bin/env python3
"""
phase1_stats.py — ParkSight AI Phase 1: Save processed statistics as JSON
Reads clean_violations.csv and saves dashboard_stats.json.
"""

import pandas as pd
import json
import os

OUT_DIR = "parksight_output"
os.makedirs(OUT_DIR, exist_ok=True)

print("Loading clean_violations.csv …")
df = pd.read_csv(os.path.join(OUT_DIR, "clean_violations.csv"), low_memory=False)

# ── Derived counts ────────────────────────────────────────────────────────────
total_approved = len(df)

# Re-derive total_raw from the CSV shape before filter — we use the
# approved count only; total_raw was printed in phase1_clean.py (298450)
total_raw = 298450  # known from phase1_clean output

# Date range
df["created_datetime"] = pd.to_datetime(df["created_datetime"], utc=True, errors="coerce")
date_start = str(df["created_datetime"].min().date())
date_end   = str(df["created_datetime"].max().date())

# Hourly distribution
hourly = {str(h): int(df[df["hour"] == h].shape[0]) for h in range(24)}

# Monthly distribution
month_counts = df["month"].value_counts()
monthly = {str(m): int(month_counts.get(m, 0))
           for m in [11, 12, 1, 2, 3, 4]}

# Day-of-week
dow_counts = df["day_of_week"].value_counts()
dow = {str(d): int(dow_counts.get(d, 0)) for d in range(7)}

# Top junctions — hard-coded from domain analysis + geocoding
top_junctions = [
    {"name": "BTP051 - Safina Plaza Junction",           "count": 15449, "lat": 12.9812, "lon": 77.6087},
    {"name": "BTP082 - KR Market Junction",              "count": 11538, "lat": 12.9644, "lon": 77.5772},
    {"name": "BTP040 - Elite Junction",                  "count": 10718, "lat": 12.9691, "lon": 77.5870},
    {"name": "BTP044 - Sagar Theatre Junction",          "count": 10549, "lat": 12.9749, "lon": 77.5789},
    {"name": "BTP211 - Central Street Junction",         "count":  5388, "lat": 12.9784, "lon": 77.5958},
    {"name": "BTP020 - Hosahalli Metro Station",         "count":  4101, "lat": 12.9718, "lon": 77.5108},
]

# Top stations — hard-coded from domain analysis
top_stations = [
    {"name": "Upparpet",          "count": 34468},
    {"name": "Shivajinagar",      "count": 28044},
    {"name": "Malleshwaram",      "count": 22200},
    {"name": "HAL Old Airport",   "count": 20819},
    {"name": "City Market",       "count": 17646},
    {"name": "Vijayanagara",      "count": 14652},
    {"name": "Rajajinagar",       "count": 10998},
    {"name": "Kodigehalli",       "count": 10916},
    {"name": "Magadi Road",       "count":  8558},
    {"name": "Jeevanbheemanagar", "count":  6736},
]

# Vehicle types — compute from actual data, top 6 + Others
veh_counts = df["vehicle_type"].value_counts()
top6_names = ["SCOOTER", "CAR", "MOTOR CYCLE", "PASSENGER AUTO", "MAXI-CAB", "LGV"]
top6_veh = {name: int(veh_counts.get(name, 0)) for name in top6_names}
others_veh = int(veh_counts.sum()) - sum(top6_veh.values())
vehicle_types = {**top6_veh, "OTHERS": others_veh}

# Violation types (from specification)
violation_types = {
    "WRONG PARKING":        164977,
    "NO PARKING":           139050,
    "PARKING IN A MAIN ROAD": 23943,
    "DEFECTIVE NUMBER PLATE":  7848,
    "PARKING ON FOOTPATH":     3757,
}

# Severity distribution (from dataframe)
sev_counts = df["severity_weight"].value_counts()
severity_distribution = {str(k): int(sev_counts.get(k, 0)) for k in [1, 2, 3]}

# Peak window count
peak_window_count = int(df["is_peak_window"].sum()) if "is_peak_window" in df.columns else \
                    int(((df["hour"] >= 2) & (df["hour"] <= 6)).sum())

# Sunday count
sunday_count = int((df["day_of_week"] == 6).sum())

# ── Assemble JSON ─────────────────────────────────────────────────────────────
stats = {
    "total_raw":              total_raw,
    "total_approved":         total_approved,
    "date_range":             {"start": date_start, "end": date_end},
    "hourly":                 hourly,
    "monthly":                monthly,
    "dow":                    dow,
    "top_junctions":          top_junctions,
    "top_stations":           top_stations,
    "vehicle_types":          vehicle_types,
    "violation_types":        violation_types,
    "severity_distribution":  severity_distribution,
    "peak_window_count":      peak_window_count,
    "sunday_count":           sunday_count,
    "scita_sent":             255893,
    "unique_officers":        2666,
    "unique_devices":         3070,
    "unique_stations":        54,
}

out_path = os.path.join(OUT_DIR, "dashboard_stats.json")
with open(out_path, "w") as f:
    json.dump(stats, f, indent=2)

print(f"\nSaved: {out_path}")
print("\n── JSON Content ─────────────────────────────────────────────────────────")
print(json.dumps(stats, indent=2))
print("\nphase1_stats.py COMPLETE")

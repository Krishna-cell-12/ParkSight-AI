#!/usr/bin/env python3
"""eval_model_info.py — ParkSight AI: ML Engine Model Inventory Report"""

import pandas as pd
import numpy as np
import json
from sklearn.cluster import DBSCAN
from sklearn import __version__ as sklearn_version
import sys

print("=" * 60)
print("PARKSIGHT AI — ML ENGINE DIAGNOSTIC REPORT")
print("=" * 60)

print("\n📦 ENVIRONMENT")
print(f"  Python:        {sys.version.split()[0]}")
print(f"  scikit-learn:  {sklearn_version}")
print(f"  pandas:        {pd.__version__}")
print(f"  numpy:         {np.__version__}")

print("\n🤖 MODEL 1 — HOTSPOT DETECTION")
print("  Algorithm:     DBSCAN (Density-Based Spatial Clustering of Applications with Noise)")
print("  Library:       sklearn.cluster.DBSCAN")
print("  Why DBSCAN:    No need to predefine cluster count. Finds arbitrary-shape zones.")
print("                 Naturally marks isolated one-off violations as noise (-1 label).")
print("                 Haversine metric works directly on lat/lon without projection.")
print("  Parameters used:")
print("    eps          = 300 metres (converted to radians: 300/6371000)")
print("    min_samples  = 30 violations minimum to form a zone")
print("    algorithm    = ball_tree (optimised for haversine distance)")
print("    metric       = haversine")
print("  Input features: latitude, longitude only (spatial clustering)")
print("  Output:         cluster_id label per violation (-1 = noise)")

print("\n📐 MODEL 2 — IMPACT SCORING")
print("  Algorithm:     Weighted Linear Scoring Formula (rule-based, interpretable)")
print("  Why not ML:    No ground truth labels for 'congestion impact' exist in dataset.")
print("                 Rule-based scoring is explainable to judges and city officials.")
print("  Formula:")
print("    Impact_Score = (")
print("        norm_violation_count  * 0.40   # volume drives congestion")
print("        + high_severity_ratio * 0.35   # junction/footpath blockage type")
print("        + peak_hour_ratio     * 0.25   # 2AM-6AM window concentration")
print("    ) * 10")
print("  Severity weights assigned:")
print("    HIGH (3):   PARKING NEAR ROAD CROSSING, DOUBLE PARKING,")
print("                PARKING ON FOOTPATH, PARKING NEAR TRAFFIC LIGHT")
print("    MEDIUM (2): PARKING IN A MAIN ROAD, NO PARKING")
print("    LOW (1):    WRONG PARKING, all others")

print("\n📈 MODEL 3 — TIME-SERIES PREDICTION")
print("  Algorithm:     Rolling Hourly Baseline (statistical, not ML)")
print("  Method:        Group violations by junction + date + hour,")
print("                 compute mean and std per junction per hour of day,")
print("                 alert when predicted > mean * 1.5")
print("  Why not LSTM/Prophet: 6 months of data is sufficient for hourly baselines.")
print("                        Simple rolling mean is interpretable and fast.")
print("  Output:        next_shift_prediction.json with per-hour violation forecasts")

# Load cluster results
clusters_df = pd.read_csv('parksight_output/hotspot_clusters.csv')
with open('parksight_output/enforcement_priority.json') as f:
    priority = json.load(f)

print("\n" + "=" * 60)
print("📊 CLUSTERING RESULTS SUMMARY")
print("=" * 60)
print(f"  Total clusters found:       {len(clusters_df)}")
print(f"  Total active zones:         {priority['total_active_zones']}")
print(f"  Avg impact score:           {priority['avg_impact_score']}")
print(f"  Top impact score:           {priority['top_impact_score']}")
print(f"  Score range:                {clusters_df['impact_score'].min():.2f} — {clusters_df['impact_score'].max():.2f}")

# Cluster size distribution
print(f"\n  Cluster size distribution:")
print(f"    Min violations/cluster:   {clusters_df['violation_count'].min()}")
print(f"    Max violations/cluster:   {clusters_df['violation_count'].max()}")
print(f"    Median violations:        {clusters_df['violation_count'].median():.0f}")
print(f"    Mean violations:          {clusters_df['violation_count'].mean():.1f}")
print(f"    Std dev:                  {clusters_df['violation_count'].std():.1f}")

# Score distribution
bins = [0, 1, 2, 3, 4, 5, 6]
labels_bins = ['0-1','1-2','2-3','3-4','4-5','5-6']
clusters_df['score_bin'] = pd.cut(clusters_df['impact_score'], bins=bins, labels=labels_bins)
print(f"\n  Impact score distribution:")
for label, count in clusters_df['score_bin'].value_counts().sort_index().items():
    bar = '█' * count
    print(f"    {label}: {bar} ({count} zones)")

print("\nModel info report complete.")

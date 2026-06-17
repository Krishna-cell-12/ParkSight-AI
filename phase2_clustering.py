#!/usr/bin/env python3
"""
phase2_clustering.py — ParkSight AI Phase 2: DBSCAN Hotspot Clustering
"""

import pandas as pd
import numpy as np
import json
import ast
from collections import Counter
from sklearn.cluster import DBSCAN

# Load clean data
df = pd.read_csv('parksight_output/clean_violations.csv')

# Parse vt_list back from string (stored as string in CSV)
df['vt_list'] = df['vt_list'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else [])

# Parse is_peak_window and is_weekend back to bool
df['is_peak_window'] = df['is_peak_window'].astype(bool)
df['is_weekend'] = df['is_weekend'].astype(bool)

# Drop rows with missing lat/lon
df = df.dropna(subset=['latitude', 'longitude'])
print(f"Rows with lat/lon: {len(df):,}")

# DBSCAN with haversine metric (300 metre radius)
coords_rad = np.radians(df[['latitude', 'longitude']].values)
eps_rad = 300 / 6371000
db = DBSCAN(eps=eps_rad, min_samples=30, algorithm='ball_tree',
            metric='haversine').fit(coords_rad)
df['cluster_id'] = db.labels_

print(f"Total clusters found (excl noise): {df[df['cluster_id']>=0]['cluster_id'].nunique()}")
print(f"Noise points: {(df['cluster_id']==-1).sum()}")

# HIGH SEVERITY violation types list
HIGH_SEV = ["PARKING NEAR ROAD CROSSING", "DOUBLE PARKING", "PARKING ON FOOTPATH",
            "PARKING NEAR TRAFFIC LIGHT OR ZEBRA CROSS"]
MEDIUM_SEV = ["PARKING IN A MAIN ROAD", "NO PARKING"]

# For each cluster compute stats
cluster_rows = df[df['cluster_id'] >= 0]
results = []

for cid, grp in cluster_rows.groupby('cluster_id'):
    count = len(grp)
    centroid_lat = grp['latitude'].mean()
    centroid_lon = grp['longitude'].mean()

    # Junction name: most common excluding "No Junction"
    junc_counts = grp[grp['junction_name'] != 'No Junction']['junction_name'].value_counts()
    dominant_junction = junc_counts.index[0] if len(junc_counts) > 0 else 'Unknown Zone'

    # Station
    dominant_station = grp['police_station'].mode()[0] if len(grp) > 0 else 'Unknown'

    # Peak hour ratio
    peak_hour_ratio = grp['is_peak_window'].sum() / count

    # Severity ratios
    all_vts = [v for lst in grp['vt_list'] for v in lst]
    high_sev_count = sum(1 for v in all_vts if v in HIGH_SEV)
    med_sev_count = sum(1 for v in all_vts if v in MEDIUM_SEV)
    total_vts = len(all_vts) if len(all_vts) > 0 else 1
    high_severity_ratio = high_sev_count / total_vts
    medium_severity_ratio = med_sev_count / total_vts

    # Dominant vehicle
    dominant_vehicle = grp['vehicle_type'].mode()[0] if len(grp) > 0 else 'UNKNOWN'

    # Top violation type
    vt_counter = Counter(all_vts)
    top_violation = vt_counter.most_common(1)[0][0] if vt_counter else 'UNKNOWN'

    # Sunday ratio
    sunday_ratio = (grp['day_of_week'] == 6).sum() / count

    results.append({
        'cluster_id': cid,
        'violation_count': count,
        'centroid_lat': round(centroid_lat, 6),
        'centroid_lon': round(centroid_lon, 6),
        'dominant_junction': dominant_junction,
        'dominant_station': dominant_station,
        'peak_hour_ratio': round(peak_hour_ratio, 4),
        'high_severity_ratio': round(high_severity_ratio, 4),
        'medium_severity_ratio': round(medium_severity_ratio, 4),
        'dominant_vehicle': dominant_vehicle,
        'top_violation': top_violation,
        'sunday_ratio': round(sunday_ratio, 4),
    })

clusters_df = pd.DataFrame(results)

# Normalise violation count
min_c = clusters_df['violation_count'].min()
max_c = clusters_df['violation_count'].max()
clusters_df['norm_count'] = (clusters_df['violation_count'] - min_c) / (max_c - min_c)

# IMPACT SCORE
clusters_df['impact_score'] = (
    clusters_df['norm_count']          * 0.40 +
    clusters_df['high_severity_ratio'] * 0.35 +
    clusters_df['peak_hour_ratio']     * 0.25
) * 10
clusters_df['impact_score'] = clusters_df['impact_score'].round(2)

# Sort by impact score
clusters_df = clusters_df.sort_values('impact_score', ascending=False).reset_index(drop=True)

# Save
clusters_df.to_csv('parksight_output/hotspot_clusters.csv', index=False)
print(f"\nSaved hotspot_clusters.csv ({len(clusters_df)} clusters)")

# Print top 10
print("\nTOP 10 HOTSPOT CLUSTERS:")
print("="*90)
for _, row in clusters_df.head(10).iterrows():
    print(f"Cluster {int(row['cluster_id']):4d} | {row['dominant_junction'][:35]:35s} | "
          f"Count: {int(row['violation_count']):5d} | Score: {row['impact_score']:4.1f} | "
          f"Station: {row['dominant_station']}")
print(f"\nTotal clusters: {len(clusters_df)}")
print("\nphase2_clustering.py COMPLETE")

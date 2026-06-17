#!/usr/bin/env python3
"""eval_clustering.py — ParkSight AI: Clustering Quality Metrics"""

import pandas as pd
import numpy as np
from sklearn.metrics import silhouette_score, davies_bouldin_score, calinski_harabasz_score
from sklearn.cluster import DBSCAN

print("=" * 60)
print("CLUSTERING QUALITY EVALUATION")
print("=" * 60)

df = pd.read_csv('parksight_output/clean_violations.csv')
df = df.dropna(subset=['latitude', 'longitude'])

# Sample for metric computation (silhouette is O(n^2), use sample)
sample_size = 10000
df_sample = df.sample(n=min(sample_size, len(df)), random_state=42)

coords_rad = np.radians(df_sample[['latitude', 'longitude']].values)
eps_rad = 300 / 6371000
db = DBSCAN(eps=eps_rad, min_samples=30, algorithm='ball_tree',
            metric='haversine').fit(coords_rad)
labels = db.labels_

n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
n_noise = (labels == -1).sum()
n_clustered = (labels >= 0).sum()
noise_ratio = n_noise / len(labels)
clustered_ratio = n_clustered / len(labels)

print(f"\n  Sample size used:           {len(df_sample)}")
print(f"  Clusters found:             {n_clusters}")
print(f"  Noise points:               {n_noise} ({noise_ratio*100:.1f}%)")
print(f"  Clustered points:           {n_clustered} ({clustered_ratio*100:.1f}%)")

# Only compute metrics on clustered points (need >=2 clusters)
mask = labels >= 0
if mask.sum() > 0 and n_clusters >= 2:
    coords_clustered = df_sample[['latitude', 'longitude']].values[mask]
    labels_clustered = labels[mask]

    print("\n  Computing quality metrics (on clustered points only)...")

    # Silhouette Score: -1 to 1. Higher = better separated clusters
    sil = silhouette_score(coords_clustered, labels_clustered,
                           metric='euclidean', sample_size=min(5000, len(coords_clustered)))
    print(f"\n  Silhouette Score:           {sil:.4f}")
    print(f"    Interpretation:           ", end="")
    if sil > 0.5:
        print("GOOD — clusters are well-separated and dense")
    elif sil > 0.25:
        print("FAIR — reasonable cluster structure")
    elif sil > 0:
        print("WEAK — clusters overlap, consider tuning eps")
    else:
        print("POOR — points closer to other clusters than their own")

    # Davies-Bouldin: lower = better (0 is perfect)
    db_score = davies_bouldin_score(coords_clustered, labels_clustered)
    print(f"\n  Davies-Bouldin Score:       {db_score:.4f}")
    print(f"    Interpretation:           Lower is better. 0 = perfect separation.")
    if db_score < 0.5:
        print("                             EXCELLENT cluster separation")
    elif db_score < 1.0:
        print("                             GOOD cluster separation")
    elif db_score < 2.0:
        print("                             MODERATE separation")
    else:
        print("                             WEAK — clusters may be merging")

    # Calinski-Harabasz: higher = better
    ch_score = calinski_harabasz_score(coords_clustered, labels_clustered)
    print(f"\n  Calinski-Harabasz Score:    {ch_score:.2f}")
    print(f"    Interpretation:           Higher = more distinct, compact clusters.")

else:
    print("\n  Not enough clusters to compute quality metrics.")
    print("  This happens when eps merges most points into one cluster.")
    print("  Recommendation: reduce eps to 150m or increase min_samples.")

# Cluster stability test: try several eps values, compare cluster counts
print("\n" + "=" * 60)
print("EPS SENSITIVITY ANALYSIS (cluster count vs radius)")
print("=" * 60)
for eps_m in [100, 200, 300, 500, 800]:
    eps_r = eps_m / 6371000
    db_test = DBSCAN(eps=eps_r, min_samples=30, algorithm='ball_tree',
                     metric='haversine').fit(coords_rad)
    lbl = db_test.labels_
    nc = len(set(lbl)) - (1 if -1 in lbl else 0)
    nn = (lbl == -1).sum()
    print(f"  eps={eps_m:4d}m → {nc:4d} clusters | {nn:5d} noise points ({nn/len(lbl)*100:.1f}%)")

print("\nClustering evaluation complete.")

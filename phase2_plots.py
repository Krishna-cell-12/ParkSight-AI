#!/usr/bin/env python3
"""
phase2_plots.py — ParkSight AI Phase 2: Visualisation Plots
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import json
import os

# --- Plot 1: Cluster Map ---
df = pd.read_csv('parksight_output/clean_violations.csv')
clusters_df = pd.read_csv('parksight_output/hotspot_clusters.csv')

fig, ax = plt.subplots(figsize=(14, 12))
fig.patch.set_facecolor('#0B1220')
ax.set_facecolor('#0B1220')

# Plot noise points first
if 'cluster_id' not in df.columns:
    ax.scatter(df['longitude'], df['latitude'], c='#2A3A4A', s=0.3, alpha=0.3, rasterized=True)
else:
    noise = df[df['cluster_id'] == -1]
    ax.scatter(noise['longitude'], noise['latitude'], c='#2A3A4A', s=0.2, alpha=0.2, rasterized=True)

# Plot top 6 clusters with distinct colours
COLORS = ['#EF4444', '#F97316', '#EAB308', '#10B981', '#3B82F6', '#8B5CF6']
top6 = clusters_df.head(6)
for i, (_, row) in enumerate(top6.iterrows()):
    ax.scatter(row['centroid_lon'], row['centroid_lat'],
               c=COLORS[i], s=row['impact_score']*80, marker='*',
               zorder=5, edgecolors='white', linewidths=0.5)
    short_name = str(row['dominant_junction']).split(' - ')[-1] if ' - ' in str(row['dominant_junction']) else str(row['dominant_junction'])
    ax.annotate(f"{short_name}\n(Score: {row['impact_score']})",
                (row['centroid_lon'], row['centroid_lat']),
                textcoords="offset points", xytext=(10, 5),
                fontsize=8, color='white',
                bbox=dict(boxstyle='round,pad=0.3', facecolor='#1C2A3A', edgecolor=COLORS[i], alpha=0.85))

ax.set_title('ParkSight AI — Violation Hotspot Clusters, Bengaluru', color='white', fontsize=14, fontweight='bold', pad=15)
ax.set_xlabel('Longitude', color='#8DA4BE', fontsize=11)
ax.set_ylabel('Latitude', color='#8DA4BE', fontsize=11)
ax.tick_params(colors='#8DA4BE')
for spine in ax.spines.values():
    spine.set_edgecolor('#2A3A4A')

# Add all clustered points coloured by cluster membership
clustered = df[df['cluster_id'] >= 0] if 'cluster_id' in df.columns else pd.DataFrame()
if len(clustered) > 0:
    scatter = ax.scatter(clustered['longitude'], clustered['latitude'],
                         c=clustered['cluster_id'], cmap='tab20', s=0.8,
                         alpha=0.4, rasterized=True, zorder=2)

plt.tight_layout()
plt.savefig('parksight_output/cluster_map.png', dpi=150, bbox_inches='tight', facecolor='#0B1220')
plt.close()
print("cluster_map.png saved.")

# --- Plot 2: Impact Scores Bar Chart ---
with open('parksight_output/enforcement_priority.json') as f:
    priority = json.load(f)

zones = [p['zone_name'][:30] for p in priority['priority_list']]
scores = [p['impact_score'] for p in priority['priority_list']]
colors_bar = ['#EF4444' if s>=8.5 else '#F97316' if s>=7 else '#EAB308' if s>=5 else '#6B7280'
              for s in scores]

fig, ax = plt.subplots(figsize=(12, 7))
fig.patch.set_facecolor('#0B1220')
ax.set_facecolor('#0B1220')

bars = ax.barh(zones[::-1], scores[::-1], color=colors_bar[::-1], height=0.6, edgecolor='none')
ax.axvline(x=8.5, color='#EF4444', linestyle='--', linewidth=1.2, alpha=0.7, label='Critical threshold (8.5)')
ax.text(8.55, -0.6, 'Critical\nthreshold', color='#EF4444', fontsize=8, va='bottom')

for bar, score in zip(bars, scores[::-1]):
    ax.text(score + 0.05, bar.get_y() + bar.get_height()/2,
            f'{score:.1f}', va='center', ha='left', color='white', fontsize=10, fontweight='bold')

ax.set_xlim(0, 11)
ax.set_xlabel('Impact Score (0–10)', color='#8DA4BE', fontsize=11)
ax.set_title('Enforcement Priority — Impact Scores by Zone', color='white', fontsize=13, fontweight='bold', pad=12)
ax.tick_params(colors='#8DA4BE', labelsize=9)
for spine in ax.spines.values():
    spine.set_edgecolor('#2A3A4A')

legend_patches = [
    mpatches.Patch(color='#EF4444', label='CRITICAL (≥8.5)'),
    mpatches.Patch(color='#F97316', label='HIGH (≥7.0)'),
    mpatches.Patch(color='#EAB308', label='MEDIUM (≥5.0)'),
]
ax.legend(handles=legend_patches, loc='lower right', facecolor='#1C2A3A',
          edgecolor='#2A3A4A', labelcolor='white', fontsize=9)

plt.tight_layout()
plt.savefig('parksight_output/impact_scores.png', dpi=150, bbox_inches='tight', facecolor='#0B1220')
plt.close()
print("impact_scores.png saved.")

# --- Print final file list ---
print("\nPHASE 2 COMPLETE — Files in parksight_output/:")
for fname in sorted(os.listdir('parksight_output/')):
    size = os.path.getsize(f'parksight_output/{fname}')
    print(f"  {fname:<45} {size/1024:.1f} KB")

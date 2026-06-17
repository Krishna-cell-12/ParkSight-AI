#!/usr/bin/env python3
"""eval_report_chart.py — ParkSight AI: Full ML Diagnostic Visual Report"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec
import json

clusters_df = pd.read_csv('parksight_output/hotspot_clusters_v2.csv')
df = pd.read_csv('parksight_output/clean_violations.csv', low_memory=False)
df['hour'] = df['hour'].astype(int)

fig = plt.figure(figsize=(18, 14))
fig.patch.set_facecolor('#0B1220')
gs = gridspec.GridSpec(3, 3, figure=fig, hspace=0.45, wspace=0.35)

NAVY   = '#0B1220'
PANEL  = '#162032'
BLUE   = '#3B82F6'
CYAN   = '#06B6D4'
RED    = '#EF4444'
ORANGE = '#F97316'
GREEN  = '#10B981'
YELLOW = '#EAB308'
TEXT   = '#E8EDF4'
MUTED  = '#8DA4BE'

def style_ax(ax):
    ax.set_facecolor(PANEL)
    ax.tick_params(colors=MUTED, labelsize=8)
    for spine in ax.spines.values():
        spine.set_edgecolor('#2A3A4A')
    ax.title.set_color(TEXT)
    ax.title.set_fontsize(10)
    ax.title.set_fontweight('bold')

# ── Plot 1: Cluster size distribution (log scale) ────────────────────────────
ax1 = fig.add_subplot(gs[0, 0])
style_ax(ax1)
counts = clusters_df['violation_count'].sort_values(ascending=False)
colors_c = [RED if v > 10000 else ORANGE if v > 500 else BLUE for v in counts]
ax1.bar(range(len(counts)), counts.values, color=colors_c, width=1.0, edgecolor='none')
ax1.set_yscale('log')
ax1.set_xlabel('Cluster rank', color=MUTED, fontsize=8)
ax1.set_ylabel('Violations (log)', color=MUTED, fontsize=8)
ax1.set_title('Cluster Size Distribution')
ax1.axhline(y=10000, color=RED, linestyle='--', linewidth=0.8, alpha=0.6)
ax1.text(2, 12000, 'Mega-cluster', color=RED, fontsize=7)

# ── Plot 2: Impact score v2 histogram ────────────────────────────────────────
ax2 = fig.add_subplot(gs[0, 1])
style_ax(ax2)
scores = clusters_df['impact_score_v2']
ax2.hist(scores, bins=20, color=CYAN, edgecolor=NAVY, linewidth=0.5)
ax2.axvline(x=scores.mean(), color=YELLOW, linestyle='--', linewidth=1.2,
            label=f'Mean: {scores.mean():.1f}')
ax2.set_xlabel('Impact Score', color=MUTED, fontsize=8)
ax2.set_ylabel('Number of zones', color=MUTED, fontsize=8)
ax2.set_title('Impact Score Distribution (v2 log-norm)')
ax2.legend(fontsize=7, facecolor=PANEL, edgecolor='#2A3A4A', labelcolor=TEXT)

# ── Plot 3: Score components scatter ─────────────────────────────────────────
ax3 = fig.add_subplot(gs[0, 2])
style_ax(ax3)
sc = ax3.scatter(clusters_df['peak_hour_ratio'],
                 clusters_df['high_severity_ratio'],
                 c=clusters_df['impact_score_v2'],
                 cmap='RdYlGn', s=clusters_df['norm_count']*200+10,
                 alpha=0.7, edgecolors='none')
ax3.set_xlabel('Peak Hour Ratio (2-6AM)', color=MUTED, fontsize=8)
ax3.set_ylabel('High Severity Ratio', color=MUTED, fontsize=8)
ax3.set_title('Score Components: Peak vs Severity')
cbar = plt.colorbar(sc, ax=ax3)
cbar.ax.tick_params(colors=MUTED, labelsize=7)
cbar.set_label('Impact Score', color=MUTED, fontsize=7)

# ── Plot 4: Top 10 zones impact score bar ────────────────────────────────────
ax4 = fig.add_subplot(gs[1, :2])
style_ax(ax4)
top10 = clusters_df.head(10)
zones = [str(r['dominant_junction']).split(' - ')[-1][:25] for _, r in top10.iterrows()]
scores10 = top10['impact_score_v2'].values
bar_colors = [RED if s>=8.5 else ORANGE if s>=7 else YELLOW if s>=5 else BLUE for s in scores10]
bars = ax4.barh(zones[::-1], scores10[::-1], color=bar_colors[::-1], height=0.6, edgecolor='none')
ax4.axvline(x=7.0, color=ORANGE, linestyle='--', linewidth=0.8, alpha=0.6)
ax4.axvline(x=8.5, color=RED,    linestyle='--', linewidth=0.8, alpha=0.6)
for bar, score in zip(bars, scores10[::-1]):
    ax4.text(score + 0.1, bar.get_y() + bar.get_height()/2,
             f'{score:.1f}', va='center', ha='left', color=TEXT, fontsize=8, fontweight='bold')
ax4.set_xlabel('Impact Score (v2 log-normalised)', color=MUTED, fontsize=8)
ax4.set_title('Top 10 Zones — Impact Score (Log-Normalised)')
ax4.set_xlim(0, 11)

# ── Plot 5: Hourly pattern for top 4 junctions ───────────────────────────────
ax5 = fig.add_subplot(gs[1, 2])
style_ax(ax5)
TOP4    = ['BTP051 - Safina Plaza Junction', 'BTP082 - KR Market Junction',
           'BTP040 - Elite Junction',        'BTP044 - Sagar Theatre Junction']
COLORS4 = [RED, ORANGE, CYAN, GREEN]
for junc, col in zip(TOP4, COLORS4):
    sub = df[df['junction_name'] == junc]
    if len(sub) == 0:
        continue
    hourly = sub.groupby('hour').size().reindex(range(24), fill_value=0)
    short  = junc.split(' - ')[-1].split(' ')[0]
    ax5.plot(range(24), hourly.values, color=col, linewidth=1.5, label=short, alpha=0.9)
ax5.axvspan(2, 6, alpha=0.1, color=RED, label='Peak window')
ax5.set_xlabel('Hour of day', color=MUTED, fontsize=8)
ax5.set_ylabel('Violations', color=MUTED, fontsize=8)
ax5.set_title('Hourly Pattern — Top 4 Junctions')
ax5.legend(fontsize=6, facecolor=PANEL, edgecolor='#2A3A4A', labelcolor=TEXT, ncol=2)
ax5.set_xticks([0, 4, 8, 12, 16, 20, 23])

# ── Plot 6: Spatial scatter of all clusters ───────────────────────────────────
ax6 = fig.add_subplot(gs[2, :2])
style_ax(ax6)
sizes = np.log1p(clusters_df['violation_count']) * 5
sc2 = ax6.scatter(clusters_df['centroid_lon'], clusters_df['centroid_lat'],
                   c=clusters_df['impact_score_v2'], cmap='RdYlGn',
                   s=sizes, alpha=0.8, edgecolors='none')
for _, row in clusters_df.head(5).iterrows():
    short = str(row['dominant_junction']).split(' - ')[-1][:20]
    ax6.annotate(short, (row['centroid_lon'], row['centroid_lat']),
                 fontsize=7, color='white',
                 xytext=(5, 5), textcoords='offset points')
cbar2 = plt.colorbar(sc2, ax=ax6)
cbar2.ax.tick_params(colors=MUTED, labelsize=7)
cbar2.set_label('Impact Score v2', color=MUTED, fontsize=7)
ax6.set_xlabel('Longitude', color=MUTED, fontsize=8)
ax6.set_ylabel('Latitude',  color=MUTED, fontsize=8)
ax6.set_title('Spatial Distribution — All 118 Clusters (size = log violations)')

# ── Plot 7: Score v1 vs v2 comparison ────────────────────────────────────────
ax7 = fig.add_subplot(gs[2, 2])
style_ax(ax7)
ax7.scatter(clusters_df['impact_score'], clusters_df['impact_score_v2'],
            color=CYAN, s=20, alpha=0.6, edgecolors='none')
ax7.set_xlabel('Score v1 (linear norm)', color=MUTED, fontsize=8)
ax7.set_ylabel('Score v2 (log norm)',    color=MUTED, fontsize=8)
ax7.set_title('Score v1 vs v2 Comparison')
ax7.plot([0, 6], [0, 10], color=MUTED, linestyle='--', linewidth=0.8, alpha=0.4)

fig.suptitle('ParkSight AI — Full ML Engine Diagnostic Report',
             color=TEXT, fontsize=14, fontweight='bold', y=0.98)

plt.savefig('parksight_output/ml_diagnostic_report.png',
            dpi=150, bbox_inches='tight', facecolor=NAVY)
plt.close()
print("ml_diagnostic_report.png saved.")

# ── Final summary ─────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("FULL DIAGNOSTIC COMPLETE")
print("="*60)
print("Models used:")
print("  1. DBSCAN          — spatial hotspot clustering")
print("  2. Weighted scorer — impact quantification formula")
print("  3. Rolling baseline — shift prediction")
print("\nKey accuracy numbers:")
print("  Clustering: check Silhouette + DB scores above")
print("  Prediction: check MAE, RMSE, MAPE above")
print("  Impact v2:  log-normalised scores in hotspot_clusters_v2.csv")
print("\nNew files saved:")
print("  parksight_output/hotspot_clusters_v2.csv  (improved scores)")
print("  parksight_output/ml_diagnostic_report.png (full visual report)")

#!/usr/bin/env python3
"""
phase1_eda.py — ParkSight AI Phase 1: Exploratory Data Analysis Charts
Reads clean_violations.csv and violations_exploded.csv, generates 6 PNG charts.
"""

import pandas as pd
import numpy as np
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.colors as mcolors
import os

OUT_DIR = "parksight_output"
os.makedirs(OUT_DIR, exist_ok=True)

# Shared style
plt.rcParams.update({
    "figure.facecolor": "#1a1a2e",
    "axes.facecolor":   "#16213e",
    "axes.edgecolor":   "#e0e0e0",
    "axes.labelcolor":  "#e0e0e0",
    "xtick.color":      "#e0e0e0",
    "ytick.color":      "#e0e0e0",
    "text.color":       "#e0e0e0",
    "grid.color":       "#2d3561",
    "grid.linestyle":   "--",
    "grid.alpha":       0.5,
    "font.family":      "DejaVu Sans",
})

print("Loading clean_violations.csv …")
df = pd.read_csv(os.path.join(OUT_DIR, "clean_violations.csv"), low_memory=False)

print("Loading violations_exploded.csv …")
df_exp = pd.read_csv(os.path.join(OUT_DIR, "violations_exploded.csv"), low_memory=False)

# ─────────────────────────────────────────────────────────────────────────────
# CHART 1 — Hourly violation distribution
# ─────────────────────────────────────────────────────────────────────────────
print("\nGenerating Chart 1: hourly_violations.png …")
hour_counts = df["hour"].value_counts().sort_index()

fig, ax = plt.subplots(figsize=(14, 5))
fig.patch.set_facecolor("#1a1a2e")
ax.set_facecolor("#16213e")

PEAK_HOURS = {2, 3, 4, 5, 6}
bar_colors = ["#e63946" if h in PEAK_HOURS else "#4a90d9" for h in range(24)]

bars = ax.bar(range(24), [hour_counts.get(h, 0) for h in range(24)],
              color=bar_colors, edgecolor="none", width=0.8)

# Annotate peak
peak_x = 4  # centre of 2-6 range
peak_y = max(hour_counts.get(h, 0) for h in PEAK_HOURS)
ax.annotate("Peak: 2AM–6AM",
            xy=(peak_x, peak_y),
            xytext=(peak_x + 3.5, peak_y + 1000),
            fontsize=11, color="#e63946", fontweight="bold",
            arrowprops=dict(arrowstyle="->", color="#e63946", lw=1.5))

ax.set_xlim(-0.5, 23.5)
ax.set_xticks(range(24))
ax.set_xticklabels([f"{h}:00" for h in range(24)], rotation=45, ha="right", fontsize=8)
ax.set_xlabel("Hour of Day", fontsize=12)
ax.set_ylabel("Number of Violations", fontsize=12)
ax.set_title("Hourly Violation Distribution — Bengaluru BTP Data",
             fontsize=14, fontweight="bold", pad=15)
ax.yaxis.grid(True)
ax.set_axisbelow(True)

plt.tight_layout()
out1 = os.path.join(OUT_DIR, "hourly_violations.png")
plt.savefig(out1, dpi=150, bbox_inches="tight")
plt.close()
print(f"  → Saved: {out1}")

# ─────────────────────────────────────────────────────────────────────────────
# CHART 2 — Top 12 violation types (horizontal bar)
# ─────────────────────────────────────────────────────────────────────────────
print("\nGenerating Chart 2: violation_types.png …")
vt_counts = df_exp["violation_type_single"].value_counts().head(12).sort_values()

fig, ax = plt.subplots(figsize=(10, 7))
fig.patch.set_facecolor("#1a1a2e")
ax.set_facecolor("#16213e")

import matplotlib
n = len(vt_counts)
cmap = matplotlib.colormaps["Blues"].resampled(n + 4)
colors = [cmap(i + 4) for i in range(n)]  # darkest at end (highest count)

bars = ax.barh(vt_counts.index, vt_counts.values,
               color=colors, edgecolor="none", height=0.7)

for bar, val in zip(bars, vt_counts.values):
    ax.text(bar.get_width() + vt_counts.values.max() * 0.01,
            bar.get_y() + bar.get_height() / 2,
            f"{val:,}", va="center", ha="left", fontsize=9, color="#e0e0e0")

ax.set_xlabel("Number of Violations", fontsize=12)
ax.set_title("Violation Type Distribution", fontsize=14, fontweight="bold", pad=15)
ax.xaxis.grid(True)
ax.set_axisbelow(True)
ax.tick_params(axis="y", labelsize=9)

plt.tight_layout()
out2 = os.path.join(OUT_DIR, "violation_types.png")
plt.savefig(out2, dpi=150, bbox_inches="tight")
plt.close()
print(f"  → Saved: {out2}")

# ─────────────────────────────────────────────────────────────────────────────
# CHART 3 — Vehicle types pie chart
# ─────────────────────────────────────────────────────────────────────────────
print("\nGenerating Chart 3: vehicle_types.png …")
veh_counts = df["vehicle_type"].value_counts()
top6 = veh_counts.head(6)
others_sum = veh_counts.iloc[6:].sum()

labels = list(top6.index) + ["Others"]
sizes  = list(top6.values) + [others_sum]

fig, ax = plt.subplots(figsize=(8, 8))
fig.patch.set_facecolor("#1a1a2e")
ax.set_facecolor("#1a1a2e")

palette = ["#4a90d9", "#e63946", "#f4a261", "#2a9d8f", "#e9c46a", "#a8dadc", "#6c757d"]

wedges, texts, autotexts = ax.pie(
    sizes, labels=labels, autopct="%1.1f%%",
    colors=palette[:len(labels)],
    pctdistance=0.82, labeldistance=1.1,
    startangle=140,
    wedgeprops={"edgecolor": "#1a1a2e", "linewidth": 2},
)
for t in texts:
    t.set_color("#e0e0e0")
    t.set_fontsize(10)
for at in autotexts:
    at.set_color("white")
    at.set_fontsize(9)
    at.set_fontweight("bold")

ax.set_title("Violations by Vehicle Type", fontsize=14, fontweight="bold",
             color="#e0e0e0", pad=20)

plt.tight_layout()
out3 = os.path.join(OUT_DIR, "vehicle_types.png")
plt.savefig(out3, dpi=150, bbox_inches="tight")
plt.close()
print(f"  → Saved: {out3}")

# ─────────────────────────────────────────────────────────────────────────────
# CHART 4 — Monthly trend (line + markers)
# ─────────────────────────────────────────────────────────────────────────────
print("\nGenerating Chart 4: monthly_trend.png …")
month_counts = df["month"].value_counts().sort_index()

month_name_map = {
    1: "Jan", 2: "Feb", 3: "Mar", 4: "Apr", 5: "May", 6: "Jun",
    7: "Jul", 8: "Aug", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dec"
}
# Keep only months present in data, in chronological order
# Data spans Nov–Apr (months 11,12,1,2,3,4)
ordered_months = [m for m in [11, 12, 1, 2, 3, 4] if m in month_counts.index]
counts  = [month_counts[m] for m in ordered_months]
xlabels = [month_name_map[m] for m in ordered_months]

fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_facecolor("#1a1a2e")
ax.set_facecolor("#16213e")

ax.plot(xlabels, counts, color="#4a90d9", linewidth=2.5, marker="o",
        markersize=10, markerfacecolor="#e63946", markeredgecolor="white",
        markeredgewidth=1.5, zorder=5)

for x, y in zip(xlabels, counts):
    ax.annotate(f"{y:,}", (x, y), textcoords="offset points",
                xytext=(0, 12), ha="center", fontsize=10,
                color="#e0e0e0", fontweight="bold")

ax.fill_between(xlabels, counts, alpha=0.15, color="#4a90d9")
ax.set_xlabel("Month", fontsize=12)
ax.set_ylabel("Number of Violations", fontsize=12)
ax.set_title("Monthly Violation Trend", fontsize=14, fontweight="bold", pad=15)
ax.yaxis.grid(True)
ax.set_axisbelow(True)

plt.tight_layout()
out4 = os.path.join(OUT_DIR, "monthly_trend.png")
plt.savefig(out4, dpi=150, bbox_inches="tight")
plt.close()
print(f"  → Saved: {out4}")

# ─────────────────────────────────────────────────────────────────────────────
# CHART 5 — Top 10 police stations
# ─────────────────────────────────────────────────────────────────────────────
print("\nGenerating Chart 5: top_stations.png …")
station_counts = df["police_station"].value_counts().head(10).sort_values()

HIGHLIGHT = {"Upparpet", "Shivajinagar"}
colors5 = ["#e63946" if s in HIGHLIGHT else "#4a90d9"
           for s in station_counts.index]

fig, ax = plt.subplots(figsize=(10, 7))
fig.patch.set_facecolor("#1a1a2e")
ax.set_facecolor("#16213e")

bars = ax.barh(station_counts.index, station_counts.values,
               color=colors5, edgecolor="none", height=0.7)

for bar, val in zip(bars, station_counts.values):
    ax.text(bar.get_width() + station_counts.values.max() * 0.01,
            bar.get_y() + bar.get_height() / 2,
            f"{val:,}", va="center", ha="left", fontsize=10,
            color="#e0e0e0", fontweight="bold")

ax.set_xlabel("Number of Violations", fontsize=12)
ax.set_title("Top 10 Police Stations by Violation Count",
             fontsize=14, fontweight="bold", pad=15)
ax.xaxis.grid(True)
ax.set_axisbelow(True)

# Legend
from matplotlib.patches import Patch
legend_elements = [Patch(facecolor="#e63946", label="Highlighted stations"),
                   Patch(facecolor="#4a90d9", label="Other stations")]
ax.legend(handles=legend_elements, loc="lower right",
          facecolor="#1a1a2e", edgecolor="#2d3561", labelcolor="#e0e0e0")

plt.tight_layout()
out5 = os.path.join(OUT_DIR, "top_stations.png")
plt.savefig(out5, dpi=150, bbox_inches="tight")
plt.close()
print(f"  → Saved: {out5}")

# ─────────────────────────────────────────────────────────────────────────────
# CHART 6 — Day of week violations
# ─────────────────────────────────────────────────────────────────────────────
print("\nGenerating Chart 6: dow_violations.png …")
dow_counts = df["day_of_week"].value_counts().sort_index()
day_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
colors6 = ["#e63946" if d == 6 else "#4a90d9" for d in range(7)]

fig, ax = plt.subplots(figsize=(10, 5))
fig.patch.set_facecolor("#1a1a2e")
ax.set_facecolor("#16213e")

ax.bar(day_labels, [dow_counts.get(d, 0) for d in range(7)],
       color=colors6, edgecolor="none", width=0.7)

ax.set_xlabel("Day of Week", fontsize=12)
ax.set_ylabel("Number of Violations", fontsize=12)
ax.set_title("Violations by Day of Week (Sunday Effect)",
             fontsize=14, fontweight="bold", pad=15)
ax.yaxis.grid(True)
ax.set_axisbelow(True)

# Annotate Sunday
sun_val = dow_counts.get(6, 0)
ax.annotate(f"Sunday: {sun_val:,}",
            xy=(6, sun_val),
            xytext=(5.2, sun_val + 500),
            fontsize=10, color="#e63946", fontweight="bold",
            arrowprops=dict(arrowstyle="->", color="#e63946", lw=1.5))

plt.tight_layout()
out6 = os.path.join(OUT_DIR, "dow_violations.png")
plt.savefig(out6, dpi=150, bbox_inches="tight")
plt.close()
print(f"  → Saved: {out6}")

# ─────────────────────────────────────────────────────────────────────────────
# Final check
# ─────────────────────────────────────────────────────────────────────────────
print("\n" + "="*60)
print("All 6 charts saved. File sizes:")
for fname in ["hourly_violations.png", "violation_types.png",
              "vehicle_types.png", "monthly_trend.png",
              "top_stations.png", "dow_violations.png"]:
    fpath = os.path.join(OUT_DIR, fname)
    size = os.path.getsize(fpath)
    print(f"  {fname:35s} {size:>10,} bytes  ({size/1024:.1f} KB)")
print("="*60)
print("phase1_eda.py COMPLETE")

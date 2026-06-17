#!/usr/bin/env python3
"""
phase2_priority.py — ParkSight AI Phase 2: Enforcement Priority Ranking
"""

import pandas as pd
import json
from datetime import datetime

clusters_df = pd.read_csv('parksight_output/hotspot_clusters.csv')
top10 = clusters_df.head(10).copy()

priority_list = []
for rank, (_, row) in enumerate(top10.iterrows(), 1):
    score = float(row['impact_score'])
    if score >= 8.5:
        severity = "CRITICAL"
        officers = 3
    elif score >= 7.0:
        severity = "HIGH"
        officers = 2
    elif score >= 5.0:
        severity = "MEDIUM"
        officers = 1
    else:
        severity = "LOW"
        officers = 1

    relief = int(round(score * 8.5))
    zone = str(row['dominant_junction'])
    # Shorten BTP code for display
    display_name = zone.replace('BTP051 - ', '').replace('BTP082 - ', '').replace(
        'BTP040 - ', '').replace('BTP044 - ', '').replace('BTP211 - ', '').replace(
        'BTP020 - ', '').replace('BTP058 - ', '').replace('BTP027 - ', '')

    priority_list.append({
        "rank": rank,
        "zone_name": display_name,
        "full_junction_name": zone,
        "station": str(row['dominant_station']),
        "violation_count": int(row['violation_count']),
        "impact_score": score,
        "severity_label": severity,
        "officers_recommended": officers,
        "estimated_delay_relief_minutes": relief,
        "top_violation": str(row['top_violation']),
        "peak_hour_ratio": f"{float(row['peak_hour_ratio'])*100:.1f}%",
        "dominant_vehicle": str(row['dominant_vehicle']),
        "centroid_lat": float(row['centroid_lat']),
        "centroid_lon": float(row['centroid_lon']),
        "high_severity_ratio": f"{float(row['high_severity_ratio'])*100:.1f}%",
        "sunday_ratio": f"{float(row['sunday_ratio'])*100:.1f}%"
    })

output = {
    "generated_at": datetime.now().isoformat(),
    "total_active_zones": len(clusters_df),
    "critical_zones": sum(1 for p in priority_list if p['severity_label']=='CRITICAL'),
    "high_zones": sum(1 for p in priority_list if p['severity_label']=='HIGH'),
    "avg_impact_score": round(float(clusters_df['impact_score'].mean()), 1),
    "top_impact_score": round(float(clusters_df['impact_score'].max()), 2),
    "priority_list": priority_list
}

with open('parksight_output/enforcement_priority.json', 'w') as f:
    json.dump(output, f, indent=2)

print("enforcement_priority.json saved.\n")
print(json.dumps(output, indent=2))

# Clean summary table
print("\n" + "="*85)
print(f"{'RANK':<5} {'ZONE':<32} {'SCORE':<7} {'SEVERITY':<10} {'OFFICERS':<10} {'RELIEF':<8} {'STATION'}")
print("="*85)
for p in priority_list:
    print(f"{p['rank']:<5} {p['zone_name'][:31]:<32} {p['impact_score']:<7.1f} "
          f"{p['severity_label']:<10} {p['officers_recommended']:<10} "
          f"{p['estimated_delay_relief_minutes']:<8} {p['station']}")
print("\nphase2_priority.py COMPLETE")

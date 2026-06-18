import pandas as pd, json

clusters = pd.read_csv('parksight_output/hotspot_clusters_v2.csv')
with open('parksight_output/next_shift_prediction.json') as f:
    prediction = json.load(f)

# Build markers data for Google Maps
markers = []
for _, row in clusters.iterrows():
    score = float(row['impact_score_v2'])
    count = int(row['violation_count'])
    # Color by impact score
    if score >= 7:
        color = '#EF4444'
    elif score >= 5:
        color = '#F97316'
    elif score >= 3:
        color = '#EAB308'
    else:
        color = '#3B82F6'

    markers.append({
        'cluster_id': int(row['cluster_id']),
        'lat': float(row['centroid_lat']),
        'lng': float(row['centroid_lon']),
        'zone_name': str(row['dominant_junction']).split(' - ')[-1],
        'full_name': str(row['dominant_junction']),
        'station': str(row['dominant_station']),
        'violation_count': count,
        'impact_score': round(score, 2),
        'peak_hour_ratio': float(row['peak_hour_ratio']),
        'high_severity_ratio': float(row['high_severity_ratio']),
        'top_violation': str(row['top_violation']),
        'dominant_vehicle': str(row['dominant_vehicle']),
        'color': color,
        'radius_metres': 300,
        'marker_scale': min(60, max(10, count / 1000))
    })

# Build heatmap points (each violation location as a weighted point)
# Use cluster centroids weighted by violation count for heatmap
heatmap_points = [
    {'lat': m['lat'], 'lng': m['lng'], 'weight': min(10, m['violation_count'] / 7000)}
    for m in markers
]

output = {
    'markers': markers,
    'heatmap_points': heatmap_points,
    'map_center': {'lat': 12.9716, 'lng': 77.5946},
    'default_zoom': 12,
    'total_clusters': len(markers),
    'prediction': prediction
}

with open('parksight_output/maps_data.json', 'w') as f:
    json.dump(output, f, indent=2)

print(f"Exported {len(markers)} cluster markers to maps_data.json")
print("Sample marker:", json.dumps(markers[0], indent=2))

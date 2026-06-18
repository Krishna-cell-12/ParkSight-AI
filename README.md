# ParkSight AI 🅿

> **Gridlock 2.0 Hackathon Submission**
> AI-driven parking violation intelligence for smarter traffic enforcement

[![Built with React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite-61DAFB?logo=react)](https://react.dev)
[![ML](https://img.shields.io/badge/ML-scikit--learn%201.9-F7931E?logo=scikitlearn)](https://scikit-learn.org)
[![Maps](https://img.shields.io/badge/Maps-Google%20Maps%20API-4285F4?logo=googlemaps)](https://developers.google.com/maps)
[![Data](https://img.shields.io/badge/Data-115%2C400%20BTP%20Records-10B981)](https://data.gov.in)

---

## Problem Statement

On-street illegal parking and spillover parking near commercial areas,
metro stations, and events choke carriageways and intersections across
Bengaluru. Current enforcement is patrol-based and reactive — there is
no heatmap of violations vs congestion impact, and it is difficult to
prioritise enforcement zones.

**How can AI-driven parking intelligence detect illegal parking hotspots,
quantify their impact on traffic flow, and enable targeted enforcement?**

---

## Solution — ParkSight AI

ParkSight transforms 115,400 real Bengaluru Traffic Police challan
records into a live enforcement intelligence system with three capabilities:

| Capability | What it does |
|---|---|
| **Hotspot Detection** | DBSCAN clustering identifies 118 persistent violation zones from GPS coordinates |
| **Congestion Impact Scoring** | Weighted formula quantifies each zone's traffic impact (volume + severity + peak hours) |
| **Predictive Enforcement** | Random Forest predicts next-day violation counts per junction with confidence intervals |

---

## Live Dashboard

### Pages

| Page | Description |
|---|---|
| **Overview** | KPI cards, Google Maps heatmap, violation trends, enforcement priority |
| **Hotspots** | All 118 DBSCAN clusters on live Google Map |
| **Violations** | Hourly distribution, vehicle types, violation type breakdown |
| **Impact Analysis** | ML model metrics, cluster quality scores, feature importance |
| **Enforcement** | Ranked dispatch table with officer recommendation engine |
| **Forecast** | Random Forest congestion probability curves — next shift |
| **Next Day** | 7-day ahead predictions per junction with risk classification |
| **Reports** | Full stats export to CSV |
| **Alerts** | Real-time zone alerts derived from ML predictions |
| **Settings** | Theme toggle, notification preferences |

### Features
- 🗺 **Google Maps integration** — dark-styled live map with 300m DBSCAN zone circles
- 🔥 **Violation heatmap layer** — density overlay from cluster centroids
- 🚦 **Live traffic layer** — toggle real-time Bengaluru traffic
- 🌙 **Dark / Light mode** — persisted in localStorage
- 📥 **CSV export** — download full enforcement priority report
- 📱 **Responsive layout** — works on tablet and desktop

---

## ML Pipeline

### Dataset
- **Source:** Bengaluru Traffic Police (BTP) challan records
- **Raw records:** 298,450
- **Approved (training set):** 115,400
- **Date range:** Nov 9, 2023 – Mar 29, 2024
- **Coverage:** 54 police stations · 2,666 officers · 3,070 patrol devices

### Models

#### Model 1 — DBSCAN Hotspot Clustering
Algorithm:  DBSCAN (sklearn.cluster.DBSCAN)

Metric:     Haversine (lat/lon → radians)

eps:        300 metres (= 300/6371000 radians)

min_samples: 30

Result:     118 clusters · 3,088 noise points
**Quality metrics:**
- Silhouette Score: **0.61** (GOOD)
- Davies-Bouldin Score: **0.33** (EXCELLENT)
- Calinski-Harabasz: **27,282** (highly distinct clusters)

#### Model 2 — Impact Scoring Formula
Impact_Score = (

normalised_violation_count × 0.40

high_severity_ratio        × 0.35
peak_hour_ratio            × 0.25

) × 10

Severity weights:

HIGH (3):   Parking near junction, double parking,

footpath parking, near traffic light

MEDIUM (2): Parking in main road, no parking

LOW (1):    Wrong parking, others
Normalisation: log-normalised to prevent mega-cluster dominance

#### Model 3 — Next-Day Random Forest
Algorithm:   RandomForestRegressor / GradientBoostingRegressor

(best selected per junction via TimeSeriesSplit CV)

Features:    20 features including:

lag_1d, lag_2d, lag_3d, lag_7d

roll_3d, roll_7d, roll_14d, roll_7d_std

dow_hist_avg, month_hist_avg, trend_7d

dow, month, is_weekend, is_sunday

avg_severity, high_sev_ratio, peak_hour_ratio

Validation:  TimeSeriesSplit (5 folds) — respects temporal order

**Accuracy by junction:**

| Junction | Model | MAE | R² | Accuracy |
|---|---|---|---|---|
| Safina Plaza | RandomForest | 6.32 | 0.233 | 23.3% |
| KR Market | RandomForest | 4.31 | 0.912 | 91.2% |
| Elite Junction | RandomForest | 0.53 | 0.998 | 99.8% |
| Sagar Theatre | RandomForest | 0.60 | 0.998 | 99.8% |
| Central Street | RandomForest | 2.74 | 0.829 | 82.9% |
| Hosahalli Metro | RandomForest | 17.11 | 0.628 | 62.8% |
| **City-wide** | **RandomForest** | 102.24 | 0.824 | 82.4% |


#### Model 4 — Congestion Probability (Random Forest Classifier)
Target:    Binary — high congestion risk (1) or not (0)

Features:  14 features (violation counts + time + severity)

ROC-AUC:   0.81

F1 Score:  0.73

---

## Key Findings from Data

| Finding | Value | Source |
|---|---|---|
| Top hotspot | Safina Plaza Junction — 68,494 violations | DBSCAN cluster |
| Peak window | 2 AM – 6 AM (highest enforcement gap) | Hourly analysis |
| Top violator | Scooter (32% of approved violations) | vehicle_type column |
| Worst day | Sunday — 15.6% of all violations | DOW analysis |
| Top station | Upparpet PS — highest zone density | police_station column |
| Data to SCITA | 85.7% already forwarded | data_sent_to_scita column |

---

## Project Structure
parksight-ai/

├── README.md

│

├── # Python ML Pipeline

├── phase1_clean.py              # Data cleaning + feature engineering

├── phase1_eda.py                # EDA charts (6 PNG outputs)

├── phase1_stats.py              # Statistics export to JSON

├── phase2_clustering.py         # DBSCAN hotspot clustering

├── phase2_timeseries.py         # Hourly baseline + shift prediction

├── phase2_priority.py           # Enforcement priority ranking

├── phase2_plots.py              # Cluster map + impact score charts

├── phase3_nextday_model.py      # Next-day Random Forest predictor

├── phase3_congestion_model.py   # Congestion probability classifier

├── generate_real_data.py        # Compiles all ML outputs → realData.js

│

├── parksight_output/            # All ML outputs (auto-generated)

│   ├── clean_violations.csv     # 115,400 approved records

│   ├── hotspot_clusters_v2.csv  # 118 DBSCAN clusters (log-normalised)

│   ├── enforcement_priority.json

│   ├── nextday_forecast.json    # 7-day predictions per junction

│   ├── next_shift_prediction.json

│   ├── congestion_forecast.json

│   ├── dashboard_stats.json

│   └── ml_diagnostic_report.png

│

└── parksight-dashboard/         # React frontend

├── src/

│   ├── data/realData.js     # Single source of truth (auto-generated)

│   ├── context/ThemeContext.jsx

│   ├── components/

│   │   ├── layout/          # Sidebar, Header, Layout

│   │   ├── kpi/             # KPICard with count-up animation

│   │   ├── charts/          # 5 Recharts components

│   │   ├── map/             # Google Maps integration

│   │   └── panels/          # Hotspot table, Congestion, Priority

│   └── pages/               # 10 pages

├── .env                     # VITE_GOOGLE_MAPS_API_KEY

└── vite.config.js

---

## How to Run

### Prerequisites
- Python 3.10+
- Node.js 18+
- Google Maps API key (Maps JavaScript API + Visualization API enabled)

### Step 1 — Run the ML pipeline
```bash
# Install Python dependencies
pip install pandas numpy scikit-learn matplotlib seaborn tqdm pytz

# Run all phases in order
python phase1_clean.py
python phase1_eda.py
python phase1_stats.py
python phase2_clustering.py
python phase2_timeseries.py
python phase2_priority.py
python phase2_plots.py
python phase3_nextday_model.py
python phase3_congestion_model.py

# Compile all outputs into the dashboard data file
python generate_real_data.py
```

### Step 2 — Configure Google Maps
```bash
# Create .env file in parksight-dashboard/
echo "VITE_GOOGLE_MAPS_API_KEY=your_api_key_here" > parksight-dashboard/.env
```

### Step 3 — Run the dashboard
```bash
cd parksight-dashboard
npm install
npm run dev
# Open http://localhost:5173
```

### Step 4 — Production build
```bash
cd parksight-dashboard
npm run build
npm run preview
# Open http://localhost:4173
```

---

## Tech Stack

### Frontend
| Library | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| Recharts | latest | Charts |
| @vis.gl/react-google-maps | latest | Google Maps |
| lucide-react | 0.383 | Icons |
| clsx | latest | Class utilities |

### ML / Backend
| Library | Version | Purpose |
|---|---|---|
| pandas | 3.0.3 | Data processing |
| scikit-learn | 1.9.0 | DBSCAN, RF, evaluation |
| numpy | 2.4.6 | Numerical computation |
| matplotlib | latest | EDA charts |

---

## Deployment Note

The dataset (`jan_to_may_police_violation_anonymized791b166.csv`)
is not included in this repository due to file size (104 MB).
Place it in the project root before running the ML pipeline.

The `parksight_output/` folder and `realData.js` are also excluded
from version control — they are generated by running the pipeline above.

Add these to `.gitignore`:
parksight_output/

parksight-dashboard/src/data/realData.js

parksight-dashboard/.env

parksight-dashboard/dist/

*.pkl

*.csv

pycache/

---

## Team

Built for **Gridlock 2.0** — Smart City Traffic Management Hackathon

---

*ParkSight AI — turning Bengaluru's own challan data into its enforcement strategy.*

---

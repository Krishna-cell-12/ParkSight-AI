import { useState, useCallback, useEffect } from 'react'
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { HOTSPOT_CLUSTERS } from '../data/realData'
import { useTheme } from '../context/ThemeContext'

const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 }
const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// Dark map style matching our dashboard theme
const DARK_MAP_STYLES = [
  { elementType: 'geometry',           stylers: [{ color: '#0d1b2a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0B1120' }] },
  { elementType: 'labels.text.fill',   stylers: [{ color: '#4A6580' }] },
  { featureType: 'road',               elementType: 'geometry',
    stylers: [{ color: '#1C2A3A' }] },
  { featureType: 'road.arterial',      elementType: 'geometry',
    stylers: [{ color: '#162032' }] },
  { featureType: 'road.highway',       elementType: 'geometry',
    stylers: [{ color: '#1C3A5C' }] },
  { featureType: 'road.highway',       elementType: 'labels.text.fill',
    stylers: [{ color: '#3B82F6' }] },
  { featureType: 'water',              elementType: 'geometry',
    stylers: [{ color: '#0B1120' }] },
  { featureType: 'water',              elementType: 'labels.text.fill',
    stylers: [{ color: '#8DA4BE' }] },
  { featureType: 'poi',                stylers: [{ visibility: 'off' }] },
  { featureType: 'transit',            stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative',     elementType: 'geometry',
    stylers: [{ color: '#1C2A3A' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill',
    stylers: [{ color: '#8DA4BE' }] },
]

const LIGHT_MAP_STYLES = [
  { featureType: 'poi',     stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
]

// Color map by violation count
function getClusterColor(rank, violations) {
  if (rank === 1 || violations > 10000) return '#EF4444'
  if (rank <= 3 || violations > 5000)  return '#F97316'
  if (rank <= 5 || violations > 1000)  return '#F59E0B'
  return '#3B82F6'
}

// Inner component — has access to map instance
function MapOverlays({ clusters, onClusterClick, selectedCluster }) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const visualizationLib = useMapsLibrary('visualization')

  // Draw circles and heatmap once libraries are loaded
  useEffect(() => {
    if (!map || !mapsLib) return
    // Circles are drawn via the CircleOverlay component below
  }, [map, mapsLib])

  return null
}

// Individual cluster circle overlay
function ClusterCircle({ cluster, onClick, isSelected }) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const [circle, setCircle] = useState(null)
  const [infoWindow, setInfoWindow] = useState(null)

  useEffect(() => {
    if (!map || !mapsLib) return

    const color = getClusterColor(cluster.rank, cluster.violations)

    const c = new mapsLib.Circle({
      map,
      center: { lat: cluster.lat, lng: cluster.lng },
      radius: 300,
      fillColor: color,
      fillOpacity: isSelected ? 0.45 : 0.25,
      strokeColor: color,
      strokeOpacity: isSelected ? 1.0 : 0.75,
      strokeWeight: isSelected ? 2.5 : 1.5,
      clickable: true,
      zIndex: cluster.rank === 1 ? 10 : cluster.rank,
    })

    const iw = new mapsLib.InfoWindow({
      content: `
        <div style="
          background:#1C2A3A;color:#E8EDF4;padding:12px 14px;
          border-radius:10px;font-family:system-ui,sans-serif;
          min-width:200px;border:1px solid rgba(99,140,190,0.2)
        ">
          <div style="font-size:13px;font-weight:700;margin-bottom:8px;
            color:#E8EDF4;border-bottom:1px solid rgba(99,140,190,0.15);
            padding-bottom:6px">${cluster.name}</div>
          <div style="display:flex;flex-direction:column;gap:5px">
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:#8DA4BE">Station</span>
              <span style="color:#E8EDF4;font-weight:600">${cluster.station}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:#8DA4BE">Violations</span>
              <span style="color:#EF4444;font-weight:700">${cluster.violations.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:#8DA4BE">Impact Score</span>
              <span style="color:#F59E0B;font-weight:600">${cluster.score}/10</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:#8DA4BE">Peak window</span>
              <span style="color:#E8EDF4">${cluster.peakRatio}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:11px">
              <span style="color:#8DA4BE">Top vehicle</span>
              <span style="color:#E8EDF4">${cluster.vehicle}</span>
            </div>
          </div>
          <button onclick="window.parkSightDispatch('${cluster.name}')" style="
            margin-top:10px;width:100%;padding:6px;border-radius:6px;
            background:#1C3A5C;border:1px solid #3B82F6;color:#3B82F6;
            font-size:11px;font-weight:600;cursor:pointer
          ">Dispatch Officer →</button>
        </div>
      `,
      disableAutoPan: false,
    })

    c.addListener('click', () => {
      iw.open({ map, anchor: { position: { lat: cluster.lat, lng: cluster.lng } } })
      onClick(cluster)
    })

    c.addListener('mouseover', () => {
      c.setOptions({ fillOpacity: 0.45, strokeOpacity: 1.0 })
    })

    c.addListener('mouseout', () => {
      if (!isSelected) c.setOptions({ fillOpacity: 0.25, strokeOpacity: 0.75 })
    })

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCircle(c)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInfoWindow(iw)

    return () => {
      c.setMap(null)
      iw.close()
    }
  }, [map, mapsLib])

  useEffect(() => {
    if (!circle) return
    const color = getClusterColor(cluster.rank, cluster.violations)
    circle.setOptions({
      fillOpacity: isSelected ? 0.45 : 0.25,
      strokeOpacity: isSelected ? 1.0 : 0.75,
      strokeWeight: isSelected ? 2.5 : 1.5,
    })
  }, [isSelected, circle])

  return null
}

// Heatmap layer using visualization library
function ViolationHeatmap({ clusters, visible }) {
  const map = useMap()
  const visualizationLib = useMapsLibrary('visualization')
  const coreLib = useMapsLibrary('core')
  const [heatmap, setHeatmap] = useState(null)

  useEffect(() => {
    if (!map || !visualizationLib || !coreLib) return

    try {
      const points = clusters.map(c => ({
        location: new coreLib.LatLng(c.lat, c.lng),
        weight: Math.log1p(c.violations || 0) / Math.log1p(68494),
      }))

      const h = new visualizationLib.HeatmapLayer({
        data: points,
        radius: 40,
        opacity: 0.7,
        gradient: [
          'rgba(0,0,0,0)',
          'rgba(29,78,216,0.6)',
          'rgba(124,58,237,0.7)',
          'rgba(220,38,38,0.85)',
          'rgba(252,165,165,1)',
        ],
      })

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeatmap(h)
      return () => h.setMap(null)
    } catch (err) {
      console.error('Heatmap init error:', err)
    }
  }, [map, visualizationLib, coreLib, clusters])

  useEffect(() => {
    if (!heatmap) return
    heatmap.setMap(visible ? map : null)
  }, [visible, heatmap, map])

  return null
}

// Traffic layer toggle
function TrafficLayer({ visible }) {
  const map = useMap()
  const mapsLib = useMapsLibrary('maps')
  const [layer, setLayer] = useState(null)

  useEffect(() => {
    if (!map || !mapsLib) return
    const tl = new mapsLib.TrafficLayer()
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLayer(tl)
    return () => tl.setMap(null)
  }, [map, mapsLib])

  useEffect(() => {
    if (!layer) return
    layer.setMap(visible ? map : null)
  }, [visible, layer, map])

  return null
}

// Main exported component
export default function ParkSightMap({ clusters = HOTSPOT_CLUSTERS }) {
  const { isDark } = useTheme()
  const [selectedCluster, setSelectedCluster] = useState(null)
  const [showHeatmap, setShowHeatmap] = useState(false)
  const [showTraffic, setShowTraffic] = useState(false)
  const [mapType, setMapType] = useState('roadmap')

  // Register global dispatch handler for InfoWindow button
  useEffect(() => {
    window.parkSightDispatch = (zoneName) => {
      console.log('Dispatch requested for:', zoneName)
      // Can be wired to Enforcement page state in Phase 5
    }
  }, [])

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden">

      {/* Map Controls Toolbar */}
      <div className="absolute top-3 right-3 z-10 flex gap-2">
        <button
          type="button"
          onClick={() => setMapType(t => t === 'roadmap' ? 'satellite' : 'roadmap')}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border
            bg-navy-700/90 border-navy-500 text-gray-300
            hover:bg-navy-600 backdrop-blur-sm transition-all"
        >
          {mapType === 'roadmap' ? '🛰 Satellite' : '🗺 Map'}
        </button>
        <button
          type="button"
          onClick={() => setShowTraffic(v => !v)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border
            backdrop-blur-sm transition-all ${
            showTraffic
              ? 'bg-green-600/80 border-green-500 text-white'
              : 'bg-navy-700/90 border-navy-500 text-gray-300 hover:bg-navy-600'
          }`}
        >
          🚦 Traffic {showTraffic ? 'ON' : 'OFF'}
        </button>
        <button
          type="button"
          onClick={() => setShowHeatmap(v => !v)}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg border
            backdrop-blur-sm transition-all ${
            showHeatmap
              ? 'bg-orange-600/80 border-orange-500 text-white'
              : 'bg-navy-700/90 border-navy-500 text-gray-300 hover:bg-navy-600'
          }`}
        >
          🔥 Heatmap {showHeatmap ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Cluster count badge */}
      <div className="absolute top-3 left-3 z-10
        px-3 py-1.5 rounded-lg text-xs font-semibold
        bg-navy-700/90 border border-navy-500 text-gray-300 backdrop-blur-sm">
        {clusters.length} zones · {clusters.reduce((a, c) => a + c.violations, 0).toLocaleString()} violations
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 z-10
        px-3 py-2 rounded-lg text-[10px]
        bg-navy-700/90 border border-navy-500 backdrop-blur-sm">
        <div className="text-gray-400 mb-1.5 font-medium">Violation Intensity</div>
        <div className="flex items-center gap-1.5">
          <div className="w-24 h-2 rounded-full"
            style={{background:'linear-gradient(to right, #3B82F6, #F59E0B, #EF4444)'}} />
          <span className="text-gray-500 ml-1">Low</span>
          <span className="text-gray-500 ml-auto">High</span>
        </div>
        <div className="flex gap-3 mt-2">
          {[
            { color:'#EF4444', label:'>10K viol.' },
            { color:'#F97316', label:'5-10K'     },
            { color:'#F59E0B', label:'1-5K'      },
            { color:'#3B82F6', label:'<1K'       },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected cluster panel */}
      {selectedCluster && (
        <div className="absolute bottom-3 right-3 z-10 w-52
          bg-navy-700/95 border border-navy-500 rounded-xl p-3
          backdrop-blur-sm text-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="font-semibold text-gray-200 leading-tight pr-2">
              {selectedCluster.name}
            </span>
            <button onClick={() => setSelectedCluster(null)}
              className="text-gray-500 hover:text-gray-300 flex-shrink-0">✕</button>
          </div>
          <div className="space-y-1.5">
            {[
              ['Station',    selectedCluster.station],
              ['Violations', selectedCluster.violations.toLocaleString()],
              ['Score',      `${selectedCluster.score}/10`],
              ['Peak ratio', selectedCluster.peakRatio],
              ['Vehicle',    selectedCluster.vehicle],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between">
                <span className="text-gray-500">{k}</span>
                <span className="text-gray-200 font-medium">{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Google Map */}
      <APIProvider apiKey={API_KEY} libraries={['visualization']}>
        <Map
          mapId="parksight-map"
          defaultCenter={BENGALURU_CENTER}
          defaultZoom={12}
          mapTypeId={mapType}
          styles={isDark ? DARK_MAP_STYLES : LIGHT_MAP_STYLES}
          disableDefaultUI={false}
          gestureHandling="greedy"
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          {clusters.map(cluster => (
            <ClusterCircle
              key={cluster.rank}
              cluster={cluster}
              onClick={setSelectedCluster}
              isSelected={selectedCluster?.rank === cluster.rank}
            />
          ))}
          <ViolationHeatmap clusters={clusters} visible={showHeatmap} />
          <TrafficLayer visible={showTraffic} />
        </Map>
      </APIProvider>
    </div>
  )
}

import clsx from 'clsx';
import KPICard from '../components/kpi/KPICard';
import ParkSightMap from '../map/ParkSightMap';
import ViolationsLineChart from '../components/charts/ViolationsLineChart';
import ViolationTypesDonut from '../components/charts/ViolationTypesDonut';
import HotspotTable from '../components/panels/HotspotTable';
import CongestionSummary from '../components/panels/CongestionSummary';
import EnforcementPriority from '../components/panels/EnforcementPriority';
import { Maximize2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import {
  KPI_DATA,
  VIOLATIONS_OVER_TIME,
  VIOLATION_TYPES,
  HOTSPOT_CLUSTERS,
  ENFORCEMENT_PRIORITY,
  CONGESTION_SUMMARY,
} from '../data/realData';

export default function Overview({ onNavigate }) {
  const { isDark } = useTheme();

  const panelClass = clsx(
    'rounded-xl border p-4',
    isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
  );

  return (
    <div className="flex flex-col h-full overflow-auto p-6 gap-5">

      {/* ── 1. KPI Row ── */}
      <div className="grid grid-cols-4 gap-4">
        {KPI_DATA.map(kpi => (
          <KPICard key={kpi.id} {...kpi} />
        ))}
      </div>

      {/* ── 2. Middle Row — responsive 12-col grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* Heatmap (8 / 12 cols on lg+) */}
        <div className={clsx(panelClass, 'lg:col-span-8 flex flex-col min-h-[360px]')}>
          <div className="flex items-center justify-between mb-3">
            <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
              Violation Hotspots
            </h3>
            <div className="flex items-center gap-2">
              <select className={clsx(
                'text-xs border rounded-md px-2 py-1 outline-none cursor-pointer',
                isDark ? 'bg-navy-600 border-navy-500 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
              )}>
                <option>Heatmap</option>
                <option>Cluster</option>
              </select>
              <Maximize2 size={14} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ParkSightMap clusters={HOTSPOT_CLUSTERS} />
          </div>
        </div>

        {/* Right sidebar — charts stack (4 / 12 cols on lg+) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <ViolationsLineChart data={VIOLATIONS_OVER_TIME} />
          <ViolationTypesDonut data={VIOLATION_TYPES} />
        </div>
      </div>

      {/* ── 3. Bottom Row ── */}
      <div className="grid grid-cols-3 gap-4">
        <HotspotTable
          clusters={HOTSPOT_CLUSTERS.slice(0, 5)}
          onNavigate={onNavigate}
        />
        <CongestionSummary
          data={CONGESTION_SUMMARY}
          onNavigate={onNavigate}
        />
        <EnforcementPriority
          priorities={ENFORCEMENT_PRIORITY}
          onNavigate={onNavigate}
        />
      </div>

      {/* ── 4. Footer Bar ── */}
      <div className={clsx(
        'flex items-center justify-between pt-3 border-t text-[11px]',
        isDark ? 'border-navy-600/30 text-gray-500' : 'border-gray-200 text-gray-400'
      )}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span>Live data updated 2 min ago</span>
        </div>
        <span>Data Sources: BTP Challan Records · DBSCAN ML Model · BTP Junction Registry</span>
      </div>
    </div>
  );
}

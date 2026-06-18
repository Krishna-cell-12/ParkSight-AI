import clsx from 'clsx';
import { MapPin } from 'lucide-react';
import ParkSightMap from '../map/ParkSightMap';
import { useTheme } from '../context/ThemeContext';
import { HOTSPOT_CLUSTERS } from '../data/realData';

const SEVERITY_COLORS = {
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW:    'bg-blue-500/20  text-blue-400  border-blue-500/30',
  HIGH:   'bg-red-500/20   text-red-400   border-red-500/30',
};

export default function Hotspots() {
  const { isDark } = useTheme();

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div>
        <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
          Hotspot Map
        </h2>
        <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
          DBSCAN-identified violation clusters across Bengaluru
        </p>
      </div>

      {/* Full-width map */}
      <div className={clsx(
        'rounded-xl border overflow-hidden shrink-0',
        isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
      )} style={{ minHeight: 380 }}>
        <ParkSightMap clusters={HOTSPOT_CLUSTERS} />
      </div>

      {/* All 10 clusters table */}
      <div className={clsx(
        'rounded-xl border',
        isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <div className="p-4 border-b border-inherit">
          <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            All Violation Clusters
          </h3>
        </div>
        <div className="max-h-[400px] overflow-y-auto overflow-x-auto rounded-b-xl border-t border-gray-700 border-opacity-30">
          <table className="w-full text-xs">
            <thead>
              <tr className={clsx(
                'sticky top-0 z-10',
                isDark ? 'bg-[#162032]' : 'bg-gray-50'
              )}>
                {['Rank', 'Zone', 'Station', 'Violations', 'Impact Score', 'Peak Ratio', 'Vehicle', 'Severity'].map(h => (
                  <th key={h} className={clsx(
                    'text-left px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]',
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {HOTSPOT_CLUSTERS.map(cluster => (
                <tr
                  key={cluster.rank}
                  className={clsx(
                    'transition-colors',
                    isDark ? 'hover:bg-navy-600/40 divide-navy-600/30' : 'hover:bg-gray-50 divide-gray-100'
                  )}
                >
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                      cluster.rank === 1 ? 'bg-red-500/20 text-red-400' :
                      cluster.rank <= 3  ? 'bg-orange-500/20 text-orange-400' :
                                           'bg-blue-500/20 text-blue-400'
                    )}>
                      {cluster.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={10} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                      <span className={clsx('font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>
                        {cluster.name}
                      </span>
                    </div>
                  </td>
                  <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {cluster.station}
                  </td>
                  <td className={clsx('px-4 py-3 font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                    {cluster.violations.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'font-bold text-sm',
                      cluster.score >= 4 ? 'text-red-400' :
                      cluster.score >= 3 ? 'text-orange-400' :
                      cluster.score >= 2 ? 'text-yellow-400' : 'text-blue-400'
                    )}>
                      {cluster.score}
                    </span>
                  </td>
                  <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {cluster.peakRatio}
                  </td>
                  <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {cluster.vehicle}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                      SEVERITY_COLORS[cluster.severity] || SEVERITY_COLORS.LOW
                    )}>
                      {cluster.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

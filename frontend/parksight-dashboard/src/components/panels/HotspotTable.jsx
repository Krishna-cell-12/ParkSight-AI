import clsx from 'clsx';
import { MapPin, Info } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const MAX_VIOLATIONS = 68494;

function getRankColor(rank) {
  if (rank === 1) return 'bg-red-500';
  if (rank <= 3)  return 'bg-orange-500';
  return 'bg-yellow-500';
}

export default function HotspotTable({ clusters, onNavigate }) {
  const { isDark } = useTheme();

  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col h-full',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
          Top Violation Hotspots
        </h3>
        <Info size={14} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-[20px_1fr_100px_60px] gap-2 mb-2">
        {['#', 'Location', 'Violations', 'Impact'].map(h => (
          <span key={h} className={clsx(
            'text-[10px] font-semibold uppercase tracking-wider',
            isDark ? 'text-gray-500' : 'text-gray-400'
          )}>
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="flex-1 space-y-1">
        {clusters.map(cluster => (
          <div
            key={cluster.rank}
            className={clsx(
              'grid grid-cols-[20px_1fr_100px_60px] gap-2 items-center px-1 py-1.5 rounded-lg transition-colors',
              isDark ? 'hover:bg-navy-600' : 'hover:bg-gray-50'
            )}
          >
            <span className={clsx('text-xs font-medium', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {cluster.rank}
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin size={10} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
              <span className={clsx('text-xs font-medium truncate', isDark ? 'text-gray-200' : 'text-gray-800')}>
                {cluster.name}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={clsx('text-xs font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                {cluster.violations.toLocaleString()}
              </span>
              <div className={clsx('h-1.5 rounded-full flex-1', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                <div
                  className={clsx('h-full rounded-full', getRankColor(cluster.rank))}
                  style={{ width: `${(cluster.violations / MAX_VIOLATIONS) * 100}%` }}
                />
              </div>
            </div>
            <span className={clsx('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {cluster.impactHrs}h
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <button
        id="hotspot-view-all"
        onClick={() => onNavigate?.('hotspots')}
        className="mt-3 text-xs text-brand-blue hover:underline text-center w-full"
      >
        View All Hotspots →
      </button>
    </div>
  );
}

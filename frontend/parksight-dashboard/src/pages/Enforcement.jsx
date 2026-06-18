import { useState } from 'react';
import clsx from 'clsx';
import { Shield, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { HOTSPOT_CLUSTERS } from '../data/realData';

const SEVERITY_MAP = {
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LOW:    'bg-blue-500/20  text-blue-400  border-blue-500/30',
  HIGH:   'bg-red-500/20   text-red-400   border-red-500/30',
};

function officersRec(score) {
  if (score >= 4) return 3;
  if (score >= 3) return 2;
  return 1;
}

function reliefMin(score) {
  return Math.round(score * 8);
}

export default function Enforcement() {
  const { isDark } = useTheme();
  const [dispatched, setDispatched] = useState(new Set());

  const toggleDispatch = (name) => {
    setDispatched(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  const panelClass = clsx(
    'rounded-xl border p-4',
    isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
  );

  const summaryStats = [
    { label: 'Total Zones',  value: HOTSPOT_CLUSTERS.length, icon: Shield,        color: 'text-brand-blue'   },
    { label: 'Dispatched',   value: dispatched.size,          icon: Users,         color: 'text-green-400'    },
    { label: 'High Impact',  value: 1,                        icon: AlertTriangle, color: 'text-red-400'      },
    { label: 'Avg Score',    value: '2.9',                    icon: TrendingUp,    color: 'text-brand-purple' },
  ];

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div>
        <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
          Enforcement Plan
        </h2>
        <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
          AI-recommended officer deployment across all violation zones
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        {summaryStats.map((s, i) => (
          <div key={i} className={panelClass}>
            <div className="flex items-center gap-3">
              <s.icon size={18} className={s.color} />
              <div>
                <p className={clsx('text-2xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
                  {s.value}
                </p>
                <p className={clsx('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>{s.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Enforcement Table */}
      <div className={clsx('rounded-xl border overflow-hidden', isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm')}>
        <div className="p-4 border-b border-inherit">
          <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            All Enforcement Zones
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={clsx(isDark ? 'bg-navy-800/50' : 'bg-gray-50')}>
                {['Rank', 'Zone', 'Station', 'Violations', 'Score', 'Severity', 'Officers Rec.', 'Relief (min)', 'Action'].map(h => (
                  <th key={h} className={clsx(
                    'text-left px-4 py-2.5 font-semibold uppercase tracking-wider text-[10px]',
                    isDark ? 'text-gray-500' : 'text-gray-400'
                  )}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOTSPOT_CLUSTERS.map(cluster => {
                const isDispatched = dispatched.has(cluster.name);
                return (
                  <tr key={cluster.rank} className={clsx(
                    'border-t transition-colors',
                    isDark ? 'border-navy-600/30 hover:bg-navy-600/30' : 'border-gray-100 hover:bg-gray-50'
                  )}>
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
                    <td className={clsx('px-4 py-3 font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>
                      {cluster.name}
                    </td>
                    <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                      {cluster.station}
                    </td>
                    <td className={clsx('px-4 py-3 font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                      {cluster.violations.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'font-bold',
                        cluster.score >= 4 ? 'text-red-400' : cluster.score >= 3 ? 'text-orange-400' : 'text-yellow-400'
                      )}>
                        {cluster.score}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx(
                        'px-2 py-0.5 rounded-full text-[10px] font-semibold border',
                        SEVERITY_MAP[cluster.severity] || SEVERITY_MAP.LOW
                      )}>
                        {cluster.severity}
                      </span>
                    </td>
                    <td className={clsx('px-4 py-3 font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                      {officersRec(cluster.score)}
                    </td>
                    <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                      ~{reliefMin(cluster.score)} min
                    </td>
                    <td className="px-4 py-3">
                      <button
                        id={`dispatch-btn-${cluster.rank}`}
                        onClick={() => toggleDispatch(cluster.name)}
                        className={clsx(
                          'px-3 py-1 rounded-md text-[11px] font-semibold transition-all duration-200',
                          isDispatched
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                            : isDark
                              ? 'border border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white'
                              : 'border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white'
                        )}
                        disabled={isDispatched}
                      >
                        {isDispatched ? 'Officer Dispatched ✓' : 'Dispatch Officer'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

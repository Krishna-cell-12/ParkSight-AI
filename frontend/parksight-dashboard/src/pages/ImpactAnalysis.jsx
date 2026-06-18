import clsx from 'clsx';
import ImpactScoreChart from '../components/charts/ImpactScoreChart';
import { useTheme } from '../context/ThemeContext';
import { ML_STATS, HOTSPOT_CLUSTERS } from '../data/realData';

const ML_CARDS = [
  { label: 'Total Clusters',      value: '118',       badge: null,        icon: '🔵', desc: 'DBSCAN spatial clusters' },
  { label: 'Approved Records',    value: '115,400',    badge: null,        icon: '📋', desc: `${ML_STATS.dateRange}` },
  { label: 'Silhouette Score',    value: '0.61',       badge: 'GOOD',      icon: '✅', desc: 'Cluster cohesion quality' },
  { label: 'Davies-Bouldin',      value: '0.33',       badge: 'EXCELLENT', icon: '🏆', desc: 'Lower = better separation' },
  { label: 'Model F1 Score',      value: '0.73',       badge: null,        icon: '🤖', desc: 'Random Forest classifier' },
  { label: 'ROC-AUC Score',       value: '0.81',       badge: null,        icon: '📈', desc: 'Binary classification AUC' },
];

const FEATURE_TABLE = [
  { feature: 'violation_count',   importance: 0.31, rank: 1 },
  { feature: 'peak_hour_ratio',   importance: 0.24, rank: 2 },
  { feature: 'severity_mean',     importance: 0.18, rank: 3 },
  { feature: 'lag_1h',            importance: 0.12, rank: 4 },
  { feature: 'rolling_7d_avg',    importance: 0.09, rank: 5 },
  { feature: 'is_peak',           importance: 0.06, rank: 6 },
];

export default function ImpactAnalysis() {
  const { isDark } = useTheme();

  const panelClass = clsx(
    'rounded-xl border p-4',
    isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
  );

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div>
        <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
          Impact Analysis
        </h2>
        <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
          ML model performance metrics and cluster quality indicators
        </p>
      </div>

      {/* ML Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        {ML_CARDS.map((card, i) => (
          <div key={i} className={panelClass}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
              {card.badge && (
                <span className={clsx(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                  card.badge === 'EXCELLENT'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-blue-500/20 text-blue-400'
                )}>
                  {card.badge}
                </span>
              )}
            </div>
            <p className={clsx('text-2xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
              {card.value}
            </p>
            <p className={clsx('text-xs font-medium mt-0.5', isDark ? 'text-gray-300' : 'text-gray-700')}>
              {card.label}
            </p>
            <p className={clsx('text-[10px] mt-1', isDark ? 'text-gray-500' : 'text-gray-400')}>
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Charts + Feature Importance */}
      <div className="grid grid-cols-2 gap-5">
        <ImpactScoreChart />

        {/* Feature Importance Table */}
        <div className={panelClass}>
          <h3 className={clsx('text-sm font-semibold mb-4', isDark ? 'text-gray-200' : 'text-gray-800')}>
            Feature Importance (Random Forest)
          </h3>
          <div className="space-y-3">
            {FEATURE_TABLE.map(row => (
              <div key={row.rank} className="flex items-center gap-3">
                <span className={clsx('text-xs w-4 text-right flex-shrink-0', isDark ? 'text-gray-500' : 'text-gray-400')}>
                  {row.rank}
                </span>
                <span className={clsx('text-xs font-mono flex-1', isDark ? 'text-gray-300' : 'text-gray-700')}>
                  {row.feature}
                </span>
                <div className={clsx('w-32 h-1.5 rounded-full', isDark ? 'bg-gray-700' : 'bg-gray-200')}>
                  <div
                    className="h-full rounded-full bg-brand-blue"
                    style={{ width: `${row.importance * 100 / 0.31}%` }}
                  />
                </div>
                <span className={clsx('text-xs font-bold w-8 text-right', isDark ? 'text-gray-300' : 'text-gray-700')}>
                  {(row.importance * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zone Impact Table */}
      <div className={clsx('rounded-xl border overflow-hidden', isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm')}>
        <div className="p-4 border-b border-inherit">
          <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            Zone-Level Impact Scores
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className={clsx(isDark ? 'bg-navy-800/50' : 'bg-gray-50')}>
                {['Zone', 'Violations', 'Impact Hours', 'Impact Score', 'Peak Ratio'].map(h => (
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
              {HOTSPOT_CLUSTERS.map(c => (
                <tr key={c.rank} className={clsx(
                  'border-t transition-colors',
                  isDark ? 'border-navy-600/30 hover:bg-navy-600/30' : 'border-gray-100 hover:bg-gray-50'
                )}>
                  <td className={clsx('px-4 py-3 font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>
                    {c.name}
                  </td>
                  <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {c.violations.toLocaleString()}
                  </td>
                  <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {c.impactHrs}h
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx(
                      'font-bold',
                      c.score >= 4 ? 'text-red-400' : c.score >= 3 ? 'text-orange-400' : 'text-yellow-400'
                    )}>
                      {c.score}
                    </span>
                  </td>
                  <td className={clsx('px-4 py-3', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {c.peakRatio}
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

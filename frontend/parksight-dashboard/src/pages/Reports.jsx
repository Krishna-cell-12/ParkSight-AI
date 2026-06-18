import clsx from 'clsx';
import { Download } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ML_STATS, HOTSPOT_CLUSTERS } from '../data/realData';

function exportCSV() {
  const headers = ['Rank', 'Zone', 'Station', 'Violations', 'Impact Hours', 'Impact Score', 'Peak Ratio', 'Vehicle', 'Severity'];
  const rows = HOTSPOT_CLUSTERS.map(c =>
    [c.rank, `"${c.name}"`, `"${c.station}"`, c.violations, c.impactHrs, c.score, c.peakRatio, c.vehicle, c.severity].join(',')
  );
  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'parksight_report.csv';
  a.click();
  URL.revokeObjectURL(url);
}

const ML_ROWS = [
  ['Date Range',          ML_STATS.dateRange],
  ['Total Clusters',      ML_STATS.totalClusters],
  ['Noise Points',        ML_STATS.noisePoints],
  ['Approved Violations', ML_STATS.approvedViolations.toLocaleString()],
  ['Silhouette Score',    ML_STATS.silhouetteScore],
  ['Davies-Bouldin',      ML_STATS.daviesBouldin],
  ['Calinski-Harabasz',   ML_STATS.calinskiHarabasz.toLocaleString()],
  ['RF F1 Score',         ML_STATS.rfF1Score],
  ['RF ROC-AUC',          ML_STATS.rfRocAuc],
];

export default function Reports() {
  const { isDark } = useTheme();

  const panelClass = clsx(
    'rounded-xl border overflow-hidden',
    isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
  );

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
            Reports & Export
          </h2>
          <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
            Summary statistics, model performance, and data export
          </p>
        </div>
        <button
          id="export-csv-btn"
          onClick={exportCSV}
          className={clsx(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200',
            'bg-brand-blue text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25'
          )}
        >
          <Download size={15} />
          Export CSV
        </button>
      </div>

      {/* ML Stats Table */}
      <div className={panelClass}>
        <div className="p-4 border-b border-inherit">
          <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            Model & Dataset Statistics
          </h3>
        </div>
        <table className="w-full text-xs">
          <tbody>
            {ML_ROWS.map(([label, val], i) => (
              <tr key={i} className={clsx(
                'border-b last:border-0',
                isDark ? 'border-navy-600/30' : 'border-gray-100'
              )}>
                <td className={clsx('px-4 py-2.5 font-medium w-60', isDark ? 'text-gray-400' : 'text-gray-500')}>
                  {label}
                </td>
                <td className={clsx('px-4 py-2.5 font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Top 10 Zones Table — own wrapper without overflow-hidden so scrollbar is visible */}
      <div className={clsx(
        'rounded-xl border',
        isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <div className="p-4 border-b border-inherit">
          <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            Top 10 Violation Zones
          </h3>
        </div>
        {/* max-h triggers scroll once content exceeds ~5 visible rows */}
        <div className="max-h-[280px] overflow-y-auto overflow-x-auto rounded-b-xl">
          <table className="w-full text-xs">
            <thead>
              <tr className={clsx(
                'sticky top-0 z-10',
                isDark ? 'bg-[#162032]' : 'bg-gray-50'
              )}>
                {['Rank', 'Zone', 'Station', 'Violations', 'Impact Hrs', 'Score', 'Peak Ratio', 'Vehicle'].map(h => (
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
                  <td className={clsx('px-4 py-2.5', isDark ? 'text-gray-400' : 'text-gray-500')}>{c.rank}</td>
                  <td className={clsx('px-4 py-2.5 font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>{c.name}</td>
                  <td className={clsx('px-4 py-2.5', isDark ? 'text-gray-400' : 'text-gray-500')}>{c.station}</td>
                  <td className={clsx('px-4 py-2.5 font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>{c.violations.toLocaleString()}</td>
                  <td className={clsx('px-4 py-2.5', isDark ? 'text-gray-400' : 'text-gray-500')}>{c.impactHrs}h</td>
                  <td className={clsx('px-4 py-2.5 font-bold', c.score >= 4 ? 'text-red-400' : c.score >= 3 ? 'text-orange-400' : 'text-yellow-400')}>{c.score}</td>
                  <td className={clsx('px-4 py-2.5', isDark ? 'text-gray-400' : 'text-gray-500')}>{c.peakRatio}</td>
                  <td className={clsx('px-4 py-2.5', isDark ? 'text-gray-400' : 'text-gray-500')}>{c.vehicle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

export default function EnforcementPriority({ priorities, onNavigate }) {
  const { isDark } = useTheme();
  const [dispatchedZones, setDispatchedZones] = useState(new Set());

  const handleDispatch = (zoneName) => {
    setDispatchedZones(prev => new Set([...prev, zoneName]));
  };

  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col h-full',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
          Enforcement Priority
        </h3>
        <button className={clsx(
          'text-xs flex items-center gap-1 px-2 py-1 rounded-md border',
          isDark ? 'border-navy-500 text-gray-400 hover:bg-navy-600' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
        )}>
          AI Recommendation ▾
        </button>
      </div>

      {/* Priority Items */}
      <div className="space-y-2 flex-1">
        {priorities.map(item => (
          <div
            key={item.rank}
            className={clsx(
              'flex items-start gap-3 p-2 rounded-lg cursor-pointer transition-colors',
              isDark ? 'hover:bg-navy-600/60' : 'hover:bg-gray-50'
            )}
            onClick={() => handleDispatch(item.name)}
          >
            {/* Rank Badge */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: item.color, color: item.textColor }}
            >
              {item.rank}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={clsx('text-sm font-semibold truncate', isDark ? 'text-gray-200' : 'text-gray-800')}>
                {item.name}
              </p>
              <p className={clsx('text-[11px] mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
                {item.subtitle}
              </p>
            </div>

            {/* Score + Badge */}
            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className={clsx('text-xs font-bold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                {item.score}/100
              </span>
              {dispatchedZones.has(item.name) && (
                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400">
                  Dispatched ✓
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <button
        id="enforcement-view-plan"
        onClick={() => onNavigate?.('enforcement')}
        className="mt-3 text-xs text-brand-blue hover:underline text-center w-full"
      >
        View Enforcement Plan →
      </button>
    </div>
  );
}

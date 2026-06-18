import clsx from 'clsx';
import * as LucideIcons from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/15',   icon: 'text-blue-400'   },
  teal:   { bg: 'bg-cyan-500/15',   icon: 'text-cyan-400'   },
  green:  { bg: 'bg-green-500/15',  icon: 'text-green-400'  },
  orange: { bg: 'bg-orange-500/15', icon: 'text-orange-400' },
};

export default function CongestionSummary({ data, onNavigate }) {
  const { isDark } = useTheme();

  return (
    <div className={clsx(
      'rounded-xl border p-4 flex flex-col h-full',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <h3 className={clsx('text-sm font-semibold mb-4', isDark ? 'text-gray-200' : 'text-gray-800')}>
        Congestion Impact Summary
      </h3>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {data.map((item, i) => {
          const Icon = LucideIcons[item.icon] || LucideIcons.Activity;
          const colors = COLOR_MAP[item.color] || COLOR_MAP.blue;
          return (
            <div
              key={i}
              className={clsx(
                'relative rounded-xl p-3 flex flex-col justify-between',
                isDark ? 'bg-navy-600/60' : 'bg-gray-50 border border-gray-100'
              )}
            >
              <div className={clsx(
                'absolute top-2.5 right-2.5 w-7 h-7 rounded-lg flex items-center justify-center',
                colors.bg
              )}>
                <Icon size={14} className={colors.icon} />
              </div>
              <div className="mt-1">
                <p className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
                  {item.value}
                </p>
                <p className={clsx('text-[11px] mt-0.5 pr-8', isDark ? 'text-gray-400' : 'text-gray-500')}>
                  {item.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button
        id="congestion-view-impact"
        onClick={() => onNavigate?.('impact')}
        className="mt-3 text-xs text-brand-blue hover:underline text-center w-full"
      >
        View Impact Analysis →
      </button>
    </div>
  );
}

import { useState } from 'react';
import clsx from 'clsx';
import { X, AlertOctagon, AlertTriangle, Info, Bell } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ALERTS_DATA } from '../data/realData';

const ALERT_CONFIG = {
  critical: { icon: AlertOctagon, bg: 'bg-red-500/15',    border: 'border-red-500/30',    text: 'text-red-400',    label: 'CRITICAL' },
  high:     { icon: AlertTriangle,bg: 'bg-orange-500/15', border: 'border-orange-500/30', text: 'text-orange-400', label: 'HIGH'     },
  medium:   { icon: Bell,         bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-yellow-400', label: 'MEDIUM'   },
  low:      { icon: Info,         bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-blue-400',   label: 'LOW'      },
};

export default function Alerts() {
  const { isDark } = useTheme();
  const [alerts, setAlerts] = useState(ALERTS_DATA);

  const dismiss = (id) => setAlerts(prev => prev.filter(a => a.id !== id));
  const clearAll = () => setAlerts([]);

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
            Active Alerts
          </h2>
          <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
            Real-time violation zone notifications
          </p>
        </div>
        {alerts.length > 0 && (
          <button
            id="clear-all-alerts"
            onClick={clearAll}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
              isDark
                ? 'border-navy-600/50 text-gray-400 hover:bg-navy-700 hover:text-gray-200'
                : 'border-gray-200 text-gray-500 hover:bg-gray-100'
            )}
          >
            Clear All
          </button>
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-24">
          <div className={clsx(
            'w-16 h-16 rounded-2xl flex items-center justify-center',
            isDark ? 'bg-navy-700' : 'bg-gray-100'
          )}>
            <Bell size={28} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
          </div>
          <p className={clsx('text-sm font-semibold', isDark ? 'text-gray-400' : 'text-gray-500')}>
            No active alerts
          </p>
          <p className={clsx('text-xs', isDark ? 'text-gray-600' : 'text-gray-400')}>
            All zones are operating normally
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {alerts.map(alert => {
            const config = ALERT_CONFIG[alert.type] || ALERT_CONFIG.low;
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={clsx(
                  'flex items-start gap-4 p-4 rounded-xl border transition-all duration-200',
                  isDark
                    ? 'bg-navy-700 border-navy-600/30 hover:border-navy-500/50'
                    : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                )}
              >
                {/* Icon */}
                <div className={clsx(
                  'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
                  config.bg
                )}>
                  <Icon size={16} className={config.text} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={clsx(
                      'text-[10px] font-bold px-1.5 py-0.5 rounded border',
                      config.bg, config.border, config.text
                    )}>
                      {config.label}
                    </span>
                    <span className={clsx('text-xs font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                      {alert.zone}
                    </span>
                  </div>
                  <p className={clsx('text-xs', isDark ? 'text-gray-400' : 'text-gray-600')}>
                    {alert.message}
                  </p>
                  <p className={clsx('text-[10px] mt-1.5', isDark ? 'text-gray-600' : 'text-gray-400')}>
                    {alert.time}
                  </p>
                </div>

                {/* Dismiss */}
                <button
                  id={`dismiss-alert-${alert.id}`}
                  onClick={() => dismiss(alert.id)}
                  className={clsx(
                    'p-1.5 rounded-lg transition-colors flex-shrink-0',
                    isDark ? 'text-gray-500 hover:bg-navy-600 hover:text-gray-300' : 'text-gray-400 hover:bg-gray-100'
                  )}
                  aria-label="Dismiss alert"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

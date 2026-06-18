import clsx from 'clsx';
import {
  LayoutDashboard, MapPin, Car, LineChart, ShieldCheck,
  FileBarChart, Bell, Settings, CalendarDays
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const NAV_ITEMS = [
  { id: 'overview',    label: 'Overview',        icon: LayoutDashboard },
  { id: 'hotspots',   label: 'Hotspots',        icon: MapPin          },
  { id: 'violations', label: 'Violations',      icon: Car             },
  { id: 'impact',     label: 'Impact Analysis', icon: LineChart       },
  { id: 'enforcement',label: 'Enforcement',     icon: ShieldCheck     },
  { id: 'reports',    label: 'Reports',         icon: FileBarChart    },
  { id: 'nextday',    label: 'Next Day',        icon: CalendarDays    },
  { id: 'alerts',     label: 'Alerts',          icon: Bell            },
  { id: 'settings',   label: 'Settings',        icon: Settings        },
];

export default function Sidebar({ activePage, onNavigate }) {
  const { isDark } = useTheme();

  return (
    <aside className={clsx(
      'fixed left-0 top-0 h-screen w-40 flex flex-col z-30',
      isDark ? 'bg-navy-800 border-r border-navy-600/30' : 'bg-white border-r border-gray-200'
    )}>
      {/* Logo Area */}
      <div className="py-5 px-4 flex flex-col items-center text-center">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-2 shadow-lg shadow-blue-500/25">
          <span className="text-white font-bold text-lg leading-none">P</span>
        </div>
        <div>
          <p className={clsx('text-xs font-bold tracking-wide', isDark ? 'text-gray-100' : 'text-gray-800')}>
            Parking
          </p>
          <p className={clsx('text-xs font-bold tracking-wide', isDark ? 'text-gray-100' : 'text-gray-800')}>
            Intelligence
          </p>
        </div>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activePage === id;
          return (
            <button
              key={id}
              id={`nav-${id}`}
              onClick={() => onNavigate(id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? isDark
                    ? 'bg-navy-500 text-brand-blue border-l-2 border-brand-blue'
                    : 'bg-blue-50 text-blue-600 border-l-2 border-blue-600'
                  : isDark
                    ? 'text-gray-400 hover:bg-navy-600 hover:text-gray-200'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* AI Badge */}
      <div className="p-4">
        <div className={clsx(
          'rounded-xl p-3',
          isDark ? 'bg-navy-700' : 'bg-blue-50'
        )}>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex-shrink-0 shadow-md" />
            <div className="flex flex-col">
              <span className={clsx('text-xs font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
                AI Powered
              </span>
              <span className={clsx('text-[10px]', isDark ? 'text-gray-400' : 'text-gray-500')}>
                Smarter Enforcement
              </span>
              <span className={clsx('text-[10px]', isDark ? 'text-gray-400' : 'text-gray-500')}>
                Better Traffic Flow
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

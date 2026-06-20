import clsx from 'clsx';
import { CalendarDays, SlidersHorizontal, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function Header() {
  const { isDark, toggleTheme } = useTheme();

  const btnClass = clsx(
    'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-colors duration-150',
    isDark
      ? 'border-navy-600/50 text-gray-300 hover:bg-navy-700'
      : 'border-gray-200 text-gray-600 hover:bg-gray-100'
  );

  return (
    <header className={clsx(
      'h-16 flex items-center justify-between px-6 flex-shrink-0',
      isDark ? 'bg-navy-900 border-b border-navy-600/30' : 'bg-white border-b border-gray-200'
    )}>
      {/* Left — Titles */}
      <div>
        <h1 className={clsx('text-lg font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
          Parking-Induced Congestion Dashboard
        </h1>
        <p className={clsx('text-xs mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
          AI-driven insights for smarter enforcement and smoother traffic.
        </p>
      </div>

      {/* Right — Controls */}
      <div className="flex items-center gap-3">
        <button id="header-date-range" className={btnClass}>
          <CalendarDays size={14} />
          <span>May 12 – May 18, 2025</span>
        </button>

        <button id="header-filters" className={btnClass}>
          <SlidersHorizontal size={14} />
          <span>Filters</span>
        </button>

        <button
          id="header-theme-toggle"
          onClick={toggleTheme}
          className={clsx(
            'p-2 rounded-lg border transition-colors duration-150',
            isDark
              ? 'border-navy-600/50 hover:bg-navy-700'
              : 'border-gray-200 hover:bg-gray-100'
          )}
          aria-label="Toggle theme"
        >
          {isDark
            ? <Sun size={16} className="text-yellow-400" />
            : <Moon size={16} className="text-gray-600" />
          }
        </button>
      </div>
    </header>
  );
}

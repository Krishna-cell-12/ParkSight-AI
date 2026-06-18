import { useEffect, useRef, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

const COLOR_MAP = {
  blue:   { bg: 'bg-blue-500/15',   icon: 'text-brand-blue'   },
  orange: { bg: 'bg-orange-500/15', icon: 'text-brand-orange' },
  teal:   { bg: 'bg-cyan-500/15',   icon: 'text-brand-cyan'   },
  purple: { bg: 'bg-purple-500/15', icon: 'text-brand-purple' },
};

function useCountUp(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const start = performance.now();
    const easeOutQuart = t => 1 - Math.pow(1 - t, 4);

    const tick = now => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.round(easeOutQuart(progress) * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);

  return count;
}

export default function KPICard({ label, value, change, changeLabel, positive, icon, color }) {
  const { isDark } = useTheme();
  const displayValue = useCountUp(value);
  const Icon = LucideIcons[icon] || LucideIcons.Activity;
  const colors = COLOR_MAP[color] || COLOR_MAP.blue;

  return (
    <div className={clsx(
      'flex items-center justify-between p-5 rounded-xl border transition-all duration-200 hover:scale-[1.01]',
      isDark
        ? 'bg-navy-700 border-navy-600/30'
        : 'bg-white border-gray-200 shadow-sm'
    )}>
      {/* Left */}
      <div className="flex-1 min-w-0">
        <p className={clsx('text-xs font-medium mb-2 truncate', isDark ? 'text-gray-400' : 'text-gray-500')}>
          {label}
        </p>
        <p className={clsx('text-3xl font-bold tracking-tight tabular-nums', isDark ? 'text-gray-100' : 'text-gray-900')}>
          {displayValue.toLocaleString()}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          <TrendingUp size={12} className="text-green-400 flex-shrink-0" />
          <span className="text-xs text-green-400 font-medium">{change}</span>
          <span className={clsx('text-xs', isDark ? 'text-gray-500' : 'text-gray-400')}>{changeLabel}</span>
        </div>
      </div>

      {/* Right — icon */}
      <div className={clsx('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ml-3', colors.bg)}>
        <Icon size={22} className={colors.icon} />
      </div>
    </div>
  );
}

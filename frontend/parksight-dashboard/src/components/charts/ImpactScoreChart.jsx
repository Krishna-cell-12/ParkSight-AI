import clsx from 'clsx';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const IMPACT_RANGES = [
  { range: '0–1',   count: 12, color: '#06B6D4' },
  { range: '1–2',   count: 28, color: '#10B981' },
  { range: '2–3',   count: 45, color: '#3B82F6' },
  { range: '3–4',   count: 22, color: '#F59E0B' },
  { range: '4–5',   count: 8,  color: '#F97316' },
  { range: '5+',    count: 3,  color: '#EF4444' },
];

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={clsx(
      'px-3 py-2 rounded-lg text-xs shadow-xl border',
      isDark ? 'bg-navy-600 border-navy-500 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
    )}>
      <p className="font-semibold">Score {payload[0]?.payload?.range}</p>
      <p style={{ color: payload[0]?.payload?.color }}>{payload[0].value} clusters</p>
    </div>
  );
}

export default function ImpactScoreChart() {
  const { isDark } = useTheme();

  return (
    <div className={clsx(
      'rounded-xl border p-4',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
          Impact Score Distribution
        </h3>
        <span className={clsx('text-[10px]', isDark ? 'text-gray-400' : 'text-gray-500')}>
          118 clusters total
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={IMPACT_RANGES} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,140,190,0.08)" vertical={false} />
          <XAxis
            dataKey="range"
            tick={{ fontSize: 10, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            stroke="transparent"
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            stroke="transparent"
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={36}>
            {IMPACT_RANGES.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

import clsx from 'clsx';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { VEHICLE_TYPES } from '../../data/realData';

const maxCount = Math.max(...VEHICLE_TYPES.map(v => v.count));

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className={clsx(
      'px-3 py-2 rounded-lg text-xs shadow-xl border',
      isDark ? 'bg-navy-600 border-navy-500 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
    )}>
      <p className="font-semibold">{d.name}</p>
      <p style={{ color: d.color }}>{d.count.toLocaleString()} violations</p>
      <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
        {((d.count / VEHICLE_TYPES.reduce((s, v) => s + v.count, 0)) * 100).toFixed(1)}% of total
      </p>
    </div>
  );
}

export default function VehicleTypeChart() {
  const { isDark } = useTheme();

  return (
    <div className={clsx(
      'rounded-xl border p-4',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
          Violations by Vehicle Type
        </h3>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={VEHICLE_TYPES}
          layout="vertical"
          margin={{ top: 5, right: 10, bottom: 5, left: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,140,190,0.08)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 9, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            stroke="transparent"
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 10, fill: isDark ? '#9CA3AF' : '#6B7280' }}
            stroke="transparent"
            tickLine={false}
            width={56}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {VEHICLE_TYPES.map((entry, i) => (
              <Cell key={i} fill={entry.color} opacity={0.8} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

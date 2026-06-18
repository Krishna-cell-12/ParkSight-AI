import clsx from 'clsx';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';
import { HOURLY_DATA } from '../../data/realData';

const chartData = HOURLY_DATA.labels.map((label, i) => ({
  name: label,
  value: HOURLY_DATA.data[i],
  isPeak: HOURLY_DATA.peakHours.includes(i),
}));

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  const isPeak = payload[0]?.payload?.isPeak;
  return (
    <div className={clsx(
      'px-3 py-2 rounded-lg text-xs shadow-xl border',
      isDark ? 'bg-navy-600 border-navy-500 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
    )}>
      <p className="font-semibold">{label}</p>
      <p style={{ color: isPeak ? '#EF4444' : '#3B82F6' }}>{payload[0].value.toLocaleString()} violations</p>
      {isPeak && <p className="text-red-400 font-medium mt-0.5">⚠ Peak window</p>}
    </div>
  );
}

export default function HourlyBarChart() {
  const { isDark } = useTheme();

  return (
    <div className={clsx(
      'rounded-xl border p-4',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            Hourly Violation Pattern
          </h3>
          <p className={clsx('text-[10px] mt-0.5', isDark ? 'text-gray-400' : 'text-gray-500')}>
            <span className="inline-block w-2 h-2 rounded-sm bg-red-500 mr-1" />
            Peak: 2–6AM window
          </p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,140,190,0.08)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 9, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            stroke="transparent"
            tickLine={false}
            interval={2}
          />
          <YAxis
            tick={{ fontSize: 9, fill: isDark ? '#6B7280' : '#9CA3AF' }}
            stroke="transparent"
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          <Bar dataKey="value" radius={[3, 3, 0, 0]} maxBarSize={16}>
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.isPeak ? '#EF4444' : '#3B82F6'} opacity={entry.isPeak ? 0.85 : 0.65} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

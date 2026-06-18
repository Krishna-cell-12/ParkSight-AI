import { useState } from 'react';
import clsx from 'clsx';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from 'recharts';
import { useTheme } from '../../context/ThemeContext';

function buildChartData(rangeData) {
  return rangeData.labels.map((label, i) => ({ name: label, value: rangeData.data[i] }));
}

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  return (
    <div className={clsx(
      'px-3 py-2 rounded-lg text-xs shadow-xl border',
      isDark ? 'bg-navy-600 border-navy-500 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
    )}>
      <p className="font-semibold">{label}</p>
      <p className="text-purple-400">{payload[0].value.toLocaleString()} violations</p>
    </div>
  );
}

export default function ViolationsLineChart({ data }) {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState('daily');
  const chartData = buildChartData(data[timeRange]);

  const selectClass = clsx(
    'text-xs border rounded-md px-2 py-1 outline-none cursor-pointer',
    isDark
      ? 'bg-navy-600 border-navy-500 text-gray-300'
      : 'bg-white border-gray-200 text-gray-600'
  );

  return (
    <div className={clsx(
      'rounded-xl border p-4',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
          Violations Over Time
        </h3>
        <select
          id="violations-time-range"
          className={selectClass}
          value={timeRange}
          onChange={e => setTimeRange(e.target.value)}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <ResponsiveContainer width="100%" height={160}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
          <defs>
            <linearGradient id="violationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8B5CF6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(99,140,190,0.08)" />
          <XAxis
            dataKey="name"
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
          <Area
            type="monotone"
            dataKey="value"
            stroke="#8B5CF6"
            strokeWidth={2}
            fill="url(#violationGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#8B5CF6' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

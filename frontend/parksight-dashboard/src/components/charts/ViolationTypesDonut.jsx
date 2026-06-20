import { useState } from 'react';
import clsx from 'clsx';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useTheme } from '../../context/ThemeContext';

const SHORT_LABELS = {
  'Parking Near Bustop/School/Hospital Etc': 'Near Bus Stop/School',
  'Parking Near Traffic Light Or Zebra Cross': 'Near Traffic Light/Crossing',
};

const getShortLabel = (name) => SHORT_LABELS[name] || name;

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className={clsx(
      'px-3 py-2 rounded-lg text-xs shadow-xl border',
      isDark ? 'bg-navy-600 border-navy-500 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
    )}>
      <p className="font-semibold">{d.name}</p>
      <p style={{ color: d.color }}>{d.value}%</p>
    </div>
  );
}

export default function ViolationTypesDonut({ data }) {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState('thisWeek');
  const chartData = data[period];
  const total = chartData.reduce((sum, item) => sum + (item.count || 0), 0);

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
          Violation Types
        </h3>
        <select
          id="violation-types-period"
          className={selectClass}
          value={period}
          onChange={e => setPeriod(e.target.value)}
        >
          <option value="thisWeek">This Week</option>
          <option value="lastWeek">Last Week</option>
          <option value="thisMonth">This Month</option>
        </select>
      </div>

      <div className="flex items-center gap-4">
        {/* Donut */}
        <div className="relative flex-shrink-0" style={{ width: 140, height: 140 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={48}
                outerRadius={66}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip isDark={isDark} />} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-800')}>
              {total.toLocaleString()}
            </span>
            <span className={clsx('text-[10px]', isDark ? 'text-gray-500' : 'text-gray-400')}>Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 min-w-0 space-y-1.5">
          {chartData.map((item, i) => (
            <div key={item.name} className="flex items-center gap-2 text-xs">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span className={clsx('flex-1 truncate', isDark ? 'text-gray-400' : 'text-gray-500')}>
                {getShortLabel(item.name)}
              </span>
              <span className={clsx('font-semibold flex-shrink-0 tabular-nums', isDark ? 'text-gray-200' : 'text-gray-700')}>
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import clsx from 'clsx';
import { NEXTDAY_FORECAST } from '../data/realData';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell, ReferenceLine, Legend
} from 'recharts';
import {
  Calendar, TrendingUp, AlertTriangle,
  CheckCircle, Clock, Brain, MapPin
} from 'lucide-react';

export default function NextDayForecast() {
  // B) CITY-WIDE 7-DAY BAR CHART
  const cityForecastData = NEXTDAY_FORECAST.cityWide.forecast.map(d => ({
    day: d.dayName.slice(0, 3),
    date: d.date,
    predicted: d.predicted,
    risk: d.risk,
  }));

  const getRiskColor = (risk) => {
    if (risk === 'HIGH') return '#EF4444';
    if (risk === 'MEDIUM') return '#F59E0B';
    return '#10B981';
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-navy-800 p-3 rounded shadow-lg border border-gray-100 dark:border-navy-600 z-50">
          <p className="text-sm font-semibold mb-1 text-gray-800 dark:text-gray-100">{data.date}</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Predicted:</span>
            <span className="font-mono text-gray-900 dark:text-white">{data.predicted}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500 dark:text-gray-400">Risk:</span>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded text-white"
              style={{ backgroundColor: getRiskColor(data.risk) }}
            >
              {data.risk}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 flex flex-col gap-5">
      {/* A) HEADER ROW */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold dark:text-white text-gray-900">Next-Day Violation Forecast</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            7-day ahead predictions per junction — RandomForest trained on 136 days of BTP data
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-navy-500 bg-gray-50 dark:bg-navy-700 text-xs font-mono text-gray-800 dark:text-brand-cyan">
          City-wide Accuracy: {NEXTDAY_FORECAST.cityWide.accuracy}% · R²: {NEXTDAY_FORECAST.cityWide.r2}
        </div>
      </div>

      {/* B) CITY-WIDE 7-DAY BAR CHART */}
      <div className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-gray-100 dark:border-navy-600 shadow-sm w-full">
        <h2 className="font-bold text-gray-900 dark:text-white mb-1">City-Wide Predicted Violations — Next 7 Days</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Threshold: HIGH ≥ {NEXTDAY_FORECAST.cityWide.highThreshold} violations/day
        </p>
        <div className="w-full h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={cityForecastData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#8DA4BE' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#8DA4BE' }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'transparent'}} />
              <ReferenceLine y={NEXTDAY_FORECAST.cityWide.highThreshold} stroke="#EF4444" strokeDasharray="4 4" label={{ position: 'insideTopRight', value: 'HIGH threshold', fill: '#EF4444', fontSize: 10 }} />
              <ReferenceLine y={NEXTDAY_FORECAST.cityWide.avgDaily} stroke="#8DA4BE" strokeDasharray="4 4" label={{ position: 'insideTopRight', value: 'Avg', fill: '#8DA4BE', fontSize: 10 }} />
              <Bar dataKey="predicted" radius={[4, 4, 0, 0]}>
                {cityForecastData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getRiskColor(entry.risk)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* C) JUNCTION FORECAST GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.values(NEXTDAY_FORECAST.junctions).map((junc, idx) => {
          const highestDay = junc.days.reduce((max, d) => d.predicted > max.predicted ? d : max, junc.days[0]);
          const hasHigh = junc.days.some(d => d.risk === 'HIGH');

          return (
            <div key={idx} className="bg-white dark:bg-navy-800 rounded-xl p-4 border border-gray-100 dark:border-navy-600 shadow-sm flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: junc.color }}></div>
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">{junc.shortName}</span>
                </div>
                <div className="text-[10px] bg-gray-100 dark:bg-navy-700 px-1.5 py-0.5 rounded text-gray-500 dark:text-gray-400">
                  MAE: ±{junc.testMAE}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 mb-3">
                {junc.modelUsed} · {junc.accuracy}% acc
              </div>

              <div className="flex gap-1 mt-auto">
                {junc.days.map((d, i) => {
                  let blockClass = "bg-green-500/20 text-green-600 dark:text-green-400";
                  let riskLabel = "LOW";
                  if (d.risk === 'HIGH') {
                    blockClass = "bg-red-500/80 text-white";
                    riskLabel = "HIGH";
                  } else if (d.risk === 'MEDIUM') {
                    blockClass = "bg-yellow-500/70 text-gray-900";
                    riskLabel = "MED";
                  }

                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{d.dayName.slice(0, 3)}</div>
                      <div className="text-[9px] text-gray-400 dark:text-gray-500">{d.date.slice(-2)}</div>
                      <div className={clsx("w-full h-8 rounded-md flex items-center justify-center text-[10px] font-bold", blockClass)}>
                        {riskLabel}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400">{d.predicted}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-navy-600 flex flex-col gap-1">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Peak: {highestDay.dayName.slice(0, 3)} ({highestDay.predicted})
                </div>
                <div className="flex items-center gap-1.5 text-[11px] mt-1">
                  {hasHigh ? (
                    <>
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <span className="text-red-600 dark:text-red-400 font-medium">Alert: pre-position recommended</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle size={12} className="text-green-500" />
                      <span className="text-green-600 dark:text-green-400 font-medium">Normal operations next 7 days</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* D) ACCURACY TABLE & E) FEATURE IMPORTANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* D) ACCURACY TABLE */}
        <div className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-gray-100 dark:border-navy-600 shadow-sm flex-1">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Model Performance — Per Junction</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-navy-600">
                  <th className="pb-2 font-medium">Junction</th>
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 font-medium text-right">MAE</th>
                  <th className="pb-2 font-medium text-right">R²</th>
                  <th className="pb-2 font-medium text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-navy-600/50">
                {Object.values(NEXTDAY_FORECAST.modelAccuracySummary).map((row, i) => {
                  let badgeColor = "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400";
                  if (row.accuracy >= 75) badgeColor = "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400";
                  else if (row.accuracy >= 60) badgeColor = "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400";

                  return (
                    <tr key={i} className="text-gray-700 dark:text-gray-300">
                      <td className="py-2">{row.shortName}</td>
                      <td className="py-2 text-[11px] text-gray-500">{row.model.replace('Regressor', '')}</td>
                      <td className="py-2 text-right font-mono text-xs">{row.mae.toFixed(1)}</td>
                      <td className="py-2 text-right font-mono text-xs">{row.r2.toFixed(2)}</td>
                      <td className="py-2 text-right">
                        <span className={clsx("px-2 py-0.5 rounded text-[11px] font-bold", badgeColor)}>
                          {row.accuracy}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {/* City-wide row */}
                <tr className="text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-navy-600/50">
                  <td className="py-2 px-2 rounded-l">City-wide</td>
                  <td className="py-2 text-[11px] text-gray-500 px-2">RandomForest</td>
                  <td className="py-2 text-right font-mono text-xs px-2">{NEXTDAY_FORECAST.cityWide.mae.toFixed(1)}</td>
                  <td className="py-2 text-right font-mono text-xs px-2">{NEXTDAY_FORECAST.cityWide.r2.toFixed(2)}</td>
                  <td className="py-2 text-right px-2 rounded-r">
                    <span className={clsx(
                      "px-2 py-0.5 rounded text-[11px] font-bold",
                      NEXTDAY_FORECAST.cityWide.accuracy >= 75 ? "bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400" :
                        NEXTDAY_FORECAST.cityWide.accuracy >= 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400" :
                          "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                    )}>
                      {NEXTDAY_FORECAST.cityWide.accuracy}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* E) FEATURE IMPORTANCE */}
        <div className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-gray-100 dark:border-navy-600 shadow-sm flex-1">
          <h2 className="font-bold text-gray-900 dark:text-white mb-4">Top Predictive Features — Safina Plaza Junction</h2>
          <div className="flex flex-col gap-3 mt-4">
            {Object.entries(NEXTDAY_FORECAST.junctions['BTP051 - Safina Plaza Junction']?.featureImportance || {}).slice(0, 8).map(([feature, importance], idx) => {
              const pct = Math.min(100, Math.max(0, importance * 500)); // importance * 500px capped at 100% width
              return (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-300 font-medium">{feature}</span>
                    <span className="text-gray-500 font-mono">{importance.toFixed(3)}</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-navy-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

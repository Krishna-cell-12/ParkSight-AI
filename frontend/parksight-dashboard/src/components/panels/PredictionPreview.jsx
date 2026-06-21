import { NEXTDAY_FORECAST } from '../../data/realData';
import { TrendingUp, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useTheme } from '../../context/ThemeContext';

const PredictionPreview = ({ onViewForecast }) => {
  const { isDark } = useTheme();
  const forecast = NEXTDAY_FORECAST?.cityWide?.forecast?.slice(0, 3) || [];
  const relativeLabels = ['Tomorrow', 'In 2 Days', 'In 3 Days'];

  const riskConfig = {
    HIGH:   { color: '#EF4444', bg: 'bg-red-500/15',    icon: AlertTriangle, label: 'High Risk' },
    MEDIUM: { color: '#F59E0B', bg: 'bg-yellow-500/15', icon: TrendingUp,    label: 'Elevated' },
    LOW:    { color: '#10B981', bg: 'bg-green-500/15',  icon: CheckCircle,   label: 'Normal' },
  };

  return (
    <div className={clsx(
      'rounded-xl border p-4 shadow-sm',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200'
    )}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-brand-purple" />
          <span className={clsx('text-sm font-semibold', isDark ? 'text-gray-200' : 'text-gray-800')}>
            Predicted Congestion — Next 3 Days
          </span>
        </div>
        <span className={clsx(
          'text-[10px] px-2 py-1 rounded-md font-mono',
          isDark ? 'bg-navy-600 text-gray-400' : 'bg-gray-100 text-gray-500'
        )}>
          ML Forecast
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {forecast.map((day, i) => {
          const cfg = riskConfig[day.risk] || riskConfig.LOW;
          const Icon = cfg.icon;
          return (
            <div key={i} className={`rounded-lg p-3 ${cfg.bg}`}>
              <div className={clsx('text-[11px] font-medium mb-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
                {relativeLabels[i]}
              </div>
              <div className="flex items-center gap-1.5 mb-1">
                <Icon size={14} style={{ color: cfg.color }} />
                <span className="text-xs font-semibold" style={{ color: cfg.color }}>
                  {cfg.label}
                </span>
              </div>
              <div className={clsx('text-lg font-bold', isDark ? 'text-gray-100' : 'text-gray-800')}>
                ~{day.predicted.toLocaleString()}
              </div>
              <div className={clsx('text-[10px]', isDark ? 'text-gray-500' : 'text-gray-400')}>
                predicted violations
              </div>
            </div>
          );
        })}
      </div>

      <div className={clsx(
        'mt-3 pt-3 border-t flex items-center justify-between',
        isDark ? 'border-navy-600/30' : 'border-gray-100'
      )}>
        <span className={clsx('text-[10px]', isDark ? 'text-gray-500' : 'text-gray-400')}>
          Model accuracy: {NEXTDAY_FORECAST?.cityWide?.accuracy}% · Based on 136 days of BTP data
        </span>
        <button 
          onClick={onViewForecast}
          className="text-[11px] text-brand-blue font-medium hover:underline"
        >
          View 7-Day Forecast →
        </button>
      </div>
    </div>
  );
};

export default PredictionPreview;

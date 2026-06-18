import clsx from 'clsx';
import HourlyBarChart from '../components/charts/HourlyBarChart';
import VehicleTypeChart from '../components/charts/VehicleTypeChart';
import ViolationTypesDonut from '../components/charts/ViolationTypesDonut';
import { useTheme } from '../context/ThemeContext';
import { VIOLATION_TYPES } from '../data/realData';

export default function Violations() {
  const { isDark } = useTheme();

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto">
      <div>
        <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
          Violations Analysis
        </h2>
        <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
          Pattern breakdown by time, vehicle type, and violation category
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <HourlyBarChart />
        </div>
        <VehicleTypeChart />
        <ViolationTypesDonut data={VIOLATION_TYPES} />
      </div>
    </div>
  );
}

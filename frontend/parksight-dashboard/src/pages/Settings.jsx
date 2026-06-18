import { useState } from 'react';
import clsx from 'clsx';
import { useTheme } from '../context/ThemeContext';
import { HOTSPOT_CLUSTERS, ML_STATS } from '../data/realData';

function Toggle({ id, checked, onChange }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={clsx(
        'relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none',
        checked ? 'bg-brand-blue' : 'bg-gray-600'
      )}
    >
      <span className={clsx(
        'absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200',
        checked ? 'translate-x-5' : 'translate-x-0'
      )} />
    </button>
  );
}

function SettingRow({ label, description, id, checked, onChange }) {
  const { isDark } = useTheme();
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className={clsx('text-sm font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>{label}</p>
        {description && (
          <p className={clsx('text-xs mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>{description}</p>
        )}
      </div>
      <Toggle id={id} checked={checked} onChange={onChange} />
    </div>
  );
}

function Section({ title, children, isDark }) {
  return (
    <div className={clsx(
      'rounded-xl border p-5',
      isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
    )}>
      <h3 className={clsx('text-sm font-bold mb-1 uppercase tracking-wider', isDark ? 'text-gray-400' : 'text-gray-500')}>
        {title}
      </h3>
      <div className={clsx('divide-y', isDark ? 'divide-navy-600/30' : 'divide-gray-100')}>
        {children}
      </div>
    </div>
  );
}

function exportCSV() {
  const headers = ['Rank', 'Zone', 'Station', 'Violations', 'Impact Hours', 'Impact Score'];
  const rows = HOTSPOT_CLUSTERS.map(c =>
    [c.rank, `"${c.name}"`, `"${c.station}"`, c.violations, c.impactHrs, c.score].join(',')
  );
  const blob = new Blob([[headers.join(','), ...rows].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'parksight_all_data.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function Settings() {
  const { isDark, toggleTheme } = useTheme();
  const [notifs, setNotifs] = useState({ critical: true, shifts: false, weekly: true });
  const [refreshInterval, setRefreshInterval] = useState('2');

  const setNotif = (key) => (val) => setNotifs(prev => ({ ...prev, [key]: val }));

  return (
    <div className="p-6 flex flex-col gap-5 h-full overflow-auto max-w-2xl">
      <div>
        <h2 className={clsx('text-xl font-bold', isDark ? 'text-gray-100' : 'text-gray-900')}>
          Settings
        </h2>
        <p className={clsx('text-xs mt-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
          Manage appearance, notifications, and data preferences
        </p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" isDark={isDark}>
        <SettingRow
          id="setting-theme"
          label="Dark Mode"
          description="Switch between dark and light interface"
          checked={isDark}
          onChange={toggleTheme}
        />
      </Section>

      {/* Notifications */}
      <Section title="Notifications" isDark={isDark}>
        <SettingRow
          id="setting-notif-critical"
          label="Critical zone alerts"
          description="Get notified when violations spike above threshold"
          checked={notifs.critical}
          onChange={setNotif('critical')}
        />
        <SettingRow
          id="setting-notif-shifts"
          label="Shift predictions"
          description="AI-predicted officer positioning for upcoming shifts"
          checked={notifs.shifts}
          onChange={setNotif('shifts')}
        />
        <SettingRow
          id="setting-notif-weekly"
          label="Weekly reports"
          description="Automated summary delivered every Monday"
          checked={notifs.weekly}
          onChange={setNotif('weekly')}
        />
      </Section>

      {/* Data */}
      <Section title="Data" isDark={isDark}>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className={clsx('text-sm font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>
              Refresh interval
            </p>
            <p className={clsx('text-xs mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
              How often to poll for new data
            </p>
          </div>
          <select
            id="setting-refresh-interval"
            value={refreshInterval}
            onChange={e => setRefreshInterval(e.target.value)}
            className={clsx(
              'text-xs border rounded-md px-3 py-1.5 outline-none cursor-pointer',
              isDark ? 'bg-navy-600 border-navy-500 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
            )}
          >
            <option value="2">2 minutes</option>
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
          </select>
        </div>
        <div className="flex items-center justify-between py-3">
          <div>
            <p className={clsx('text-sm font-medium', isDark ? 'text-gray-200' : 'text-gray-800')}>
              Export all data
            </p>
            <p className={clsx('text-xs mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
              Download complete dataset as CSV
            </p>
          </div>
          <button
            id="setting-export-all"
            onClick={exportCSV}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors',
              'bg-brand-blue text-white hover:bg-blue-600'
            )}
          >
            Export CSV
          </button>
        </div>
      </Section>

      {/* About */}
      <div className={clsx(
        'rounded-xl border p-5 text-center',
        isDark ? 'bg-navy-700 border-navy-600/30' : 'bg-white border-gray-200 shadow-sm'
      )}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mx-auto mb-2">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <p className={clsx('text-sm font-bold', isDark ? 'text-gray-200' : 'text-gray-800')}>ParkSight AI</p>
        <p className={clsx('text-xs mt-0.5', isDark ? 'text-gray-500' : 'text-gray-400')}>
          Parking Intelligence Dashboard · v1.0.0
        </p>
      </div>
    </div>
  );
}

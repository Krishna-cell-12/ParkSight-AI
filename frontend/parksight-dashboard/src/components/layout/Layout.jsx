import { useState } from 'react';
import clsx from 'clsx';
import Sidebar from './Sidebar';
import Header from './Header';
import { useTheme } from '../../context/ThemeContext';

import Overview      from '../../pages/Overview';
import Hotspots      from '../../pages/Hotspots';
import Violations    from '../../pages/Violations';
import ImpactAnalysis from '../../pages/ImpactAnalysis';
import Enforcement   from '../../pages/Enforcement';
import Reports       from '../../pages/Reports';
import Alerts        from '../../pages/Alerts';
import Settings      from '../../pages/Settings';

export default function Layout() {
  const { isDark } = useTheme();
  const [activePage, setActivePage] = useState('overview');

  const PAGE_MAP = {
    overview:    <Overview    onNavigate={setActivePage} />,
    hotspots:    <Hotspots    />,
    violations:  <Violations  />,
    impact:      <ImpactAnalysis />,
    enforcement: <Enforcement />,
    reports:     <Reports     />,
    alerts:      <Alerts      />,
    settings:    <Settings    />,
  };

  return (
    <div className={clsx(
      'flex h-screen overflow-hidden',
      isDark ? 'bg-navy-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    )}>
      <Sidebar activePage={activePage} onNavigate={setActivePage} />

      <div className="flex-1 flex flex-col overflow-hidden ml-40">
        <Header activePage={activePage} />
        <main className="flex-1 overflow-auto">
          {PAGE_MAP[activePage]}
        </main>
      </div>
    </div>
  );
}

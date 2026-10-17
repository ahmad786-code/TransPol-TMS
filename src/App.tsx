import React, { useState } from 'react';
import { LanguageProvider } from './i18n/LanguageContext';
import { TMSProvider } from './context/TMSContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

import { DashboardView } from './components/dashboard/DashboardView';
import { FleetView } from './components/fleet/FleetView';
import { DriversView } from './components/drivers/DriversView';
import { DispatchView } from './components/dispatch/DispatchView';
import { DeliveriesView } from './components/deliveries/DeliveriesView';
import { FuelCostsView } from './components/fuel/FuelCostsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

const MainLayout: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      <div className="flex-1 flex overflow-hidden">
        {/* Deep Navy Persistent Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
          {/* Header */}
          <Header
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onNavigateTab={setCurrentTab}
          />

          {/* Viewport Canvas */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto pb-16">
            {currentTab === 'dashboard' && <DashboardView onNavigateTab={setCurrentTab} />}
            {currentTab === 'fleet' && <FleetView />}
            {currentTab === 'drivers' && <DriversView />}
            {currentTab === 'dispatch' && <DispatchView />}
            {currentTab === 'deliveries' && <DeliveriesView />}
            {currentTab === 'fuelCosts' && <FuelCostsView />}
            {currentTab === 'reports' && <ReportsView />}
            {currentTab === 'settings' && <SettingsView />}
          </main>
        </div>
      </div>

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <TMSProvider>
        <MainLayout />
      </TMSProvider>
    </LanguageProvider>
  );
}

import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import {
  LayoutDashboard,
  Truck,
  Users,
  Compass,
  MapPin,
  Fuel,
  BarChart3,
  Settings,
  X,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { t } = useTranslation();
  const { vehicles, dispatches, drivers } = useTMS();

  // Badges calculation
  const totalVehicles = vehicles.length;
  const delayedShipmentsCount = dispatches.filter((d) => d.status === 'delayed').length;
  const driversNearLimitCount = drivers.filter((d) => d.drivingHoursToday >= 8.5).length;
  const activeDispatchesCount = dispatches.filter((d) => d.status === 'in_transit').length;

  const navItems = [
    {
      id: 'dashboard',
      label: t.nav.dashboard,
      icon: LayoutDashboard,
    },
    {
      id: 'fleet',
      label: t.nav.fleet,
      icon: Truck,
      badge: `${totalVehicles}`,
      badgeColor: 'bg-slate-800 text-slate-300',
    },
    {
      id: 'drivers',
      label: t.nav.drivers,
      icon: Users,
      badge: driversNearLimitCount > 0 ? `! ${driversNearLimitCount}` : undefined,
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-800',
    },
    {
      id: 'dispatch',
      label: t.nav.dispatch,
      icon: Compass,
      badge: `${activeDispatchesCount}`,
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-800',
    },
    {
      id: 'deliveries',
      label: t.nav.deliveries,
      icon: MapPin,
      badge: delayedShipmentsCount > 0 ? `${delayedShipmentsCount} opóźn.` : undefined,
      badgeColor: 'bg-rose-950 text-rose-300 border border-rose-800',
    },
    {
      id: 'fuelCosts',
      label: t.nav.fuelCosts,
      icon: Fuel,
    },
    {
      id: 'reports',
      label: t.nav.reports,
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: t.nav.settings,
      icon: Settings,
    },
  ];

  const handleNavClick = (tabId: string) => {
    onSelectTab(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0b1329] text-slate-200 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 font-bold text-lg tracking-wider">
              TP
            </div>
            <div>
              <div className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                TransPol TMS
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-xs text-slate-400 font-medium truncate max-w-[170px]">
                {t.nav.companyName}
              </div>
            </div>
          </div>
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="mt-3.5 px-2.5 py-1.5 bg-slate-800/60 rounded-lg border border-slate-700/50 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            {t.nav.systemActive}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">{t.nav.systemVersion}</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25 font-semibold'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${
                    isActive ? 'bg-blue-800 text-blue-100' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">

        <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>TMS TransPol © 2026</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
            Sync OK
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-xs h-full z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

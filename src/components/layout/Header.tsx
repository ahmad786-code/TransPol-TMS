import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import {
  Search,
  Bell,
  Globe,
  Menu,
  Building2,
  ChevronDown,
  Check,
  User,
  Truck,
  Compass,
  MapPin,
  Clock,
  ExternalLink,
} from 'lucide-react';

interface HeaderProps {
  onToggleMobileMenu: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMobileMenu, onNavigateTab }) => {
  const { language, setLanguage, t } = useTranslation();
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    activeHub,
    setActiveHub,
    globalSearchQuery,
    setGlobalSearchQuery,
    vehicles,
    drivers,
    dispatches,
  } = useTMS();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHubOpen, setIsHubOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Format current date according to language
  const currentDateFormatted = new Intl.DateTimeFormat(
    language === 'pl' ? 'pl-PL' : 'en-US',
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  ).format(new Date(2026, 9, 17)); // 17 October 2026

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (hubRef.current && !hubRef.current.contains(e.target as Node)) {
        setIsHubOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter global search results
  const searchResults = React.useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q) return { vehicles: [], drivers: [], dispatches: [] };

    return {
      vehicles: vehicles
        .filter(
          (v) =>
            v.registration.toLowerCase().includes(q) ||
            v.brandModel.toLowerCase().includes(q) ||
            v.location.toLowerCase().includes(q)
        )
        .slice(0, 3),
      drivers: drivers
        .filter(
          (d) =>
            d.fullName.toLowerCase().includes(q) ||
            d.phone.toLowerCase().includes(q) ||
            (d.currentRoute && d.currentRoute.toLowerCase().includes(q))
        )
        .slice(0, 3),
      dispatches: dispatches
        .filter(
          (dsp) =>
            dsp.dispatchNumber.toLowerCase().includes(q) ||
            dsp.customerName.toLowerCase().includes(q) ||
            dsp.originCity.toLowerCase().includes(q) ||
            dsp.destinationCity.toLowerCase().includes(q)
        )
        .slice(0, 3),
    };
  }, [globalSearchQuery, vehicles, drivers, dispatches]);

  const hasSearchResults =
    searchResults.vehicles.length > 0 ||
    searchResults.drivers.length > 0 ||
    searchResults.dispatches.length > 0;

  const hubs = [
    { id: 'warsaw', label: t.nav.hubWarsaw, count: '12 ciągników' },
    { id: 'poznan', label: t.nav.hubPoznan, count: '10 ciągników' },
    { id: 'katowice', label: t.nav.hubKatowice, count: '8 ciągników' },
  ];

  const currentHubLabel = hubs.find((h) => h.id === activeHub)?.label || t.nav.hubWarsaw;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs px-4 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger + Hub / Company selector */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Company & Depot Selector */}
          <div className="relative" ref={hubRef}>
            <button
              onClick={() => setIsHubOpen(!isHubOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-left"
            >
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight">
                  {t.nav.companyName}
                </div>
                <div className="text-[11px] text-slate-500 font-medium">
                  {currentHubLabel}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {isHubOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Bazy logistyczne / Huby
                </div>
                {hubs.map((hub) => (
                  <button
                    key={hub.id}
                    onClick={() => {
                      setActiveHub(hub.id);
                      setIsHubOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      activeHub === hub.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{hub.label}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{hub.count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Stamp */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 font-medium pl-3 border-l border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="capitalize">{currentDateFormatted}</span>
          </div>
        </div>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2 relative" ref={searchRef}>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder={t.nav.searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100/80 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 placeholder-slate-400"
            />
            {globalSearchQuery && (
              <button
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-mono"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchFocused && globalSearchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 z-50 max-h-96 overflow-y-auto">
              {!hasSearchResults ? (
                <div className="p-4 text-center text-xs text-slate-500">
                  {t.nav.noSearchResults} &quot;{globalSearchQuery}&quot;
                </div>
              ) : (
                <div className="space-y-3">
                  {searchResults.vehicles.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                        <Truck className="w-3 h-3 text-blue-500" />
                        Pojazdy we flocie
                      </div>
                      {searchResults.vehicles.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            onNavigateTab('fleet');
                            setIsSearchFocused(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 font-mono mr-2">
                              {v.registration}
                            </span>
                            <span className="text-slate-600">{v.brandModel}</span>
                          </div>
                          <span className="text-slate-400">{v.location}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.drivers.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                        <User className="w-3 h-3 text-emerald-500" />
                        Kierowcy
                      </div>
                      {searchResults.drivers.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => {
                            onNavigateTab('drivers');
                            setIsSearchFocused(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left text-xs"
                        >
                          <div>
                            <span className="font-semibold text-slate-900 mr-2">{d.fullName}</span>
                            <span className="text-slate-500 font-mono">{d.phone}</span>
                          </div>
                          <span className="text-xs text-blue-600">{d.status}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {searchResults.dispatches.length > 0 && (
                    <div>
                      <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase flex items-center gap-1.5">
                        <Compass className="w-3 h-3 text-amber-500" />
                        Zlecenia i trasy
                      </div>
                      {searchResults.dispatches.map((dsp) => (
                        <button
                          key={dsp.id}
                          onClick={() => {
                            onNavigateTab('dispatch');
                            setIsSearchFocused(false);
                          }}
                          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-900 font-mono mr-2">
                              {dsp.dispatchNumber}
                            </span>
                            <span className="text-slate-600">
                              {dsp.originCity} → {dsp.destinationCity}
                            </span>
                          </div>
                          <span className="text-slate-400 font-mono">{dsp.ratePln} zł</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Notifications + PL/EN Switcher + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher: PL | EN (Mandatory) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setLanguage('pl')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'pl'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Polski (Domyślny)"
            >
              PL
            </button>
            <span className="text-slate-300 text-xs px-0.5">|</span>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="English (Translate instantly)"
            >
              EN
            </button>
          </div>

          {/* Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Powiadomienia"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{t.notifications.title}</span>
                    {unreadCount > 0 && (
                      <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full font-mono">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {t.notifications.markAllRead}
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500">
                      {t.notifications.allCaughtUp}
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          if (notif.targetTab) {
                            onNavigateTab(notif.targetTab);
                            setIsNotifOpen(false);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                          notif.read
                            ? 'bg-slate-50/60 border-slate-100 text-slate-600'
                            : notif.type === 'danger'
                            ? 'bg-rose-50 border-rose-200 text-rose-900 font-medium'
                            : notif.type === 'warning'
                            ? 'bg-amber-50 border-amber-200 text-amber-900 font-medium'
                            : 'bg-blue-50 border-blue-200 text-blue-900 font-medium'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate">{notif.title}</span>
                          <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                          {notif.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
                JK
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-semibold text-slate-900 leading-none">
                  Jan Kowalski
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {t.nav.leadDispatcher}
                </div>
              </div>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="font-semibold text-xs text-slate-900">Jan Kowalski</div>
                  <div className="text-[11px] text-slate-500">dyspozycja@transpol-tms.pl</div>
                  <div className="mt-1 text-[10px] text-emerald-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {t.nav.online}
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      onNavigateTab('settings');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.nav.settings}
                  </button>
                  <button
                    onClick={() => {
                      onNavigateTab('dashboard');
                      setIsProfileOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-xs text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    {t.nav.systemLogs}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import {
  Truck,
  CheckCircle,
  AlertTriangle,
  Clock,
  Fuel,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  MapPin,
  ChevronRight,
  Check,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';

interface DashboardViewProps {
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigateTab }) => {
  const { t, formatCurrency, formatNumber } = useTranslation();
  const { metrics, dispatches, notifications, advanceDispatchStage, markNotificationAsRead } = useTMS();

  // Pie chart data: Deliveries status
  const pieData = [
    { name: t.dashboard.deliveredCount, value: 4, color: '#16a34a' },
    { name: t.dashboard.inTransitDeliveries, value: metrics.deliveriesInProgress, color: '#2563eb' },
    { name: t.dashboard.delayedCount, value: metrics.deliveriesAtRisk, color: '#e11d48' },
    { name: t.dashboard.plannedDeliveries, value: 2, color: '#94a3b8' },
  ];

  // Weekly deliveries performance data (Monday to Sunday)
  const weeklyData = [
    { day: 'Pon / Mon', onTime: 18, delayed: 1 },
    { day: 'Wt / Tue', onTime: 22, delayed: 2 },
    { day: 'Śr / Wed', onTime: 24, delayed: 1 },
    { day: 'Czw / Thu', onTime: 21, delayed: 0 },
    { day: 'Pt / Fri', onTime: 26, delayed: 3 },
    { day: 'Sob / Sat', onTime: 15, delayed: 1 },
    { day: 'Ndz / Sun', onTime: 8, delayed: 0 },
  ];

  // Monthly fuel spending trend data (May - Oct)
  const monthlyFuelData = [
    { month: 'Maj / May', cost: 43200, avgL: 28.5 },
    { month: 'Cze / Jun', cost: 45800, avgL: 28.2 },
    { month: 'Lip / Jul', cost: 47100, avgL: 28.4 },
    { month: 'Sie / Aug', cost: 46500, avgL: 28.1 },
    { month: 'Wrz / Sep', cost: 49200, avgL: 28.3 },
    { month: 'Paź / Oct', cost: metrics.monthlyFuelExpensesPln, avgL: 27.9 },
  ];

  const recentDispatches = dispatches.slice(0, 5);
  const unreadAlerts = notifications.filter((n) => !n.read).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Page Title & Subtitle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.dashboard.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('dispatch')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>{t.dispatch.newDispatch}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Active Trucks */}
        <div
          onClick={() => onNavigateTab('fleet')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.activeTrucks}</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-105 transition-transform">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.activeTrucks}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">/ 30</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">80% taboru w ruchu</div>
        </div>

        {/* Available Trucks */}
        <div
          onClick={() => onNavigateTab('fleet')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.availableTrucks}</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-105 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.availableTrucks}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">zestawów</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Gotowe do dyspozycji</div>
        </div>

        {/* Deliveries in Progress */}
        <div
          onClick={() => onNavigateTab('deliveries')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.deliveriesInProgress}</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {metrics.deliveriesInProgress}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">tras</span>
          </div>
          <div className="mt-1 text-[11px] text-indigo-600 font-medium">A1, A2, A4, S3, S7</div>
        </div>

        {/* Deliveries at Risk */}
        <div
          onClick={() => onNavigateTab('deliveries')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-rose-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.deliveriesAtRisk}</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600 font-mono tabular-nums">
              {metrics.deliveriesAtRisk}
            </span>
            <span className="text-[11px] text-rose-500 font-mono">opóźnienia</span>
          </div>
          <div className="mt-1 text-[11px] text-rose-600 font-medium">Wymaga kontaktu z klientem</div>
        </div>

        {/* Monthly Fuel Expenses */}
        <div
          onClick={() => onNavigateTab('fuelCosts')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.monthlyFuelExpenses}</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl group-hover:scale-105 transition-transform">
              <Fuel className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.monthlyFuelExpensesPln)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">Śr. 27.9 L/100 km</div>
        </div>

        {/* Estimated Monthly Operating Costs */}
        <div
          onClick={() => onNavigateTab('fuelCosts')}
          className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-purple-300 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.dashboard.estimatedOperatingCosts}</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl group-hover:scale-105 transition-transform">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {formatCurrency(metrics.estimatedOperatingCostsPln)}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">Paliwo, e-TOLL, leasing</div>
        </div>
      </div>

      {/* Charts Grid: 3 Analytical Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donut breakdown of delivery statuses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.dashboard.deliveryStatusOverview}</h3>
              <span className="text-[11px] text-slate-400 font-mono">Dzisiaj / Today</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Bieżący podział zadeklarowanych przewozów</p>
          </div>

          <div className="h-56 my-2 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any) => [`${value} zleceń`, 'Liczba']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 font-mono">
                {metrics.deliveriesInProgress + metrics.deliveriesAtRisk + 4}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-medium">Wszystkie</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}:</span>
                <span className="font-bold text-slate-900 font-mono">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Weekly Delivery Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.dashboard.weeklyPerformance}</h3>
              <span className="text-[11px] text-emerald-600 font-semibold font-mono">OTD: 96.4%</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{t.dashboard.onTimeVsDelayed}</p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="onTime" name="Na czas / On-time" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="delayed" name="Opóźnione / Delayed" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Łącznie w tym tygodniu: <strong className="text-slate-800 font-mono">138 transportów</strong></span>
            <span className="text-blue-600 font-medium">94.8% cel osiągnięty</span>
          </div>
        </div>

        {/* Chart 3: Monthly Fuel Spending Trend */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t.dashboard.monthlyFuelSpending}</h3>
              <span className="text-[11px] text-slate-400 font-mono">Orlen / Shell / BP</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Wydatki netto (PLN) oraz spadek spalania floty</p>
          </div>

          <div className="h-56 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyFuelData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  formatter={(val: any, name: any) => [
                    name === 'cost' ? `${formatNumber(val)} zł` : `${val} L/100km`,
                    name === 'cost' ? 'Koszt paliwa' : 'Śr. spalanie',
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Line type="monotone" dataKey="cost" name="cost" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Ostatni miesiąc: <strong className="text-slate-800 font-mono">{formatCurrency(metrics.monthlyFuelExpensesPln)}</strong></span>
            <span className="text-emerald-600 font-medium">-0.6 L/100km (Eco-Drive)</span>
          </div>
        </div>
      </div>

      {/* Two-Column Lower Section: Recent Dispatches & Operational Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Dispatches Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.dashboard.recentDispatches}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Dyspozycje transportowe i aktualne okienka</p>
            </div>
            <button
              onClick={() => onNavigateTab('dispatch')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <span>{t.dashboard.viewAllDispatches}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3">{t.dispatch.dispatchNo}</th>
                  <th className="px-4 py-3">{t.dispatch.route}</th>
                  <th className="px-4 py-3">{t.dispatch.dates}</th>
                  <th className="px-4 py-3">{t.common.status}</th>
                  <th className="px-4 py-3 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDispatches.map((dsp) => {
                  let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  let statusText = t.statuses.in_transit;
                  if (dsp.status === 'delayed') {
                    statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                    statusText = t.statuses.delayed;
                  } else if (dsp.status === 'delivered') {
                    statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    statusText = t.statuses.delivered;
                  } else if (dsp.status === 'planned') {
                    statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                    statusText = t.statuses.planned;
                  } else if (dsp.status === 'assigned') {
                    statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
                    statusText = t.statuses.assigned;
                  }

                  return (
                    <tr key={dsp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold font-mono text-slate-900">{dsp.dispatchNumber}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[150px]">{dsp.customerName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <span>{dsp.originCity}</span>
                          <span className="text-slate-400">→</span>
                          <span>{dsp.destinationCity}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {dsp.routeDistanceKm} km · {dsp.weightTonnes} t
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-slate-700 font-medium">ETA: {dsp.plannedDeliveryTime}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{dsp.plannedDeliveryDate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                          {statusText}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {dsp.status !== 'delivered' ? (
                          <button
                            onClick={() => advanceDispatchStage(dsp.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                          >
                            {t.common.advanceStage}
                          </button>
                        ) : (
                          <span className="text-[11px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                            <Check className="w-3.5 h-3.5" />
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Operational Alerts & Issues */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.dashboard.alertsAndIssues}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Zdarzenia wymagające reakcji spedytora</p>
            </div>
            <span className="bg-rose-100 text-rose-700 text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
              {unreadAlerts.length} aktywne
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[360px]">
            {unreadAlerts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Wszystkie alerty operacyjne rozwiązane!
              </div>
            ) : (
              unreadAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-xl border text-xs transition-all ${
                    alert.type === 'danger'
                      ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                      : alert.type === 'warning'
                      ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                      : 'bg-blue-50/70 border-blue-200 text-blue-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold leading-tight">{alert.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{alert.timestamp}</span>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
                    {alert.message}
                  </p>
                  <div className="mt-2.5 flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <button
                      onClick={() => {
                        if (alert.targetTab) onNavigateTab(alert.targetTab);
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>{t.common.viewDetails}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => markNotificationAsRead(alert.id)}
                      className="text-[11px] text-slate-500 hover:text-slate-800 font-medium"
                    >
                      {t.dashboard.markAsRead}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex items-center justify-between text-xs text-slate-500">
            <span>Automatyczny nadzór GPS & Tacho</span>
            <span className="text-emerald-600 font-medium">Aktywny 24/7</span>
          </div>
        </div>
      </div>
    </div>
  );
};

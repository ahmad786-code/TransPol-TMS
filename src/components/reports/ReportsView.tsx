import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle,
  Truck,
  Users,
  Fuel,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  LineChart,
  Line,
  Legend,
} from 'recharts';

export const ReportsView: React.FC = () => {
  const { t, formatCurrency, formatNumber } = useTranslation();
  const { metrics, vehicles, drivers, dispatches, showToast } = useTMS();

  const [reportPeriod, setReportPeriod] = useState<'month' | 'quarter' | 'year'>('month');

  // Monthly revenue vs cost historical trend
  const financialTrendsData = [
    { month: 'Maj / May', revenue: 215000, costs: 118000, margin: 97000 },
    { month: 'Cze / Jun', revenue: 228000, costs: 122000, margin: 106000 },
    { month: 'Lip / Jul', revenue: 234000, costs: 125000, margin: 109000 },
    { month: 'Sie / Aug', revenue: 226000, costs: 120500, margin: 105500 },
    { month: 'Wrz / Sep', revenue: 242000, costs: 124800, margin: 117200 },
    { month: 'Paź / Oct', revenue: metrics.revenueThisMonthPln, costs: metrics.estimatedOperatingCostsPln, margin: metrics.revenueThisMonthPln - metrics.estimatedOperatingCostsPln },
  ];

  // Performance ranking table for Top Vehicles
  const vehiclePerformanceList = useMemo(() => {
    return vehicles.slice(0, 8).map((v, idx) => {
      const tripsCount = 12 + ((idx * 3) % 8);
      const kmCovered = tripsCount * 320;
      const punctuality = 95.0 + (idx % 5);
      const ecoScore = 8.5 + (idx % 2) * 0.8;

      return {
        registration: v.registration,
        model: v.brandModel,
        trips: tripsCount,
        km: kmCovered,
        punctuality: `${punctuality.toFixed(1)}%`,
        avgFuel: `${v.averageConsumptionLPer100Km} L`,
        ecoScore: `${ecoScore.toFixed(1)} / 10`,
      };
    });
  }, [vehicles]);

  // Performance ranking table for Top Drivers
  const driverPerformanceList = useMemo(() => {
    return drivers.slice(0, 8).map((d, idx) => {
      const trips = 14 + ((idx * 2) % 6);
      const km = trips * 315;
      const onTime = 96.0 + (idx % 4);
      return {
        name: d.fullName,
        trips,
        km,
        onTime: `${onTime.toFixed(1)}%`,
        hoursWeek: `${d.drivingHoursWeek}h`,
      };
    });
  }, [drivers]);

  const handleExportPerformanceCSV = () => {
    const filename = `transpol_raport_efektywnosci_${new Date().toISOString().split('T')[0]}.csv`;
    let csv = 'TransPol TMS - Raport Efektywnosci Taboru i Kierowcow\n\n';
    csv += 'POJAZD;MODEL;KURSOW;KILOMETRY;PUNKTUALNOSC;SREDNIE SPALANIE;EKO-SCORE\n';

    vehiclePerformanceList.forEach((v) => {
      csv += `"${v.registration}";"${v.model}";${v.trips};${v.km};"${v.punctuality}";"${v.avgFuel}";"${v.ecoScore}"\n`;
    });

    csv += '\nKIEROWCA;ZREALIZOWANE KURSY;PRZEJECHANE KM;PUNKTUALNOSC;CZAS JAZDY TYDZIEN\n';
    driverPerformanceList.forEach((d) => {
      csv += `"${d.name}";${d.trips};${d.km};"${d.onTime}";"${d.hoursWeek}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Raport analityczny został pobrany jako CSV.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.reports.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.reports.subtitle}</p>
        </div>
        <button
          onClick={handleExportPerformanceCSV}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{t.reports.exportReportCsv}</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.reports.onTimeDeliveryRate}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">
            {metrics.onTimeDeliveryRatePercent}%
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">Cel operacyjny &gt; 95%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.reports.fleetUtilization}</span>
            <Truck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">88.2%</div>
          <div className="mt-1 text-[11px] text-blue-600 font-medium">Wskaźnik efektywności taboru</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.reports.netMargin}</span>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900">
            {formatCurrency(metrics.revenueThisMonthPln - metrics.estimatedOperatingCostsPln)}
          </div>
          <div className="mt-1 text-[11px] text-purple-600 font-medium">Marża brutto ~49%</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.reports.avgCostKm}</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-slate-900">4.12 zł</div>
          <div className="mt-1 text-[11px] text-slate-500">za 1 wozokilometr (km)</div>
        </div>
      </div>

      {/* Main Chart: Monthly Trends (Revenue vs Operating Costs vs Margin) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-2 border-b border-slate-100 gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.reports.monthlyTrends}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Analiza rentowności frachtów w ujęciu wielomiesięcznym</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Maj 2026 – Październik 2026</span>
          </div>
        </div>

        <div className="h-72 my-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialTrendsData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RechartsTooltip
                formatter={(val: any) => [`${formatNumber(val)} zł`, '']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="revenue" name="Przychody z frachtu" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costs" name="Koszty operacyjne" fill="#94a3b8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="margin" name="Marża zysku" fill="#16a34a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Tables Grid: Vehicle Asset Ranking + Driver Ranking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles Ranking */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">{t.reports.performanceByTruck}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Przebieg, punktualność i średnie spalanie ciągników</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Pojazd</th>
                  <th className="px-4 py-2.5">{t.reports.completedTrips}</th>
                  <th className="px-4 py-2.5">{t.reports.distanceCovered}</th>
                  <th className="px-4 py-2.5">{t.reports.punctuality}</th>
                  <th className="px-4 py-2.5">{t.fleet.avgConsumption}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehiclePerformanceList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-mono font-bold text-slate-900">
                      {row.registration}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{row.trips}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{formatNumber(row.km)} km</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 font-semibold">
                      {row.punctuality}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-800">{row.avgFuel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drivers Ranking */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">{t.reports.performanceByDriver}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Punktualność odbiorów i godziny w trasie</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100">
                <tr>
                  <th className="px-4 py-2.5">Kierowca</th>
                  <th className="px-4 py-2.5">{t.reports.completedTrips}</th>
                  <th className="px-4 py-2.5">{t.reports.distanceCovered}</th>
                  <th className="px-4 py-2.5">{t.reports.punctuality}</th>
                  <th className="px-4 py-2.5">Jazda tydz.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {driverPerformanceList.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{row.name}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{row.trips}</td>
                    <td className="px-4 py-2.5 font-mono text-slate-700">{formatNumber(row.km)} km</td>
                    <td className="px-4 py-2.5 font-mono text-emerald-600 font-semibold">
                      {row.onTime}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-800">{row.hoursWeek}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

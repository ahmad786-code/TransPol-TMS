import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import { FuelEntry, Expense, ExpenseCategory } from '../../types';
import {
  Fuel,
  Wallet,
  Gauge,
  TrendingDown,
  Plus,
  Download,
  Search,
  Filter,
  Calendar,
  Truck,
  Building2,
  FileSpreadsheet,
  X,
  CreditCard,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const FuelCostsView: React.FC = () => {
  const { t, formatCurrency, formatNumber, formatDate } = useTranslation();
  const {
    fuelEntries,
    expenses,
    vehicles,
    drivers,
    addFuelEntry,
    addExpense,
    showToast,
  } = useTMS();

  const [activeTab, setActiveTab] = useState<'fuel' | 'expenses'>('fuel');
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>('all');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Modals state
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  // Fuel Form state
  const [fuelForm, setFuelForm] = useState({
    vehicleId: vehicles[0]?.id || '',
    driverId: drivers[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    liters: 450,
    pricePerLiterPln: 6.58,
    odometerKm: 145000,
    gasStation: 'Orlen MOP Brwinów A2',
    city: 'Brwinów (A2)',
    paymentMethod: 'Karta paliwowa Orlen Flota',
  });

  // Expense Form state
  const [expenseForm, setExpenseForm] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'toll_etoll' as ExpenseCategory,
    vehicleId: '',
    amountPln: 4500,
    description: 'Doładowanie salda e-TOLL',
    invoiceNumber: 'FV/ET/2026/10/89',
    vendorName: 'Ministerstwo Finansów / e-TOLL',
  });

  // Filtered Fuel Entries
  const filteredFuelEntries = useMemo(() => {
    return fuelEntries.filter((f) => {
      if (selectedVehicleFilter !== 'all' && f.vehicleId !== selectedVehicleFilter) {
        return false;
      }
      return true;
    });
  }, [fuelEntries, selectedVehicleFilter]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (selectedVehicleFilter !== 'all' && e.vehicleId && e.vehicleId !== selectedVehicleFilter) {
        return false;
      }
      return true;
    });
  }, [expenses, selectedVehicleFilter]);

  // Total sums
  const totalFuelCost = useMemo(() => {
    return fuelEntries.reduce((sum, f) => sum + f.costPln, 0);
  }, [fuelEntries]);

  const totalFuelLiters = useMemo(() => {
    return fuelEntries.reduce((sum, f) => sum + f.liters, 0);
  }, [fuelEntries]);

  const totalTolls = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'toll_etoll')
      .reduce((sum, e) => sum + e.amountPln, 0);
  }, [expenses]);

  const totalMaintenance = useMemo(() => {
    return expenses
      .filter((e) => e.category === 'maintenance')
      .reduce((sum, e) => sum + e.amountPln, 0);
  }, [expenses]);

  // Chart 1: Spending by vehicle (Top 6 trucks)
  const spendingByTruckData = useMemo(() => {
    const map = new Map<string, number>();
    fuelEntries.forEach((f) => {
      const v = vehicles.find((veh) => veh.id === f.vehicleId);
      const label = v ? v.registration : f.vehicleId;
      map.set(label, (map.get(label) || 0) + f.costPln);
    });

    return Array.from(map.entries())
      .map(([truck, amount]) => ({ truck, amount: Math.round(amount) }))
      .slice(0, 6);
  }, [fuelEntries, vehicles]);

  // Chart 2: Cost Structure Breakdown
  const costStructureData = useMemo(() => {
    const categories: { name: string; value: number; color: string }[] = [
      { name: t.expenseCategories.fuel, value: Math.round(totalFuelCost), color: '#2563eb' },
      { name: t.expenseCategories.toll_etoll, value: Math.round(totalTolls), color: '#059669' },
      { name: t.expenseCategories.leasing, value: 34500, color: '#7c3aed' },
      { name: t.expenseCategories.driver_allowance, value: 24600, color: '#d97706' },
      { name: t.expenseCategories.maintenance, value: Math.round(totalMaintenance), color: '#dc2626' },
      { name: t.expenseCategories.insurance, value: 11200, color: '#0891b2' },
    ];
    return categories;
  }, [totalFuelCost, totalTolls, totalMaintenance, t]);

  // Budget vs Actual spending
  const budgetVsActualData = [
    { category: 'Paliwo / Fuel', budget: 52000, actual: Math.round(totalFuelCost) },
    { category: 'e-TOLL & Autostrady', budget: 22000, actual: Math.round(totalTolls) },
    { category: 'Serwis / Service', budget: 14000, actual: Math.round(totalMaintenance) },
    { category: 'Diety / Allowances', budget: 25000, actual: 24600 },
  ];

  // CSV Export for Fuel or Expenses
  const handleExportCSV = () => {
    let csvContent = '';
    let filename = '';

    if (activeTab === 'fuel') {
      filename = `transpol_rejestr_paliwa_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Data;Pojazd;Lokalizacja / Stacja;Litry;Cena/L;Kwota PLN;Licznik km;Karta paliwowa\n';
      filteredFuelEntries.forEach((f) => {
        const v = vehicles.find((veh) => veh.id === f.vehicleId);
        csvContent += `${f.date};"${v?.registration || f.vehicleId}";"${f.gasStation}";${f.liters};${f.pricePerLiterPln};${f.costPln};${f.odometerKm};"${f.paymentMethod}"\n`;
      });
    } else {
      filename = `transpol_koszty_operacyjne_${new Date().toISOString().split('T')[0]}.csv`;
      csvContent = 'Data;Kategoria;Wystawca;Kwota PLN;Nr Faktury;Opis\n';
      filteredExpenses.forEach((e) => {
        csvContent += `${e.date};"${t.expenseCategories[e.category] || e.category}";"${e.vendorName}";${e.amountPln};"${e.invoiceNumber}";"${e.description}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(t.fuel.csvExportNotice, 'success');
  };

  const handleFuelSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cost = Math.round(fuelForm.liters * fuelForm.pricePerLiterPln * 100) / 100;
    addFuelEntry({
      ...fuelForm,
      costPln: cost,
      calculatedConsumptionL100Km: 27.9,
    });
    setIsFuelModalOpen(false);
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      ...expenseForm,
      vehicleId: expenseForm.vehicleId || undefined,
    });
    setIsExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.fuel.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.fuel.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsFuelModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Fuel className="w-3.5 h-3.5" />
            <span>{t.fuel.addFuelEntry}</span>
          </button>
          <button
            onClick={() => setIsExpenseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.fuel.addExpense}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.fuel.monthlyFuelExp}</span>
            <Fuel className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900">
            {formatCurrency(totalFuelCost)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500 font-mono">
            {formatNumber(totalFuelLiters)} {t.common.liters} ON
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.fuel.avgConsumptionFleet}</span>
            <Gauge className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900">28.1 L</div>
          <div className="mt-1 text-[11px] text-emerald-600 font-medium">-0.4 L vs poprzedni mies.</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.fuel.costPerKm}</span>
            <TrendingDown className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900">4.12 zł / km</div>
          <div className="mt-1 text-[11px] text-slate-500">Paliwo + e-TOLL + opony</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">{t.fuel.tollExpenses}</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-slate-900">
            {formatCurrency(totalTolls)}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">e-TOLL + A2/A4 koncesje</div>
        </div>
      </div>

      {/* Charts Row: Cost Breakdown + Budget vs Actual */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Structure Pie */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.fuel.costStructure}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Podział wszystkich kosztów operacyjnych floty</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costStructureData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {costStructureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(val: any) => [`${formatNumber(val)} zł`, 'Kwota']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-xs">
            {costStructureData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-600 truncate">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget vs Actual Spending Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.fuel.budgetVsActual}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Porównanie założeń budżetowych z realizacją (PLN)</p>
          </div>

          <div className="h-64 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetVsActualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  formatter={(val: any) => [`${formatNumber(val)} zł`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="budget" name="Budżet / Budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Wykonanie / Actual" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Oszczędność w stosunku do budżetu:</span>
            <span className="font-bold text-emerald-600 font-mono">+4 120 zł (W normie)</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Data Tables */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Selector & CSV Button */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('fuel')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'fuel' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.fuel.fuelTableTitle}
              </button>
              <button
                onClick={() => setActiveTab('expenses')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'expenses' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                {t.fuel.expenseTableTitle}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Vehicle filter */}
            <select
              value={selectedVehicleFilter}
              onChange={(e) => setSelectedVehicleFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">Wszystkie pojazdy</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registration}
                </option>
              ))}
            </select>

            {/* CSV Export Button (Working) */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t.fuel.exportCsvBtn}</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Fuel Entries Table */}
        {activeTab === 'fuel' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">{t.fuel.date}</th>
                  <th className="px-4 py-3.5">{t.fuel.truck}</th>
                  <th className="px-4 py-3.5">{t.fuel.station}</th>
                  <th className="px-4 py-3.5">{t.fuel.liters}</th>
                  <th className="px-4 py-3.5">{t.fuel.pricePerLiter}</th>
                  <th className="px-4 py-3.5">{t.fuel.totalCost}</th>
                  <th className="px-4 py-3.5">{t.fuel.odometer}</th>
                  <th className="px-4 py-3.5">{t.fuel.calcL100}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFuelEntries.map((fuel) => {
                  const veh = vehicles.find((v) => v.id === fuel.vehicleId);
                  return (
                    <tr key={fuel.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-slate-600">{fuel.date}</td>
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900">
                        {veh ? veh.registration : fuel.vehicleId}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{fuel.gasStation}</td>
                      <td className="px-4 py-3.5 font-mono font-medium text-slate-800">
                        {fuel.liters} L
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {fuel.pricePerLiterPln.toFixed(2)} zł
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {formatCurrency(fuel.costPln)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {formatNumber(fuel.odometerKm)} km
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-600 font-bold">
                        {fuel.calculatedConsumptionL100Km || 28.0} L
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Expenses Table */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">{t.fuel.date}</th>
                  <th className="px-4 py-3.5">{t.fuel.category}</th>
                  <th className="px-4 py-3.5">{t.fuel.vendor}</th>
                  <th className="px-4 py-3.5">{t.fuel.description}</th>
                  <th className="px-4 py-3.5">{t.fuel.invoiceNo}</th>
                  <th className="px-4 py-3.5 text-right">{t.fuel.amount}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 font-mono text-slate-600">{exp.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {t.expenseCategories[exp.category] || exp.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">{exp.vendorName}</td>
                    <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{exp.description}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-500">{exp.invoiceNumber}</td>
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-900">
                      {formatCurrency(exp.amountPln)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Fuel Entry Modal */}
      {isFuelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t.fuel.addFuelEntry}</h3>
              <button onClick={() => setIsFuelModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFuelSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.truck} *</label>
                <select
                  value={fuelForm.vehicleId}
                  onChange={(e) => setFuelForm({ ...fuelForm, vehicleId: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.registration} ({v.brandModel})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.fuel.liters} *</label>
                  <input
                    type="number"
                    value={fuelForm.liters}
                    onChange={(e) => setFuelForm({ ...fuelForm, liters: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">{t.fuel.pricePerLiter} (zł) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={fuelForm.pricePerLiterPln}
                    onChange={(e) => setFuelForm({ ...fuelForm, pricePerLiterPln: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.station} *</label>
                <input
                  type="text"
                  value={fuelForm.gasStation}
                  onChange={(e) => setFuelForm({ ...fuelForm, gasStation: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.odometer} (km)</label>
                <input
                  type="number"
                  value={fuelForm.odometerKm}
                  onChange={(e) => setFuelForm({ ...fuelForm, odometerKm: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl text-slate-700 flex items-center justify-between">
                <span>Łączny koszt tankowania:</span>
                <span className="font-bold font-mono text-sm text-blue-600">
                  {formatCurrency(Math.round(fuelForm.liters * fuelForm.pricePerLiterPln * 100) / 100)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFuelModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Operating Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">{t.fuel.addExpense}</h3>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.category} *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white"
                >
                  <option value="toll_etoll">{t.expenseCategories.toll_etoll}</option>
                  <option value="maintenance">{t.expenseCategories.maintenance}</option>
                  <option value="driver_allowance">{t.expenseCategories.driver_allowance}</option>
                  <option value="leasing">{t.expenseCategories.leasing}</option>
                  <option value="insurance">{t.expenseCategories.insurance}</option>
                  <option value="other">{t.expenseCategories.other}</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.amount} (PLN brutto) *</label>
                <input
                  type="number"
                  value={expenseForm.amountPln}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amountPln: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.vendor} *</label>
                <input
                  type="text"
                  value={expenseForm.vendorName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, vendorName: e.target.value })}
                  placeholder="np. Autostrada Wielkopolska S.A."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.fuel.description}</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  placeholder="Opis wydatku..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

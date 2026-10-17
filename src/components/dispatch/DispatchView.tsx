import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import { Dispatch, DispatchStatus, DispatchPriority } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Compass,
  Plus,
  Search,
  Filter,
  Kanban,
  Table as TableIcon,
  Truck,
  User,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  Sparkles,
  Edit2,
  Trash2,
  CheckCircle,
  AlertTriangle,
  X,
  FastForward,
} from 'lucide-react';

export const DispatchView: React.FC = () => {
  const { t, formatCurrency, formatDate } = useTranslation();
  const {
    dispatches,
    vehicles,
    drivers,
    addDispatch,
    updateDispatch,
    deleteDispatch,
    advanceDispatchStage,
  } = useTMS();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [driverFilter, setDriverFilter] = useState<string>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingDispatch, setEditingDispatch] = useState<Dispatch | null>(null);
  const [selectedDispatch, setSelectedDispatch] = useState<Dispatch | null>(null);
  const [dispatchToDelete, setDispatchToDelete] = useState<Dispatch | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    dispatchNumber: '',
    customerName: '',
    originCity: 'Warszawa',
    originAddress: 'ul. Annopol 4, 03-236 Warszawa',
    destinationCity: 'Poznań',
    destinationAddress: 'ul. Magazynowa 12, Gądki k. Poznania',
    cargoDescription: 'Palety EURO z towarem FMCG',
    weightTonnes: 18.5,
    palletCount: 30,
    vehicleId: '',
    driverId: '',
    plannedPickupDate: '2026-10-18',
    plannedPickupTime: '08:00',
    plannedDeliveryDate: '2026-10-18',
    plannedDeliveryTime: '14:30',
    status: 'planned' as DispatchStatus,
    priority: 'normal' as DispatchPriority,
    ratePln: 3200,
    notes: 'Awizacja okno rampa nr 4. Wymagane pasy mocujące.',
    routeDistanceKm: 310,
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const filteredDispatches = useMemo(() => {
    return dispatches.filter((d) => {
      const matchesSearch =
        d.dispatchNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.originCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.destinationCity.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      const matchesDriver = driverFilter === 'all' || d.driverId === driverFilter;
      const matchesVehicle = vehicleFilter === 'all' || d.vehicleId === vehicleFilter;

      return matchesSearch && matchesStatus && matchesDriver && matchesVehicle;
    });
  }, [dispatches, searchQuery, statusFilter, driverFilter, vehicleFilter]);

  // Kanban Columns
  const kanbanColumns: { status: DispatchStatus; title: string; color: string }[] = [
    { status: 'planned', title: t.dispatch.columns.planned, color: 'border-slate-300' },
    { status: 'assigned', title: t.dispatch.columns.assigned, color: 'border-purple-400' },
    { status: 'in_transit', title: t.dispatch.columns.in_transit, color: 'border-blue-500' },
    { status: 'delayed', title: t.dispatch.columns.delayed, color: 'border-rose-500' },
    { status: 'delivered', title: t.dispatch.columns.delivered, color: 'border-emerald-500' },
  ];

  const handleOpenCreateModal = () => {
    const nextNumber = `DSP-2026-${String(dispatches.length + 85).padStart(3, '0')}`;
    setFormData({
      dispatchNumber: nextNumber,
      customerName: 'PolLogistics S.A.',
      originCity: 'Warszawa',
      originAddress: 'ul. Annopol 4, 03-236 Warszawa',
      destinationCity: 'Poznań',
      destinationAddress: 'ul. Magazynowa 12, Gądki k. Poznania',
      cargoDescription: 'Palety EURO FMCG',
      weightTonnes: 19.5,
      palletCount: 32,
      vehicleId: vehicles.find((v) => v.status === 'available')?.id || vehicles[0]?.id || '',
      driverId: drivers.find((d) => d.status === 'available')?.id || drivers[0]?.id || '',
      plannedPickupDate: '2026-10-18',
      plannedPickupTime: '08:00',
      plannedDeliveryDate: '2026-10-18',
      plannedDeliveryTime: '14:30',
      status: 'planned',
      priority: 'normal',
      ratePln: 3350,
      notes: 'Zlecenie utworzone w systemie TMS.',
      routeDistanceKm: 312,
    });
    setFormErrors({});
    setIsCreateModalOpen(true);
  };

  const prefillStandardRoute = () => {
    setFormData((prev) => ({
      ...prev,
      customerName: 'Biedronka / Jeronimo Martins Polska',
      originCity: 'Warszawa',
      originAddress: 'Centrum Dystrybucyjne Młochów k. Warszawy',
      destinationCity: 'Poznań',
      destinationAddress: 'Hub Logistyczny Komorniki A2, ul. Wiśniowa 5',
      cargoDescription: 'Artykuły spożywcze chłodzone na paletach H1',
      weightTonnes: 21.0,
      palletCount: 33,
      vehicleId: 'veh-02',
      driverId: 'drv-02',
      ratePln: 3600,
      notes: 'Trasa Warszawa - Poznań autostradą A2. Czas przejazdu ok. 3.5h + załadunek.',
      routeDistanceKm: 310,
    }));
  };

  const handleOpenEditModal = (dispatch: Dispatch) => {
    setEditingDispatch(dispatch);
    setFormData({
      dispatchNumber: dispatch.dispatchNumber,
      customerName: dispatch.customerName,
      originCity: dispatch.originCity,
      originAddress: dispatch.originAddress,
      destinationCity: dispatch.destinationCity,
      destinationAddress: dispatch.destinationAddress,
      cargoDescription: dispatch.cargoDescription,
      weightTonnes: dispatch.weightTonnes,
      palletCount: dispatch.palletCount,
      vehicleId: dispatch.vehicleId || '',
      driverId: dispatch.driverId || '',
      plannedPickupDate: dispatch.plannedPickupDate,
      plannedPickupTime: dispatch.plannedPickupTime,
      plannedDeliveryDate: dispatch.plannedDeliveryDate,
      plannedDeliveryTime: dispatch.plannedDeliveryTime,
      status: dispatch.status,
      priority: dispatch.priority,
      ratePln: dispatch.ratePln,
      notes: dispatch.notes || '',
      routeDistanceKm: dispatch.routeDistanceKm,
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.customerName.trim()) errors.customerName = t.common.required;
    if (!formData.originCity.trim()) errors.originCity = t.common.required;
    if (!formData.destinationCity.trim()) errors.destinationCity = t.common.required;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingDispatch) {
      updateDispatch({
        ...editingDispatch,
        ...formData,
        vehicleId: formData.vehicleId || undefined,
        driverId: formData.driverId || undefined,
      });
      setEditingDispatch(null);
    } else {
      addDispatch({
        ...formData,
        vehicleId: formData.vehicleId || undefined,
        driverId: formData.driverId || undefined,
      });
      setIsCreateModalOpen(false);
    }
  };

  const getDriver = (driverId?: string) => drivers.find((d) => d.id === driverId);
  const getVehicle = (vehicleId?: string) => vehicles.find((v) => v.id === vehicleId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.dispatch.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.dispatch.subtitle}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Table / Kanban view toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>{t.dispatch.kanbanView}</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>{t.dispatch.tableView}</span>
            </button>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.dispatch.newDispatch}</span>
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full md:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.dispatch.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-900"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">Wszystkie statusy</option>
            <option value="planned">{t.statuses.planned}</option>
            <option value="assigned">{t.statuses.assigned}</option>
            <option value="in_transit">{t.statuses.in_transit}</option>
            <option value="delayed">{t.statuses.delayed}</option>
            <option value="delivered">{t.statuses.delivered}</option>
          </select>

          <select
            value={driverFilter}
            onChange={(e) => setDriverFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">{t.dispatch.filterByDriver}</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName}
              </option>
            ))}
          </select>

          <select
            value={vehicleFilter}
            onChange={(e) => setVehicleFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            <option value="all">{t.dispatch.filterByVehicle}</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.registration}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban Board View */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {kanbanColumns.map((col) => {
            const columnDispatches = filteredDispatches.filter((d) => d.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200 min-h-[480px] flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color} bg-white`} />
                    <h3 className="font-bold text-xs text-slate-800">{col.title}</h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {columnDispatches.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[750px]">
                  {columnDispatches.length === 0 ? (
                    <div className="py-10 text-center text-xs text-slate-400 font-medium">
                      Brak zleceń
                    </div>
                  ) : (
                    columnDispatches.map((dsp) => {
                      const truck = getVehicle(dsp.vehicleId);
                      const driver = getDriver(dsp.driverId);

                      return (
                        <div
                          key={dsp.id}
                          onClick={() => setSelectedDispatch(dsp)}
                          className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2.5 group"
                        >
                          {/* Card Top: Number & Rate */}
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-xs text-slate-900 group-hover:text-blue-600 transition-colors">
                              {dsp.dispatchNumber}
                            </span>
                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {formatCurrency(dsp.ratePln)}
                            </span>
                          </div>

                          {/* Customer */}
                          <div className="text-xs font-semibold text-slate-800 truncate">
                            {dsp.customerName}
                          </div>

                          {/* Route */}
                          <div className="text-xs text-slate-600 flex items-center gap-1.5 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>{dsp.originCity}</span>
                            <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{dsp.destinationCity}</span>
                          </div>

                          {/* Truck & Driver Assigned */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span className="font-mono font-medium truncate max-w-[100px]">
                              {truck ? truck.registration : 'Brak pojazdu'}
                            </span>
                            <span className="truncate max-w-[100px]">
                              {driver ? driver.fullName : 'Brak kierowcy'}
                            </span>
                          </div>

                          {/* Advance Button */}
                          <div
                            className="pt-2 border-t border-slate-100 flex items-center justify-between"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span className="text-[10px] text-slate-400 font-mono">
                              ETA {dsp.plannedDeliveryTime}
                            </span>

                            {dsp.status !== 'delivered' && (
                              <button
                                onClick={() => advanceDispatchStage(dsp.id)}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors cursor-pointer"
                                title="Symuluj przejście do kolejnego etapu"
                              >
                                <FastForward className="w-3 h-3" />
                                <span>{t.common.advanceStage}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3.5">{t.dispatch.dispatchNo}</th>
                  <th className="px-4 py-3.5">{t.dispatch.customer}</th>
                  <th className="px-4 py-3.5">{t.dispatch.route}</th>
                  <th className="px-4 py-3.5">{t.dispatch.vehicleAndDriver}</th>
                  <th className="px-4 py-3.5">{t.dispatch.rate}</th>
                  <th className="px-4 py-3.5">{t.common.status}</th>
                  <th className="px-4 py-3.5 text-right">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDispatches.map((dsp) => {
                  const truck = getVehicle(dsp.vehicleId);
                  const driver = getDriver(dsp.driverId);

                  let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (dsp.status === 'delayed') statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                  if (dsp.status === 'delivered') statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  if (dsp.status === 'planned') statusBadge = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (dsp.status === 'assigned') statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';

                  return (
                    <tr
                      key={dsp.id}
                      onClick={() => setSelectedDispatch(dsp)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3.5 font-bold font-mono text-slate-900">
                        {dsp.dispatchNumber}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-800">
                        {dsp.customerName}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-medium text-slate-800">
                          {dsp.originCity} → {dsp.destinationCity}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {dsp.routeDistanceKm} km · ETA {dsp.plannedDeliveryTime}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-mono text-slate-800">
                          {truck ? truck.registration : '—'}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {driver ? driver.fullName : '—'}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">
                        {formatCurrency(dsp.ratePln)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                          {dsp.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {dsp.status !== 'delivered' && (
                            <button
                              onClick={() => advanceDispatchStage(dsp.id)}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200"
                            >
                              {t.common.advanceStage}
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(dsp)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDispatchToDelete(dsp)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatch Details Modal */}
      {selectedDispatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 p-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-600 uppercase">
                  {selectedDispatch.dispatchNumber}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedDispatch.originCity} → {selectedDispatch.destinationCity}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDispatch(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-3">
                <div>
                  <div className="text-slate-400">Zleceniodawca</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedDispatch.customerName}</div>
                </div>
                <div>
                  <div className="text-slate-400">Stawka frachtu</div>
                  <div className="font-bold text-emerald-700 font-mono mt-0.5">
                    {formatCurrency(selectedDispatch.ratePln)}
                  </div>
                </div>
              </div>

              <div className="py-1">
                <div className="font-bold text-slate-700 mb-1">Miejsca załadunku i rozładunku:</div>
                <div className="text-slate-600">
                  <strong>Załadunek:</strong> {selectedDispatch.originAddress} ({selectedDispatch.plannedPickupDate} {selectedDispatch.plannedPickupTime})
                </div>
                <div className="text-slate-600 mt-1">
                  <strong>Rozładunek:</strong> {selectedDispatch.destinationAddress} ({selectedDispatch.plannedDeliveryDate} {selectedDispatch.plannedDeliveryTime})
                </div>
              </div>

              <div className="py-1">
                <div className="font-bold text-slate-700 mb-1">Ładunek:</div>
                <div className="text-slate-600">
                  {selectedDispatch.cargoDescription} ({selectedDispatch.weightTonnes} ton, {selectedDispatch.palletCount} palet)
                </div>
              </div>

              {selectedDispatch.notes && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-amber-900">
                  <strong>Uwagi dyspozytora:</strong> {selectedDispatch.notes}
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              {selectedDispatch.status !== 'delivered' && (
                <button
                  onClick={() => {
                    advanceDispatchStage(selectedDispatch.id);
                    setSelectedDispatch(null);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <FastForward className="w-3.5 h-3.5" />
                  <span>{t.dispatch.advanceToNextStage}</span>
                </button>
              )}
              <button
                onClick={() => setSelectedDispatch(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold ml-auto"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Dispatch Modal */}
      {(isCreateModalOpen || editingDispatch) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-base text-slate-900">
                  {editingDispatch ? t.dispatch.editDispatchModalTitle : t.dispatch.createDispatchModalTitle}
                </h3>
                {!editingDispatch && (
                  <button
                    type="button"
                    onClick={prefillStandardRoute}
                    className="flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-100 hover:bg-blue-200 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>{t.dispatch.quickFillStandardBtn}</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setEditingDispatch(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dispatch # */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.dispatchNo}
                  </label>
                  <input
                    type="text"
                    value={formData.dispatchNumber}
                    onChange={(e) => setFormData({ ...formData, dispatchNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Customer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.customer} *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="np. PolLogistics S.A."
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {formErrors.customerName && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.customerName}</span>
                  )}
                </div>

                {/* Origin City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.origin} (Miasto) *
                  </label>
                  <input
                    type="text"
                    value={formData.originCity}
                    onChange={(e) => setFormData({ ...formData, originCity: e.target.value })}
                    placeholder="np. Warszawa"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Destination City */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.destination} (Miasto) *
                  </label>
                  <input
                    type="text"
                    value={formData.destinationCity}
                    onChange={(e) => setFormData({ ...formData, destinationCity: e.target.value })}
                    placeholder="np. Poznań"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Origin Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dokładny adres załadunku
                  </label>
                  <input
                    type="text"
                    value={formData.originAddress}
                    onChange={(e) => setFormData({ ...formData, originAddress: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Destination Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dokładny adres rozładunku
                  </label>
                  <input
                    type="text"
                    value={formData.destinationAddress}
                    onChange={(e) => setFormData({ ...formData, destinationAddress: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Truck Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pojazd (Ciągnik siodłowy)
                  </label>
                  <select
                    value={formData.vehicleId}
                    onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">Wybierz ciągnik...</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration} - {v.brandModel} ({v.location})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driver Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kierowca
                  </label>
                  <select
                    value={formData.driverId}
                    onChange={(e) => setFormData({ ...formData, driverId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="">Wybierz kierowcę...</option>
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cargo */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.cargo}
                  </label>
                  <input
                    type="text"
                    value={formData.cargoDescription}
                    onChange={(e) => setFormData({ ...formData, cargoDescription: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>

                {/* Rate */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.rate} (PLN)
                  </label>
                  <input
                    type="number"
                    value={formData.ratePln}
                    onChange={(e) => setFormData({ ...formData, ratePln: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DispatchStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="planned">{t.statuses.planned}</option>
                    <option value="assigned">{t.statuses.assigned}</option>
                    <option value="in_transit">{t.statuses.in_transit}</option>
                    <option value="delayed">{t.statuses.delayed}</option>
                    <option value="delivered">{t.statuses.delivered}</option>
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.dispatch.priority}
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as DispatchPriority })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-white"
                  >
                    <option value="normal">{t.priorities.normal}</option>
                    <option value="high">{t.priorities.high}</option>
                    <option value="urgent">{t.priorities.urgent}</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingDispatch(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Dispatch Confirmation Modal */}
      {dispatchToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Czy na pewno chcesz usunąć to zlecenie?"
          description={`Zlecenie ${dispatchToDelete.dispatchNumber} (${dispatchToDelete.originCity} → ${dispatchToDelete.destinationCity}) zostanie trwale usunięte.`}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          isDestructive={true}
          onConfirm={() => {
            deleteDispatch(dispatchToDelete.id);
            setDispatchToDelete(null);
          }}
          onCancel={() => setDispatchToDelete(null)}
        />
      )}
    </div>
  );
};

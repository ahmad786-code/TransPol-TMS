import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import { Vehicle, VehicleStatus, VehicleType } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Truck,
  Search,
  Filter,
  Plus,
  ArrowUpDown,
  MoreVertical,
  CheckCircle,
  AlertTriangle,
  Clock,
  Wrench,
  Fuel,
  MapPin,
  Calendar,
  X,
  Gauge,
  FileText,
  Edit2,
  Trash2,
  User,
} from 'lucide-react';

export const FleetView: React.FC = () => {
  const { t, formatNumber, formatDate } = useTranslation();
  const { vehicles, drivers, addVehicle, updateVehicle, deleteVehicle, assignDriverToVehicle } = useTMS();

  // Filters & Sorting state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof Vehicle>('registration');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    registration: '',
    brandModel: '',
    type: 'curtain_semitrailer' as VehicleType,
    year: 2023,
    euroStandard: 'Euro 6d',
    location: 'Warszawa',
    status: 'available' as VehicleStatus,
    fuelLevelPercent: 85,
    mileageKm: 120000,
    nextServiceDate: '2026-12-15',
    technicalInspectionDate: '2027-04-10',
    vin: '',
    tankCapacityLiters: 1100,
    averageConsumptionLPer100Km: 28.0,
    assignedDriverId: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles
      .filter((v) => {
        const matchesSearch =
          v.registration.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.brandModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.vin.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
        const matchesType = typeFilter === 'all' || v.type === typeFilter;

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
  }, [vehicles, searchQuery, statusFilter, typeFilter, sortField, sortDirection]);

  // Form Validation & Submit
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.registration.trim()) {
      errors.registration = t.common.required;
    } else if (formData.registration.length < 5) {
      errors.registration = 'Niepoprawny format rejestracji (np. WI 4892A)';
    }

    if (!formData.brandModel.trim()) {
      errors.brandModel = t.common.required;
    }
    if (!formData.location.trim()) {
      errors.location = t.common.required;
    }
    if (!formData.vin.trim() || formData.vin.length < 10) {
      errors.vin = 'Wymagany poprawny numer VIN (min. 10 znaków)';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData({
      registration: '',
      brandModel: 'Volvo FH 500',
      type: 'curtain_semitrailer',
      year: 2023,
      euroStandard: 'Euro 6d',
      location: 'Warszawa',
      status: 'available',
      fuelLevelPercent: 90,
      mileageKm: 95000,
      nextServiceDate: '2027-01-20',
      technicalInspectionDate: '2027-05-15',
      vin: `YV2RT40A${Math.floor(100000000 + Math.random() * 900000000)}`,
      tankCapacityLiters: 1100,
      averageConsumptionLPer100Km: 27.8,
      assignedDriverId: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      registration: vehicle.registration,
      brandModel: vehicle.brandModel,
      type: vehicle.type,
      year: vehicle.year,
      euroStandard: vehicle.euroStandard,
      location: vehicle.location,
      status: vehicle.status,
      fuelLevelPercent: vehicle.fuelLevelPercent,
      mileageKm: vehicle.mileageKm,
      nextServiceDate: vehicle.nextServiceDate,
      technicalInspectionDate: vehicle.technicalInspectionDate,
      vin: vehicle.vin,
      tankCapacityLiters: vehicle.tankCapacityLiters,
      averageConsumptionLPer100Km: vehicle.averageConsumptionLPer100Km,
      assignedDriverId: vehicle.assignedDriverId || '',
    });
    setFormErrors({});
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingVehicle) {
      updateVehicle({
        ...editingVehicle,
        ...formData,
        assignedDriverId: formData.assignedDriverId || undefined,
      });
      if (formData.assignedDriverId !== editingVehicle.assignedDriverId) {
        assignDriverToVehicle(formData.assignedDriverId, editingVehicle.id);
      }
      setEditingVehicle(null);
    } else {
      addVehicle({
        ...formData,
        assignedDriverId: formData.assignedDriverId || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const getDriverName = (driverId?: string) => {
    if (!driverId) return t.fleet.unassigned;
    const driver = drivers.find((d) => d.id === driverId);
    return driver ? driver.fullName : t.fleet.unassigned;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.fleet.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.fleet.subtitle}</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.fleet.addVehicle}</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.fleet.searchPlaceholder}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900"
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

        {/* Status & Type Selectors */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">{t.fleet.filterStatus}</option>
            <option value="available">{t.statuses.available}</option>
            <option value="in_transit">{t.statuses.in_transit}</option>
            <option value="delayed">{t.statuses.delayed}</option>
            <option value="maintenance">{t.statuses.maintenance}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="all">{t.fleet.filterType}</option>
            <option value="curtain_semitrailer">{t.vehicleTypes.curtain_semitrailer}</option>
            <option value="mega">{t.vehicleTypes.mega}</option>
            <option value="refrigerated">{t.vehicleTypes.refrigerated}</option>
            <option value="box_truck">{t.vehicleTypes.box_truck}</option>
            <option value="flatbed">{t.vehicleTypes.flatbed}</option>
          </select>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('registration')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.fleet.registration}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5">{t.fleet.brandModel}</th>
                <th className="px-4 py-3.5">{t.fleet.currentLocation}</th>
                <th className="px-4 py-3.5">{t.fleet.assignedDriver}</th>
                <th
                  onClick={() => handleSort('status')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.common.status}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fuelLevelPercent')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.fleet.fuelLevel}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('mileageKm')}
                  className="px-4 py-3.5 cursor-pointer hover:text-slate-900 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{t.fleet.mileage}</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="px-4 py-3.5">{t.fleet.nextService}</th>
                <th className="px-4 py-3.5 text-right">{t.common.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                    {t.common.noData}
                  </td>
                </tr>
              )}
              {filteredVehicles.map((vehicle) => {
                let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
                  let statusLabel = t.statuses.in_transit;
                  if (vehicle.status === 'available') {
                    statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    statusLabel = t.statuses.available;
                  } else if (vehicle.status === 'delayed') {
                    statusBadge = 'bg-rose-50 text-rose-700 border-rose-200';
                    statusLabel = t.statuses.delayed;
                  } else if (vehicle.status === 'maintenance') {
                    statusBadge = 'bg-amber-50 text-amber-700 border-amber-200';
                    statusLabel = t.statuses.maintenance;
                  }

                  const isServiceSoon =
                    new Date(vehicle.nextServiceDate).getTime() - new Date().getTime() <
                    15 * 24 * 3600 * 1000;

                  return (
                    <tr
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      {/* Registration */}
                      <td className="px-4 py-3.5">
                        <div className="font-bold font-mono text-slate-900 group-hover:text-blue-600 transition-colors">
                          {vehicle.registration}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">{vehicle.vin.slice(0, 10)}...</div>
                      </td>

                      {/* Model & Type */}
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{vehicle.brandModel}</div>
                        <div className="text-[11px] text-slate-500">
                          {t.vehicleTypes[vehicle.type] || vehicle.type}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{vehicle.location}</span>
                        </div>
                      </td>

                      {/* Driver */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5 text-slate-800">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{getDriverName(vehicle.assignedDriverId)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* Fuel Level */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                vehicle.fuelLevelPercent < 30
                                  ? 'bg-rose-500'
                                  : vehicle.fuelLevelPercent < 60
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${vehicle.fuelLevelPercent}%` }}
                            />
                          </div>
                          <span className="font-mono text-slate-700 font-medium">
                            {vehicle.fuelLevelPercent}%
                          </span>
                        </div>
                      </td>

                      {/* Mileage */}
                      <td className="px-4 py-3.5 font-mono text-slate-700 font-medium">
                        {formatNumber(vehicle.mileageKm)} km
                      </td>

                      {/* Service Date */}
                      <td className="px-4 py-3.5">
                        <div className={`font-mono ${isServiceSoon ? 'text-amber-600 font-bold' : 'text-slate-600'}`}>
                          {formatDate(vehicle.nextServiceDate)}
                        </div>
                        {isServiceSoon && (
                          <div className="text-[10px] text-amber-600 font-medium flex items-center gap-1">
                            <Wrench className="w-3 h-3" />
                            {t.fleet.serviceDueWarning}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleOpenEditModal(vehicle)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t.common.edit}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setVehicleToDelete(vehicle)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t.common.delete}
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

        {/* Vehicle Details Slide-over Drawer */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div
            className="absolute inset-0"
            onClick={() => setSelectedVehicle(null)}
          />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Drawer Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-mono">
                      {selectedVehicle.registration}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedVehicle.brandModel} ({selectedVehicle.year})
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedVehicle(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Telematics Overview */}
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.fleet.telematicsSummary}
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-slate-500">{t.fleet.fuelLevel}</div>
                      <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                        {selectedVehicle.fuelLevelPercent}%
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {Math.round((selectedVehicle.fuelLevelPercent / 100) * selectedVehicle.tankCapacityLiters)} L / {selectedVehicle.tankCapacityLiters} L
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t.fleet.avgConsumption}</div>
                      <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                        {selectedVehicle.averageConsumptionLPer100Km} L
                      </div>
                      <div className="text-[11px] text-slate-400">na 100 km</div>
                    </div>
                  </div>
                </div>

                {/* Specs List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.vehicleType}</span>
                    <span className="font-semibold text-slate-800">
                      {t.vehicleTypes[selectedVehicle.type] || selectedVehicle.type}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.assignedDriver}</span>
                    <span className="font-semibold text-slate-800">
                      {getDriverName(selectedVehicle.assignedDriverId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.currentLocation}</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedVehicle.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.mileage}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {formatNumber(selectedVehicle.mileageKm)} km
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.euroStd}</span>
                    <span className="font-mono text-slate-800">{selectedVehicle.euroStandard}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.vin}</span>
                    <span className="font-mono text-slate-800">{selectedVehicle.vin}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.fleet.nextService}</span>
                    <span className="font-mono text-slate-800">
                      {formatDate(selectedVehicle.nextServiceDate)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">{t.fleet.techInspection}</span>
                    <span className="font-mono text-slate-800">
                      {formatDate(selectedVehicle.technicalInspectionDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  handleOpenEditModal(selectedVehicle);
                  setSelectedVehicle(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.common.edit}
              </button>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Vehicle Modal */}
      {(isAddModalOpen || editingVehicle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">
                {editingVehicle ? t.fleet.editVehicle : t.fleet.addVehicle}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingVehicle(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Registration */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.registration} *
                  </label>
                  <input
                    type="text"
                    value={formData.registration}
                    onChange={(e) => setFormData({ ...formData, registration: e.target.value.toUpperCase() })}
                    placeholder="np. WI 4892A"
                    className={`w-full px-3 py-2 text-xs border rounded-xl font-mono focus:outline-none focus:ring-2 ${
                      formErrors.registration
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-200 focus:ring-blue-200'
                    }`}
                  />
                  {formErrors.registration && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.registration}</span>
                  )}
                </div>

                {/* Make & Model */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.brandModel} *
                  </label>
                  <input
                    type="text"
                    value={formData.brandModel}
                    onChange={(e) => setFormData({ ...formData, brandModel: e.target.value })}
                    placeholder="np. Volvo FH 500"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.vehicleType}
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as VehicleType })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="curtain_semitrailer">{t.vehicleTypes.curtain_semitrailer}</option>
                    <option value="mega">{t.vehicleTypes.mega}</option>
                    <option value="refrigerated">{t.vehicleTypes.refrigerated}</option>
                    <option value="box_truck">{t.vehicleTypes.box_truck}</option>
                    <option value="flatbed">{t.vehicleTypes.flatbed}</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.currentLocation} *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="np. Warszawa"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Assigned Driver */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.assignedDriver}
                  </label>
                  <select
                    value={formData.assignedDriverId}
                    onChange={(e) => setFormData({ ...formData, assignedDriverId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="">{t.fleet.unassigned}</option>
                    {drivers.map((drv) => (
                      <option key={drv.id} value={drv.id}>
                        {drv.fullName} ({drv.status})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.common.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="available">{t.statuses.available}</option>
                    <option value="in_transit">{t.statuses.in_transit}</option>
                    <option value="delayed">{t.statuses.delayed}</option>
                    <option value="maintenance">{t.statuses.maintenance}</option>
                  </select>
                </div>

                {/* Mileage */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.mileage} (km)
                  </label>
                  <input
                    type="number"
                    value={formData.mileageKm}
                    onChange={(e) => setFormData({ ...formData, mileageKm: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Fuel % */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.fuelLevel} (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.fuelLevelPercent}
                    onChange={(e) => setFormData({ ...formData, fuelLevelPercent: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* VIN */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.vin} *
                  </label>
                  <input
                    type="text"
                    value={formData.vin}
                    onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                    placeholder="17-znakowy numer VIN"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {formErrors.vin && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.vin}</span>
                  )}
                </div>

                {/* Next Service Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.nextService}
                  </label>
                  <input
                    type="date"
                    value={formData.nextServiceDate}
                    onChange={(e) => setFormData({ ...formData, nextServiceDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Technical Inspection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.fleet.techInspection}
                  </label>
                  <input
                    type="date"
                    value={formData.technicalInspectionDate}
                    onChange={(e) => setFormData({ ...formData, technicalInspectionDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingVehicle(null);
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

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <ConfirmationModal
          isOpen={true}
          title={t.fleet.deleteConfirmTitle}
          description={`${t.fleet.deleteConfirmDesc} (${vehicleToDelete.registration} - ${vehicleToDelete.brandModel})`}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          isDestructive={true}
          onConfirm={() => {
            deleteVehicle(vehicleToDelete.id);
            setVehicleToDelete(null);
          }}
          onCancel={() => setVehicleToDelete(null)}
        />
      )}
    </div>
  );
};

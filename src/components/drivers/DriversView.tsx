import React, { useState, useMemo } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import { Driver, DriverStatus } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  Truck,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  FileCheck,
  Calendar,
  Edit2,
  Trash2,
  X,
  UserCheck,
  Info,
} from 'lucide-react';

export const DriversView: React.FC = () => {
  const { t, formatNumber, formatDate } = useTranslation();
  const { drivers, vehicles, addDriver, updateDriver, deleteDriver, assignDriverToVehicle } = useTMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    status: 'available' as DriverStatus,
    currentRoute: '',
    drivingHoursToday: 0.0,
    maxDrivingHoursDaily: 9.0,
    drivingHoursWeek: 20.0,
    maxDrivingHoursWeekly: 56.0,
    restTimeLeftHours: 11.0,
    licenceCategories: ['C', 'C+E'],
    medicalExamExpiry: '2027-10-15',
    adrCertified: false,
    code95Expiry: '2028-05-20',
    upcomingAvailability: 'Dostępny od zaraz',
    assignedVehicleId: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const filteredDrivers = useMemo(() => {
    return drivers.filter((d) => {
      const matchesSearch =
        d.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.phone.includes(searchQuery) ||
        (d.currentRoute && d.currentRoute.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [drivers, searchQuery, statusFilter]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) errors.fullName = t.common.required;
    if (!formData.phone.trim()) errors.phone = t.common.required;
    if (!formData.email.trim()) errors.email = t.common.required;
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData({
      fullName: '',
      phone: '+48 600 ' + Math.floor(100 + Math.random() * 900) + ' ' + Math.floor(100 + Math.random() * 900),
      email: '',
      status: 'available',
      currentRoute: 'Baza Warszawa (Oczekuje na załadunek)',
      drivingHoursToday: 0.0,
      maxDrivingHoursDaily: 9.0,
      drivingHoursWeek: 15.0,
      maxDrivingHoursWeekly: 56.0,
      restTimeLeftHours: 0,
      licenceCategories: ['C', 'C+E'],
      medicalExamExpiry: '2028-04-15',
      adrCertified: true,
      code95Expiry: '2028-09-30',
      upcomingAvailability: 'Dostępny od zaraz',
      assignedVehicleId: '',
    });
    setFormErrors({});
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (driver: Driver) => {
    setEditingDriver(driver);
    setFormData({
      fullName: driver.fullName,
      phone: driver.phone,
      email: driver.email,
      status: driver.status,
      currentRoute: driver.currentRoute || '',
      drivingHoursToday: driver.drivingHoursToday,
      maxDrivingHoursDaily: driver.maxDrivingHoursDaily,
      drivingHoursWeek: driver.drivingHoursWeek,
      maxDrivingHoursWeekly: driver.maxDrivingHoursWeekly,
      restTimeLeftHours: driver.restTimeLeftHours,
      licenceCategories: driver.licenceCategories,
      medicalExamExpiry: driver.medicalExamExpiry,
      adrCertified: driver.adrCertified,
      code95Expiry: driver.code95Expiry,
      upcomingAvailability: driver.upcomingAvailability,
      assignedVehicleId: driver.assignedVehicleId || '',
    });
    setFormErrors({});
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingDriver) {
      updateDriver({
        ...editingDriver,
        ...formData,
        assignedVehicleId: formData.assignedVehicleId || undefined,
      });
      if (formData.assignedVehicleId !== editingDriver.assignedVehicleId) {
        assignDriverToVehicle(editingDriver.id, formData.assignedVehicleId || undefined);
      }
      setEditingDriver(null);
    } else {
      addDriver({
        ...formData,
        assignedVehicleId: formData.assignedVehicleId || undefined,
      });
      setIsAddModalOpen(false);
    }
  };

  const getVehicleRegistration = (vehicleId?: string) => {
    if (!vehicleId) return t.drivers.noDriverAssigned;
    const v = vehicles.find((veh) => veh.id === vehicleId);
    return v ? `${v.registration} (${v.brandModel})` : t.drivers.noDriverAssigned;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.drivers.title}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.drivers.subtitle}</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t.drivers.addDriver}</span>
        </button>
      </div>

      {/* Compliance / Disclaimer Banner */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-xs text-blue-900">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">{t.drivers.dispatcherNoticePrefix}</span>
          {t.drivers.drivingHoursNotice}
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.drivers.searchPlaceholder}
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto"
        >
          <option value="all">Wszyscy kierowcy / All</option>
          <option value="driving">{t.statuses.driving}</option>
          <option value="available">{t.statuses.available}</option>
          <option value="resting">{t.statuses.resting}</option>
          <option value="off_duty">{t.statuses.off_duty}</option>
        </select>
      </div>

      {/* Drivers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          const isNearLimit = driver.drivingHoursToday >= 8.5;
          const assignedTruck = vehicles.find((v) => v.id === driver.assignedVehicleId);

          let statusBadge = 'bg-blue-50 text-blue-700 border-blue-200';
          let statusText = t.statuses.driving;
          if (driver.status === 'available') {
            statusBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            statusText = t.statuses.available;
          } else if (driver.status === 'resting') {
            statusBadge = 'bg-purple-50 text-purple-700 border-purple-200';
            statusText = t.statuses.resting;
          } else if (driver.status === 'off_duty') {
            statusBadge = 'bg-slate-100 text-slate-600 border-slate-200';
            statusText = t.statuses.off_duty;
          }

          const dailyPercent = Math.min(100, Math.round((driver.drivingHoursToday / driver.maxDrivingHoursDaily) * 100));

          return (
            <div
              key={driver.id}
              onClick={() => setSelectedDriver(driver)}
              className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                {/* Card Top: Initials Avatar + Name + Status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-mono font-bold flex items-center justify-center text-sm shadow-xs">
                      {driver.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                        {driver.fullName}
                      </h3>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{driver.phone}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold border ${statusBadge}`}>
                    {statusText}
                  </span>
                </div>

                {/* Assigned Vehicle & Route */}
                <div className="mt-4 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Truck className="w-3.5 h-3.5 text-slate-400" />
                      {t.drivers.assignedTruck}:
                    </span>
                    <span className="font-mono font-semibold text-slate-800">
                      {assignedTruck ? assignedTruck.registration : t.fleet.unassigned}
                    </span>
                  </div>
                  {driver.currentRoute && (
                    <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                      <strong className="text-slate-700">Trasa:</strong> {driver.currentRoute}
                    </div>
                  )}
                </div>

                {/* Driving Hours Progress Gauge */}
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{t.drivers.drivingHoursToday}</span>
                    <span className="font-mono font-bold text-slate-900">
                      {driver.drivingHoursToday}h / {driver.maxDrivingHoursDaily}h
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isNearLimit ? 'bg-rose-500' : dailyPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${dailyPercent}%` }}
                    />
                  </div>

                  {/* Warning if >= 8.5h */}
                  {isNearLimit && (
                    <div className="mt-2 text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded-md border border-rose-200 font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600 shrink-0" />
                      <span>{t.drivers.hoursWarningTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Footer: Qualifications & Actions */}
              <div
                className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-1">
                  {driver.adrCertified && (
                    <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                      ADR
                    </span>
                  )}
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                    Kod 95
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEditModal(driver)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title={t.common.edit}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDriverToDelete(driver)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title={t.common.delete}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Details Slide-over Drawer */}
      {selectedDriver && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="absolute inset-0" onClick={() => setSelectedDriver(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 overflow-y-auto p-6 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-mono font-bold flex items-center justify-center text-base">
                    {selectedDriver.fullName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedDriver.fullName}</h3>
                    <p className="text-xs text-slate-500">{selectedDriver.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedDriver(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Working Hours Breakdown */}
              <div className="mt-5 space-y-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {t.drivers.drivingHoursToday} & Tydzień
                  </span>
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <div className="text-xs text-slate-500">{t.drivers.drivingHoursToday}</div>
                      <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                        {selectedDriver.drivingHoursToday}h
                      </div>
                      <div className="text-[11px] text-slate-400">Limit dobowy: 9.0h</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">{t.drivers.drivingHoursWeek}</div>
                      <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">
                        {selectedDriver.drivingHoursWeek}h
                      </div>
                      <div className="text-[11px] text-slate-400">Limit tygodniowy: 56.0h</div>
                    </div>
                  </div>
                </div>

                {/* Credentials */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.drivers.phone}</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedDriver.phone}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.drivers.assignedTruck}</span>
                    <span className="font-mono font-semibold text-slate-800">
                      {getVehicleRegistration(selectedDriver.assignedVehicleId)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.drivers.adrCertified}</span>
                    <span className="font-bold text-slate-800">
                      {selectedDriver.adrCertified ? 'Tak (Klasy 1-9)' : 'Brak certyfikatu'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.drivers.code95}</span>
                    <span className="font-mono text-slate-800">{formatDate(selectedDriver.code95Expiry)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.drivers.medicalExam}</span>
                    <span className="font-mono text-slate-800">{formatDate(selectedDriver.medicalExamExpiry)}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500">{t.drivers.categories}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {selectedDriver.licenceCategories.join(', ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-slate-500">Dostępność do dyspozycji</span>
                    <span className="font-semibold text-blue-600">{selectedDriver.upcomingAvailability}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  handleOpenEditModal(selectedDriver);
                  setSelectedDriver(null);
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                {t.common.edit}
              </button>
              <button
                onClick={() => setSelectedDriver(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                {t.common.close}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Driver Modal */}
      {(isAddModalOpen || editingDriver) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-base text-slate-900">
                {editingDriver ? t.drivers.editDriver : t.drivers.addDriver}
              </h3>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingDriver(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.driverName} *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="np. Jan Kowalski"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                  {formErrors.fullName && (
                    <span className="text-[11px] text-rose-600 mt-0.5 block">{formErrors.fullName}</span>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.phone} *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.email} *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="kierowca@transpol-tms.pl"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.status}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as DriverStatus })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="available">{t.statuses.available}</option>
                    <option value="driving">{t.statuses.driving}</option>
                    <option value="resting">{t.statuses.resting}</option>
                    <option value="off_duty">{t.statuses.off_duty}</option>
                  </select>
                </div>

                {/* Assigned Tractor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.assignedTruck}
                  </label>
                  <select
                    value={formData.assignedVehicleId}
                    onChange={(e) => setFormData({ ...formData, assignedVehicleId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                  >
                    <option value="">{t.fleet.unassigned}</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration} ({v.brandModel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Driving Hours Today */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.drivingHoursToday} (h)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={formData.drivingHoursToday}
                    onChange={(e) => setFormData({ ...formData, drivingHoursToday: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* Current Route */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t.drivers.currentRoute}
                  </label>
                  <input
                    type="text"
                    value={formData.currentRoute}
                    onChange={(e) => setFormData({ ...formData, currentRoute: e.target.value })}
                    placeholder="np. Warszawa → Poznań (A2)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </div>

                {/* ADR Checkbox */}
                <div className="sm:col-span-2 flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="adr-check"
                    checked={formData.adrCertified}
                    onChange={(e) => setFormData({ ...formData, adrCertified: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <label htmlFor="adr-check" className="text-xs font-medium text-slate-700 cursor-pointer">
                    {t.drivers.adrCertified}
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingDriver(null);
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

      {/* Delete Driver Confirmation Modal */}
      {driverToDelete && (
        <ConfirmationModal
          isOpen={true}
          title="Czy na pewno chcesz usunąć kierowcę?"
          description={`Kierowca ${driverToDelete.fullName} zostanie usunięty z bazy danych.`}
          confirmLabel={t.common.delete}
          cancelLabel={t.common.cancel}
          isDestructive={true}
          onConfirm={() => {
            deleteDriver(driverToDelete.id);
            setDriverToDelete(null);
          }}
          onCancel={() => setDriverToDelete(null)}
        />
      )}
    </div>
  );
};

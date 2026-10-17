import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import { Delivery } from '../../types';
import {
  MapPin,
  Clock,
  AlertTriangle,
  Send,
  MessageSquare,
  CheckCircle2,
  Navigation,
  Compass,
  Truck,
  Phone,
  Mail,
  FileText,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
  Radio,
} from 'lucide-react';

export const DeliveriesView: React.FC = () => {
  const { language, t, formatTime } = useTranslation();
  const {
    deliveries,
    dispatches,
    vehicles,
    drivers,
    sendTestNotification,
    addDeliveryNote,
    advanceDispatchStage,
  } = useTMS();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'delayed' | 'in_transit'>('all');
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string>(deliveries[0]?.id || '');
  const [newNoteText, setNewNoteText] = useState('');
  const [notificationChannel, setNotificationChannel] = useState<'sms' | 'whatsapp' | 'email'>('whatsapp');

  const selectedDelivery = deliveries.find((d) => d.id === selectedDeliveryId) || deliveries[0];
  const linkedDispatch = dispatches.find((dsp) => dsp.id === selectedDelivery?.dispatchId);
  const linkedVehicle = vehicles.find((v) => v.id === linkedDispatch?.vehicleId);
  const linkedDriver = drivers.find((d) => d.id === linkedDispatch?.driverId);

  // Filtered deliveries list
  const filteredDeliveries = deliveries.filter((del) => {
    const dsp = dispatches.find((d) => d.id === del.dispatchId);
    const matchesSearch =
      del.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dsp && dsp.dispatchNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dsp && dsp.destinationCity.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dsp && dsp.customerName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterMode === 'delayed') {
      return matchesSearch && (del.delayMinutes > 0 || dsp?.status === 'delayed');
    }
    if (filterMode === 'in_transit') {
      return matchesSearch && dsp?.status === 'in_transit';
    }
    return matchesSearch;
  });

  const handleSendNotification = () => {
    if (!selectedDelivery) return;
    const channelLabel =
      notificationChannel === 'whatsapp'
        ? 'WhatsApp'
        : notificationChannel === 'sms'
        ? 'SMS'
        : 'E-mail';
    sendTestNotification(selectedDelivery.id, channelLabel);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedDelivery) return;
    const timestamp = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    addDeliveryNote(selectedDelivery.id, `[${timestamp}] ${newNoteText.trim()}`);
    setNewNoteText('');
  };

  // Example notifications in PL and EN per requirement:
  // Polish: "Twoja dostawa jest w drodze. Planowany czas dostawy: 14:30."
  // English: "Your delivery is on the way. Estimated delivery time: 2:30 PM."
  const etaText = selectedDelivery ? formatTime(selectedDelivery.estimatedDeliveryTime) : '14:30';
  const previewNotificationMessage =
    language === 'pl'
      ? `Twoja dostawa jest w drodze. Planowany czas dostawy: ${etaText}.`
      : `Your delivery is on the way. Estimated delivery time: ${etaText}.`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.deliveries.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.deliveries.subtitle}</p>
      </div>

      {/* Main Grid: Left List (1 col) + Right Detail (2 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Shipment Selector List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[780px]">
          {/* Search & Tabs */}
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.deliveries.searchPlaceholder}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-medium">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600'
                }`}
              >
                {t.deliveries.filterAll}
              </button>
              <button
                onClick={() => setFilterMode('delayed')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  filterMode === 'delayed'
                    ? 'bg-rose-50 text-rose-700 shadow-xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {t.deliveries.filterDelayedOnly}
              </button>
              <button
                onClick={() => setFilterMode('in_transit')}
                className={`flex-1 py-1 rounded-lg transition-all ${
                  filterMode === 'in_transit'
                    ? 'bg-blue-50 text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600'
                }`}
              >
                {t.deliveries.filterInTransitOnly}
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {filteredDeliveries.map((del) => {
              const dsp = dispatches.find((d) => d.id === del.dispatchId);
              const isSelected = selectedDelivery?.id === del.id;
              const isDelayed = del.delayMinutes > 0 || dsp?.status === 'delayed';

              return (
                <div
                  key={del.id}
                  onClick={() => setSelectedDeliveryId(del.id)}
                  className={`p-4 cursor-pointer transition-all ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">
                      {del.trackingNumber}
                    </span>
                    {isDelayed ? (
                      <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-rose-600" />
                        +{del.delayMinutes || 45} min
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                        ETA {del.estimatedDeliveryTime}
                      </span>
                    )}
                  </div>

                  {dsp && (
                    <div className="mt-1 text-xs font-medium text-slate-800 truncate">
                      {dsp.originCity} → {dsp.destinationCity}
                    </div>
                  )}

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>{del.currentLocationCity.slice(0, 22)}...</span>
                    <span>{del.progressPercent}%</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isDelayed ? 'bg-rose-500' : 'bg-blue-600'}`}
                      style={{ width: `${del.progressPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Live Tracking Simulator & Milestone Radar */}
        {selectedDelivery && (
          <div className="lg:col-span-2 space-y-6">
            {/* Schematic Radar & Corridor Simulation */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {selectedDelivery.trackingNumber}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({linkedDispatch?.dispatchNumber})
                    </span>
                    {selectedDelivery.delayMinutes > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-300">
                        {t.statuses.delayed} (+{selectedDelivery.delayMinutes} min)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {linkedDispatch?.originCity} ({linkedDispatch?.originAddress}) → {linkedDispatch?.destinationCity} ({linkedDispatch?.destinationAddress})
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">Przewidywane doręczenie (ETA)</div>
                  <div className="text-xl font-bold font-mono text-slate-900">
                    {selectedDelivery.estimatedDeliveryTime}
                  </div>
                </div>
              </div>

              {/* Schematic Highway Corridor Visualization */}
              <div className="mt-5 p-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl text-white relative overflow-hidden">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-6">
                  <span className="flex items-center gap-1.5 text-blue-400 font-mono">
                    <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Korytarz A2 / A1 (Telematyka GPS)
                  </span>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {t.deliveries.schematicRadarDisclaimer}
                  </span>
                </div>

                {/* Road Corridor Bar */}
                <div className="relative py-4">
                  {/* Highway Line */}
                  <div className="h-3 bg-slate-700 rounded-full w-full relative">
                    {/* Progress Fill */}
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${selectedDelivery.progressPercent}%` }}
                    />
                  </div>

                  {/* Origin Marker */}
                  <div className="absolute left-0 top-0 -translate-y-1 text-center">
                    <div className="w-4 h-4 rounded-full bg-blue-500 ring-4 ring-slate-800 mx-auto" />
                    <span className="text-[11px] font-bold font-mono mt-1 block">
                      {linkedDispatch?.originCity}
                    </span>
                  </div>

                  {/* Active Vehicle Position */}
                  <div
                    className="absolute top-0 -translate-y-4 -translate-x-1/2 transition-all duration-500 text-center"
                    style={{ left: `${Math.max(10, Math.min(90, selectedDelivery.progressPercent))}%` }}
                  >
                    <div className="p-2 bg-blue-600 rounded-xl shadow-lg ring-4 ring-blue-500/30 flex items-center gap-1.5 text-white">
                      <Truck className="w-4 h-4" />
                      <span className="font-mono text-xs font-bold">
                        {linkedVehicle?.registration || 'WI 4892A'}
                      </span>
                    </div>
                    <div className="text-[10px] text-emerald-300 font-mono mt-1">
                      {selectedDelivery.speedKmh || 84} km/h
                    </div>
                  </div>

                  {/* Destination Marker */}
                  <div className="absolute right-0 top-0 -translate-y-1 text-center">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-slate-800 mx-auto" />
                    <span className="text-[11px] font-bold font-mono mt-1 block">
                      {linkedDispatch?.destinationCity}
                    </span>
                  </div>
                </div>

                {/* Telemetry Stats Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-4 border-t border-slate-700/80 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">{t.deliveries.speed}</span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {selectedDelivery.speedKmh || 84} km/h
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">{t.deliveries.remainingDistance}</span>
                    <div className="text-base font-bold font-mono text-white mt-0.5">
                      {selectedDelivery.distanceRemainingKm} km
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Kierowca</span>
                    <div className="text-sm font-semibold text-white mt-0.5 truncate">
                      {linkedDriver?.fullName || 'Jan Kowalski'}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px]">Ciągnik siodłowy</span>
                    <div className="text-sm font-semibold font-mono text-white mt-0.5">
                      {linkedVehicle?.brandModel.slice(0, 15) || 'Volvo FH'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delay Alert Callout if Delayed */}
              {selectedDelivery.delayReason && (
                <div className="mt-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Przyczyna opóźnienia: </span>
                    <span>{selectedDelivery.delayReason}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Milestones & Progress Timeline */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h3 className="text-sm font-bold text-slate-900 mb-4">
                {t.deliveries.milestonesTitle}
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {selectedDelivery.milestones.map((m) => (
                  <div key={m.step} className="relative flex items-start justify-between text-xs">
                    <div
                      className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        m.completed
                          ? 'bg-emerald-500 text-white'
                          : m.current
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {m.completed ? '✓' : m.step}
                    </div>

                    <div className="pl-3">
                      <div className={`font-semibold ${m.completed || m.current ? 'text-slate-900' : 'text-slate-400'}`}>
                        {m.name}
                      </div>
                      {m.current && (
                        <span className="text-[10px] text-blue-600 font-medium">
                          Aktualny etap w realizacji
                        </span>
                      )}
                    </div>

                    {m.time && (
                      <span className="font-mono text-slate-500 text-[11px]">{m.time}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Simulated Automated Customer Notification (SMS / WhatsApp) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.deliveries.customerNotificationTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {t.deliveries.customerNotificationDesc}
                </p>
              </div>

              {/* Channel Selector */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setNotificationChannel('whatsapp')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    notificationChannel === 'whatsapp'
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  WhatsApp Business
                </button>
                <button
                  onClick={() => setNotificationChannel('sms')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    notificationChannel === 'sms'
                      ? 'bg-blue-50 border-blue-500 text-blue-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  SMS Bramka
                </button>
                <button
                  onClick={() => setNotificationChannel('email')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                    notificationChannel === 'email'
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  E-mail Odbiorcy
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 bg-slate-900 rounded-xl text-white font-sans text-xs relative shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 mb-2 border-b border-slate-800">
                  <span>Do: {selectedDelivery.customerNotificationPhone} ({linkedDispatch?.customerName})</span>
                  <span className="text-emerald-400">Podgląd treści</span>
                </div>
                <div className="p-3 bg-slate-800 rounded-lg text-slate-200 leading-relaxed font-mono">
                  &quot;{previewNotificationMessage}&quot;
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-slate-500">
                  Ostatnie wysłane: {selectedDelivery.lastNotificationSentAt ? 'Dzisiaj 09:30' : 'Brak'}
                </span>
                <button
                  onClick={handleSendNotification}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.deliveries.sendTestNotificationBtn}</span>
                </button>
              </div>
            </div>

            {/* Dispatcher Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">{t.deliveries.notesHistory}</h3>

              <form onSubmit={handleAddNote} className="flex gap-2">
                <input
                  type="text"
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  placeholder={t.deliveries.notePlaceholder}
                  className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
                >
                  {t.deliveries.saveNoteBtn}
                </button>
              </form>

              <div className="space-y-2 pt-2">
                {selectedDelivery.driverNotes?.map((note, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-medium"
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

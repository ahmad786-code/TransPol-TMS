import React, { useState } from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { useTMS } from '../../context/TMSContext';
import { ConfirmationModal } from '../common/ConfirmationModal';
import {
  Settings,
  Building2,
  Sliders,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Fuel,
  Clock,
  Shield,
  FileCheck,
  Save,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { t } = useTranslation();
  const {
    simulateTrafficDelay,
    simulateCompletedDelivery,
    simulateFuelRefuel,
    resetAllData,
    showToast,
  } = useTMS();

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [tachoAlertsEnabled, setTachoAlertsEnabled] = useState(true);
  const [autoEtaAlertsEnabled, setAutoEtaAlertsEnabled] = useState(true);

  const [companyForm, setCompanyForm] = useState({
    name: 'TransPol Logistics Sp. z o.o.',
    nip: '5252819234',
    regon: '142981024',
    krs: '0000891230',
    address: 'ul. Annopol 4, 03-236 Warszawa',
    licenseNo: 'TL-UE/WA/2021/0891',
    contactEmail: 'centrala@transpol-tms.pl',
    contactPhone: '+48 22 819 00 00',
  });

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast(t.settings.settingsSavedToast, 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t.settings.title}</h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{t.settings.subtitle}</p>
      </div>

      {/* Sales Presentation Scenarios Strip (High Value for client pitches) */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{t.settings.simulationControls}</span>
        </div>
        <div>
          <h2 className="text-base font-bold text-white">{t.settings.simulationControls}</h2>
          <p className="text-xs text-blue-200/80 mt-1 max-w-2xl leading-relaxed">
            {t.settings.simulationControlsDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Delay trigger */}
          <button
            onClick={simulateTrafficDelay}
            className="flex items-center justify-center gap-2 p-3 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4 text-rose-200" />
            <span>{t.settings.triggerDelayBtn}</span>
          </button>

          {/* Delivery finish trigger */}
          <button
            onClick={simulateCompletedDelivery}
            className="flex items-center justify-center gap-2 p-3 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <CheckCircle className="w-4 h-4 text-emerald-200" />
            <span>{t.settings.triggerFinishTripBtn}</span>
          </button>

          {/* Fuel refill trigger */}
          <button
            onClick={simulateFuelRefuel}
            className="flex items-center justify-center gap-2 p-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Fuel className="w-4 h-4 text-blue-200" />
            <span>{t.settings.triggerFuelRefuelBtn}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Company Legal Profile */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Building2 className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-sm text-slate-900">{t.settings.companyInfoCard}</h3>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.companyNameLabel}
              </label>
              <input
                type="text"
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.nipLabel}</label>
                <input
                  type="text"
                  value={companyForm.nip}
                  onChange={(e) => setCompanyForm({ ...companyForm, nip: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t.settings.regonLabel}</label>
                <input
                  type="text"
                  value={companyForm.regon}
                  onChange={(e) => setCompanyForm({ ...companyForm, regon: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.settings.addressLabel}</label>
              <input
                type="text"
                value={companyForm.address}
                onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.settings.licenseNoLabel}
              </label>
              <input
                type="text"
                value={companyForm.licenseNo}
                onChange={(e) => setCompanyForm({ ...companyForm, licenseNo: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t.common.save}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Card 2: TMS Preferences & Reset Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sliders className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">{t.settings.tmsPreferences}</h3>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">{t.settings.defaultCurrency}</div>
                  <div className="text-[11px] text-slate-500">Główna waluta rozliczeniowa frachtów</div>
                </div>
                <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                  PLN (zł)
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <div>
                  <div className="font-semibold text-slate-800">{t.settings.legalTachoLimits}</div>
                  <div className="text-[11px] text-slate-500">{t.settings.legalTachoLimitsDesc}</div>
                </div>
                <input
                  type="checkbox"
                  checked={tachoAlertsEnabled}
                  onChange={(e) => setTachoAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-semibold text-slate-800">{t.settings.autoEtaAlerts}</div>
                  <div className="text-[11px] text-slate-500">Automatyczne generowanie powiadomień dla klientów</div>
                </div>
                <input
                  type="checkbox"
                  checked={autoEtaAlertsEnabled}
                  onChange={(e) => setAutoEtaAlertsEnabled(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Reset Operational Data Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>{t.settings.resetDataTitle}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.settings.resetDataDesc}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setIsResetConfirmOpen(true)}
                className="px-4 py-2 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.settings.resetAllDataBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title={t.settings.resetConfirmTitle}
        description={t.settings.resetConfirmDesc}
        confirmLabel={t.settings.resetAllDataBtn}
        cancelLabel={t.common.cancel}
        isDestructive={true}
        onConfirm={() => {
          resetAllData();
          setIsResetConfirmOpen(false);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};

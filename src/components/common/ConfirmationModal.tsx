import React from 'react';
import { useTranslation } from '../../i18n/LanguageContext';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel,
  cancelLabel,
  isDestructive = true,
  onConfirm,
  onCancel,
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden transform animate-in zoom-in-95 duration-150">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full shrink-0 ${isDestructive ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
            </div>
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              {cancelLabel || t.common.cancel}
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onCancel();
              }}
              className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                isDestructive
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-sm'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              }`}
            >
              {confirmLabel || t.common.confirm}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

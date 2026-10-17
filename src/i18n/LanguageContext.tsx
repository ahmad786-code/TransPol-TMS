import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';
import { translations, TranslationDictionary } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
  formatCurrency: (amount: number) => string;
  formatNumber: (num: number, decimals?: number) => string;
  formatDate: (dateStr: string) => string;
  formatTime: (timeStr: string) => string;
  formatDateTime: (dateStr: string, timeStr?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'transpol_tms_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === 'en' || saved === 'pl') {
      return saved;
    }
    return 'pl'; // Polish is the default per requirement
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = translations[language];

  const formatCurrency = (amount: number): string => {
    if (language === 'pl') {
      const formatted = new Intl.NumberFormat('pl-PL', {
        maximumFractionDigits: 0,
      }).format(amount);
      return `${formatted} zł`;
    } else {
      const formatted = new Intl.NumberFormat('en-US', {
        maximumFractionDigits: 0,
      }).format(amount);
      return `${formatted} PLN`;
    }
  };

  const formatNumber = (num: number, decimals = 0): string => {
    const locale = language === 'pl' ? 'pl-PL' : 'en-US';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const locale = language === 'pl' ? 'pl-PL' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        day: '2-digit',
        month: language === 'pl' ? '2-digit' : 'short',
        year: 'numeric',
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string): string => {
    if (!timeStr) return '';
    if (timeStr.includes(':') && timeStr.length <= 5) {
      if (language === 'en') {
        const [h, m] = timeStr.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const formattedHour = h % 12 || 12;
        return `${formattedHour}:${m < 10 ? '0' + m : m} ${ampm}`;
      }
      return timeStr; // 24h format for PL
    }
    try {
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return timeStr;
      const locale = language === 'pl' ? 'pl-PL' : 'en-US';
      return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: language === 'en',
      }).format(date);
    } catch {
      return timeStr;
    }
  };

  const formatDateTime = (dateStr: string, timeStr?: string): string => {
    const formattedDate = formatDate(dateStr);
    const formattedTime = timeStr ? formatTime(timeStr) : '';
    if (!formattedTime) return formattedDate;
    return `${formattedDate}, ${formattedTime}`;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatCurrency,
        formatNumber,
        formatDate,
        formatTime,
        formatDateTime,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

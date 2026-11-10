// ===================================================================
// FixNear Trust - Universal Language Context & Localization Hook
// Real-time synchronization across all UI components with local persistence
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getLanguage,
  setLanguage as setI18nLanguage,
  t as translate,
  subscribeLanguageChange,
  formatDate as fmtDate,
  formatTime as fmtTime,
  formatDateTime as fmtDateTime,
  formatCurrency as fmtCurrency,
  formatNumber as fmtNumber,
  getStatusLabel as getStatus,
  getErrorMessage as getErrMsg,
} from '../i18n/translations';
import { authAPI } from '../services/api';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => getLanguage());

  useEffect(() => {
    const unsubscribe = subscribeLanguageChange((newLang) => {
      setLangState(newLang);
    });
    return unsubscribe;
  }, []);

  const changeLanguage = (newLang) => {
    if (!newLang) return;
    setI18nLanguage(newLang);
    setLangState(newLang);

    // If user is authenticated, sync to their DB profile
    authAPI.updatePreferredLanguage(newLang).catch(() => {});
  };

  const t = (path, fallback = '') => translate(path, fallback);
  const formatDate = (date, options) => fmtDate(date, options, lang);
  const formatTime = (date, options) => fmtTime(date, options, lang);
  const formatDateTime = (date) => fmtDateTime(date, lang);
  const formatCurrency = (amount) => fmtCurrency(amount, lang);
  const formatNumber = (num) => fmtNumber(num, lang);
  const getStatusLabel = (statusKey, type) => getStatus(statusKey, type, lang);
  const getErrorMessage = (err, fallback) => getErrMsg(err, fallback);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        changeLanguage,
        t,
        formatDate,
        formatTime,
        formatDateTime,
        formatCurrency,
        formatNumber,
        getStatusLabel,
        getErrorMessage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    const currentLang = getLanguage();
    return {
      lang: currentLang,
      changeLanguage: setI18nLanguage,
      t: translate,
      formatDate: (date, options) => fmtDate(date, options, currentLang),
      formatTime: (date, options) => fmtTime(date, options, currentLang),
      formatDateTime: (date) => fmtDateTime(date, currentLang),
      formatCurrency: (amount) => fmtCurrency(amount, currentLang),
      formatNumber: (num) => fmtNumber(num, currentLang),
      getStatusLabel: (statusKey, type) => getStatus(statusKey, type, currentLang),
      getErrorMessage: (err, fallback) => getErrMsg(err, fallback),
    };
  }
  return context;
}

export default LanguageContext;

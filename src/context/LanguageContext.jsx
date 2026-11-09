// ===================================================================
// FixNear Trust - Universal Language Context & Localization Hook
// Real-time synchronization across all UI components with local persistence
// ===================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getLanguage, setLanguage as setI18nLanguage, t as translate, subscribeLanguageChange } from '../i18n/translations';

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
    setI18nLanguage(newLang);
    setLangState(newLang);
  };

  const t = (path, fallback = '') => translate(path, fallback);

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      lang: getLanguage(),
      changeLanguage: setI18nLanguage,
      t: translate,
    };
  }
  return context;
}

export default LanguageContext;

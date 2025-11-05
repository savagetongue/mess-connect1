import React, { ReactNode } from 'react';
import { useTranslation as useOriginalTranslation } from 'react-i18next';
import { I18nContext } from '../context/I18nContext';
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useOriginalTranslation();
  return (
    <I18nContext.Provider value={{ i18n, t }}>
      {children}
    </I18nContext.Provider>
  );
};
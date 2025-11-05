import React, { createContext, ReactNode } from 'react';
import { useTranslation as useOriginalTranslation } from 'react-i18next';
import { i18n as i18nInstance, TFunction } from 'i18next';
export interface I18nContextType {
  i18n: i18nInstance;
  t: TFunction;
}
export const I18nContext = createContext<I18nContextType | undefined>(undefined);
export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const { i18n, t } = useOriginalTranslation();
  return (
    <I18nContext.Provider value={{ i18n, t }}>
      {children}
    </I18nContext.Provider>
  );
};
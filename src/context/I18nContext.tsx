import { createContext } from 'react';
import { i18n as i18nInstance, TFunction } from 'i18next';
export interface I18nContextType {
  i18n: i18nInstance;
  t: TFunction;
}
export const I18nContext = createContext<I18nContextType | undefined>(undefined);
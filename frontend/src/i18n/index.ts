/**
 * Localisation.
 *
 * English is the only shipped locale, but every shared string is resolved
 * through i18next so adding Hindi (or any other language) is a matter of
 * adding a catalogue file and listing it in `supportedLocales`.
 */

import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import { en } from './locales/en';

export const supportedLocales = [{ code: 'en', label: 'English', dir: 'ltr' as const }];

const STORAGE_KEY = 'resumeforge.locale';

function initialLocale(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && supportedLocales.some((locale) => locale.code === stored)) return stored;
  } catch {
    // ignore
  }
  const navigatorLocale = navigator.language?.split('-')[0];
  return supportedLocales.some((locale) => locale.code === navigatorLocale)
    ? (navigatorLocale as string)
    : 'en';
}

void i18next.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: initialLocale(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  returnNull: false,
});

export function setLocale(code: string): void {
  void i18next.changeLanguage(code);
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // ignore
  }
  document.documentElement.lang = code;
}

export { i18next };

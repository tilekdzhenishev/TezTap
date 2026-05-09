import { NativeModules, Platform } from 'react-native';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ru from './locales/ru';
import ky from './locales/ky';
import en from './locales/en';

const appI18n = i18n;
const SUPPORTED = ['ru', 'ky', 'en'] as const;
type Locale = (typeof SUPPORTED)[number];

function getDeviceLanguage(): string {
  if (Platform.OS === 'ios') {
    const settings = NativeModules.SettingsManager?.settings;
    const locale = settings?.AppleLocale ?? settings?.AppleLanguages?.[0];
    return locale?.split(/[-_]/)[0] ?? 'ru';
  }

  const locale = NativeModules.I18nManager?.localeIdentifier;
  return locale?.split(/[-_]/)[0] ?? 'ru';
}

const deviceLocale = getDeviceLanguage();
const lng: Locale = (SUPPORTED as readonly string[]).includes(deviceLocale)
  ? (deviceLocale as Locale)
  : 'ru';

appI18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    ky: { translation: ky },
    en: { translation: en },
  },
  lng,
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
});

export default appI18n;

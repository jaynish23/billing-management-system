import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationEN from './i18n/en.json';
import translationGU from './i18n/gu.json';
import translationHI from './i18n/hi.json';

const resources = {
  en: {
    translation: translationEN,
  },
  gu: {
    translation: translationGU,
  },
  hi: {
    translation: translationHI,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;

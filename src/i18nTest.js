import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation from '../public/locales/en/translation.json';

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  // have a common namespace used around the full app
  ns: ['translation'],
  defaultNS: 'translation',

  debug: true,

  interpolation: {
    escapeValue: false // not needed for react!!
  },

  resources: { en: { translation } }
});

export default i18n;

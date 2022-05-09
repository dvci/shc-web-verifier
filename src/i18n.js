import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import ChainedBackend from 'i18next-chained-backend';
import resourcesToBackend from 'i18next-resources-to-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import translationEN from 'shc-web-verifier-locales/en/translation.json';

const bundledResources = { en: { translation: translationEN } };

i18n
  // load translation using http -> see /public/locales
  .use(ChainedBackend)
  // detect user language
  .use(LanguageDetector)
  // pass the i18n instance to react-i18next.
  .use(initReactI18next)
  .init({
    supportedLngs: ['en'],
    fallbackLng: 'en',
    debug: true,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      backends: [
        Backend,
        resourcesToBackend(bundledResources),
      ],
      backendOptions: [{
        loadPath: `${process.env.PUBLIC_URL}/locales/{{lng}}/{{ns}}.json`,
      }],
    },
  });

export default i18n;

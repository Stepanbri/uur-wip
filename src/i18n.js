import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpApi from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
    .use(HttpApi) // Načítá překlady např. z /public/locales
    .use(LanguageDetector) // Detekuje jazyk uživatele
    .use(initReactI18next) // Předává i18n instanci do react-i18next
    .init({
        supportedLngs: ['cs', 'en'],
        fallbackLng: 'cs', // Použije se, pokud detekovaný jazyk není dostupný
        debug: import.meta.env.DEV, // Zapne debug logy v developmentu
        interpolation: {
            escapeValue: false, // React již escapuje, není nutné pro něj
        },
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json', // Cesta k souborům s překlady
        },
    });

export default i18n;
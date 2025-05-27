import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'es', 'po', 'de', 'fr'],
  defaultLocale: 'es',
  
  localeDetection: true,
  
  // Prefijo de localización
  localePrefix: 'as-needed',
  
  // Configuración de pathnames
  pathnames: {
    '/': '/',
    '/settings': {
      en: '/settings',
      es: '/settings',
      po: '/settings',
      de: '/settings',
      fr: '/settings'
    }
  }
});
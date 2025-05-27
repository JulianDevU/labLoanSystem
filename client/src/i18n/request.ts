import { getRequestConfig } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { routing } from './routing';
import { cookies } from 'next/headers';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = routing.defaultLocale;

  // 1. Prioridad: locale de la URL
  const requested = await requestLocale;
  if (hasLocale(routing.locales, requested)) {
    locale = requested;
  } else {
    // 2. Fallback: locale de la cookie
    try {
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
      if (cookieLocale && hasLocale(routing.locales, cookieLocale)) {
        locale = cookieLocale;
      }
    } catch (error) {
      console.warn('Error reading locale cookie:', error);
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});

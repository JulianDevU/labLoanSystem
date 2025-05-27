"use client";

import { useEffect } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/src/i18n/navigation';

export function useLocalePersistence() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Sincronizar cookie con el locale actual
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax${
      process.env.NODE_ENV === 'production' ? '; Secure' : ''
    }`;
    
    // Guardar en localStorage como respaldo
    localStorage.setItem('preferred-locale', locale);
  }, [locale]);

  useEffect(() => {
    // Verificar consistencia al montar el componente
    
    const storageLocale = localStorage.getItem('preferred-locale');
    
    // Si hay inconsistencia, usar el locale preferido
    if (storageLocale && storageLocale !== locale && 
        ['en', 'es', 'po', 'de', 'fr'].includes(storageLocale)) {
      router.push(pathname, { locale: storageLocale });
    }
  }, []);
}

"use client";

import { useLocalePersistence } from '@/src/hooks/useLocalePersistence';

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  useLocalePersistence();
  return <>{children}</>;
}

// 8. CONFIGURACIÓN DE NEXT.JS (next.config.js)
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para i18n
  experimental: {
    // Habilitar características experimentales si es necesario
  },
  
  // Headers personalizados para cookies
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
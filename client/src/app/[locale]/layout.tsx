import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/src/components/theme-provider'
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/src/i18n/routing';
import { getMessages } from 'next-intl/server';
import { cookies } from 'next/headers';

export const metadata: Metadata = {
  title: 'Gestion Laboratorios',
  description: 'Intento de proyecto final',
  generator: 'nosotros',
  icons: {
    icon: '/prestamo.png',
  },
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Verificar que el locale sea válido
  if (!hasLocale(routing.locales, locale)) {
    // Intentar obtener locale de la cookie antes de mostrar 404
    try {
      const cookieStore = await cookies();
      const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
      if (cookieLocale && hasLocale(routing.locales, cookieLocale)) {
        // Redirigir al locale de la cookie
        return Response.redirect(`/${cookieLocale}`);
      }
    } catch (error) {
      console.warn('Error checking locale cookie:', error);
    }
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale}>
      <head>
        {/* Meta tag para indicar el idioma */}
        <meta httpEquiv="Content-Language" content={locale} />
      </head>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
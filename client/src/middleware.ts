import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

export default function middleware(request: NextRequest) {
  // Crear el middleware de next-intl
  const handleI18nRouting = createMiddleware(routing);
  const response = handleI18nRouting(request);

  // Obtener el locale de la cookie o del header
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  const headerLocale = request.headers.get('accept-language');
  
  // Si hay una cookie de locale, asegurarnos de que se mantenga
  if (cookieLocale && routing.locales.includes(cookieLocale as any)) {
    response.cookies.set('NEXT_LOCALE', cookieLocale, {
      path: '/',
      maxAge: 31536000, // 1 año
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  }

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)'
};
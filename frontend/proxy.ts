import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './src/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const role = request.cookies.get('role')?.value;
  const locale = pathname.startsWith('/en') ? 'en' : 'vi';
  const isDoctorRoute = /^\/(vi|en)\/doctor(?:\/|$)/.test(pathname);
  const isPatientRoute = /^\/(vi|en)\/(?:appointments|patient)(?:\/|$)/.test(pathname);

  if (role === 'doctor' && isPatientRoute) {
    return NextResponse.redirect(new URL(`/${locale}/doctor`, request.url));
  }
  if (role === 'patient' && isDoctorRoute) {
    return NextResponse.redirect(new URL(`/${locale}/appointments`, request.url));
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(vi|en)/:path*'],
};

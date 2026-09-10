import { NextResponse, type NextRequest } from 'next/server';
import { getLocaleFromAcceptLanguage } from '@/lib/i18n.mjs';

export function proxy(request: NextRequest) {
  const locale = getLocaleFromAcceptLanguage(
    request.headers.get('accept-language'),
  );
  return NextResponse.redirect(new URL(`/${locale}`, request.url));
}

export const config = { matcher: '/' };

export type Locale = 'zh' | 'en' | 'ja';
export const locales: readonly Locale[];
export const defaultLocale: Locale;
export function hasLocale(value: string): value is Locale;
export function getLocaleFromAcceptLanguage(header: string | null): Locale;
export function localePath(pathname: string, locale: Locale): string;

export const locales = ['zh', 'en', 'ja'];
export const defaultLocale = 'zh';

export function hasLocale(value) {
  return locales.includes(value);
}

export function getLocaleFromAcceptLanguage(header) {
  if (!header) return defaultLocale;
  const preferences = header
    .split(',')
    .map((entry) => {
      const [tag, quality = 'q=1'] = entry.trim().split(';');
      return {
        locale: tag.toLowerCase().split('-')[0],
        quality: Number(quality.replace('q=', '')) || 0,
      };
    })
    .sort((a, b) => b.quality - a.quality);
  return (
    preferences.find(({ locale }) => hasLocale(locale))?.locale ?? defaultLocale
  );
}

export function localePath(pathname, locale) {
  const segments = pathname.split('/').filter(Boolean);
  if (hasLocale(segments[0])) segments.shift();
  return `/${[locale, ...segments].join('/')}`;
}

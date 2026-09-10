import { notFound } from 'next/navigation';
import DuoExperience from '@/components/duo-experience';
import { hasLocale } from '@/lib/i18n.mjs';

export default async function Page({ params }: PageProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return <DuoExperience locale={lang} />;
}

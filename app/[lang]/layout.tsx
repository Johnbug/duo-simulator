import type { Metadata } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { notFound } from 'next/navigation';
import { hasLocale, locales, type Locale } from '@/lib/i18n.mjs';
import { VibeCafeTelemetry } from '@/components/vibecafe-telemetry.mjs';
import '../globals.css';

const metadataByLocale: Record<Locale, Metadata> = {
  zh: {
    title: 'iPhone Duo · 折叠屏体验室',
    description:
      '使用 Apple 图片与资料，探索 iPhone Duo 的折叠形态、双屏与多任务。独立制作的网页交互模拟。',
  },
  en: {
    title: 'iPhone Duo · Foldable Experience Studio',
    description:
      'Explore the iPhone Duo foldable form, dual displays, and multitasking in an independently made web simulation using Apple imagery and information.',
  },
  ja: {
    title: 'iPhone Duo · 折りたたみ体験スタジオ',
    description:
      'Appleの画像と情報をもとに、iPhone Duoの折りたたみ形状、デュアルディスプレイ、マルチタスクを体験できる独自制作のウェブシミュレーションです。',
  },
};

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: LayoutProps<'/[lang]'>): Promise<Metadata> {
  const { lang } = await params;
  return hasLocale(lang) ? metadataByLocale[lang] : {};
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<'/[lang]'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang === 'zh' ? 'zh-CN' : lang}>
      <head>
        <VibeCafeTelemetry />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}

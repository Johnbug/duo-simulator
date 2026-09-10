import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'iPhone Duo · 折叠屏体验室',
  description: '使用 Apple 官方图片与资料，探索 iPhone Duo 的折叠形态、双屏与多任务。独立制作的网页交互模拟。',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}

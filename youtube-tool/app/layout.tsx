import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '内容提炼 — 将视频和文章转化为洞见',
  description: '输入 YouTube 视频或文章链接，自动生成中文摘要和播客',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}

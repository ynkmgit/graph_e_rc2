import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Graph E - タスク管理・チャットアプリ',
  description: 'Next.js、Supabaseを使ったタスク管理・チャットアプリ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
}

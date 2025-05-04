import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/components/auth/AuthProvider';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'リアルタイムインタラクティブプラットフォーム',
  description: 'リアルタイムチャットとボードゲームを統合したソーシャルプラットフォーム',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased">
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow pt-4 pb-12">
              {children}
            </main>
            <footer className="py-6 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    © 2025 リアルタイムインタラクティブプラットフォーム. All rights reserved.
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-6">
                    <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      利用規約
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      プライバシーポリシー
                    </a>
                    <a href="#" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300">
                      お問い合わせ
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}

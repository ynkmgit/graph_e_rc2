'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

const settingsMenuItems = [
  { href: '/settings/profile', label: 'プロフィール' },
  // 今後追加される設定ページ
  // { href: '/settings/account', label: 'アカウント' },
  // { href: '/settings/notifications', label: 'お知らせ' },
  // { href: '/settings/billing', label: '支払い情報' },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 flex flex-col md:flex-row">
          {/* サイドナビゲーション（モバイルでは上部に表示） */}
          <div className="bg-gray-50 dark:bg-gray-900 p-4 md:w-64 md:min-h-screen">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">設定</h2>
            
            <nav className="space-y-1">
              {settingsMenuItems.map((item) => {
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          {/* メインコンテンツ */}
          <div className="flex-1">
            {children}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

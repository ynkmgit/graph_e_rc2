'use client';

import Link from 'next/link';
import { useAuth } from './auth/AuthProvider';
import { usePathname } from 'next/navigation';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();

  // 現在のパスがログインまたはサインアップページの場合はヘッダーを表示しない
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-bold text-indigo-600">
                リアルタイムプラットフォーム
              </Link>
            </div>
            <nav className="ml-6 flex space-x-8 items-center">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                ホーム
              </Link>
              {user && (
                <>
                  <Link
                    href="/chat"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    チャット
                  </Link>
                  <Link
                    href="/games"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    ゲーム
                  </Link>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {user.email}
                    </span>
                    <button
                      onClick={signOut}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      ログアウト
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      href="/login"
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-md text-sm font-medium"
                    >
                      サインアップ
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

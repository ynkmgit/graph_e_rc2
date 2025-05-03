'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from './auth/AuthProvider';
import { usePathname } from 'next/navigation';
import { useUserRole } from '@/hooks/useUserRole';
import { AdminOnly, DeveloperOnly } from './auth/role';
import ProfileCard from './profile/ProfileCard';
import { useProfile } from '@/hooks/useProfile';

export default function Header() {
  const { user, loading, signOut } = useAuth();
  const pathname = usePathname();
  const { role, loading: roleLoading } = useUserRole();
  const { profile } = useProfile();
  const [showMenu, setShowMenu] = useState(false);

  // 現在のパスがログインまたはサインアップページの場合はヘッダーを表示しない
  if (pathname === '/login' || pathname === '/signup') {
    return null;
  }

  // メニューの表示/非表示を切り替える
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // 画面外のクリックでメニューを閉じる
  const closeMenu = () => {
    setShowMenu(false);
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                リアルタイムプラットフォーム
              </Link>
            </div>
            <nav className="ml-6 flex space-x-4 items-center">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                ホーム
              </Link>
              
              {user && (
                <>
                  <Link
                    href="/chat"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    チャット
                  </Link>
                  <Link
                    href="/games"
                    className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                  >
                    ゲーム
                  </Link>
                  
                  {/* 管理者メニュー */}
                  <AdminOnly>
                    <Link
                      href="/admin"
                      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      管理者
                    </Link>
                  </AdminOnly>
                  
                  {/* 開発者用メニュー */}
                  <DeveloperOnly>
                    <Link
                      href="/dev"
                      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      開発者
                    </Link>
                  </DeveloperOnly>
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {/* プロフィールメニュー */}
                    <div className="relative">
                      {profile ? (
                        <div 
                          className="cursor-pointer" 
                          onClick={toggleMenu}
                          aria-haspopup="true"
                          aria-expanded={showMenu}
                        >
                          <ProfileCard 
                            profile={profile} 
                            size="sm" 
                            showStatus 
                          />
                        </div>
                      ) : (
                        <div 
                          className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
                          onClick={toggleMenu}
                        >
                          {user.email}
                        </div>
                      )}

                      {/* ドロップダウンメニュー - クリックで表示/非表示を切り替え */}
                      {showMenu && (
                        <>
                          {/* 背景オーバーレイ - クリックするとメニューを閉じる */}
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={closeMenu}  
                          />
                          
                          <div 
                            className="absolute right-0 w-48 mt-2 origin-top-right bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                          >
                            <div className="py-1">
                              <Link
                                href="/settings/profile"
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={closeMenu}
                              >
                                プロフィール設定
                              </Link>
                              <button
                                onClick={() => {
                                  closeMenu();
                                  signOut();
                                }}
                                className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                              >
                                ログアウト
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* ロール表示 */}
                    {!roleLoading && (
                      <div className="hidden md:block">
                        <div className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
                          {role === 'admin' && '管理者'}
                          {role === 'developer' && '開発者'}
                          {role === 'pro_user' && 'Proユーザー'}
                          {role === 'free_user' && '無料ユーザー'}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex space-x-4">
                    <Link
                      href="/login"
                      className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-3 py-2 rounded-md text-sm font-medium"
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

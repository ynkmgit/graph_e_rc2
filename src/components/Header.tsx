'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
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
  const [showMobileNav, setShowMobileNav] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(true);

  // 現在のパスがログインまたはサインアップページの場合はレンダリングしない
  useEffect(() => {
    if (pathname === '/login' || pathname === '/signup') {
      setShouldRender(false);
    } else {
      setShouldRender(true);
    }
  }, [pathname]);

  // 画面外のクリックでメニューを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  // メニューの表示/非表示を切り替える
  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // モバイルナビゲーションの表示/非表示を切り替える
  const toggleMobileNav = () => {
    setShowMobileNav(!showMobileNav);
  };

  // アクティブなナビゲーションリンクのスタイル
  const getNavLinkStyle = (linkPath: string) => {
    const isActive = pathname === linkPath || pathname.startsWith(`${linkPath}/`);
    return isActive
      ? 'text-indigo-600 dark:text-indigo-400 font-medium'
      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white';
  };

  // ログインページなどではヘッダーを表示しない
  if (!shouldRender) {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ロゴとデスクトップナビゲーション */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold px-3 py-2 rounded-md">
                Graphe
              </span>
            </Link>
            
            {/* デスクトップナビゲーション */}
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm border-b-2 ${
                  pathname === '/'
                    ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300 dark:hover:text-white'
                }`}
              >
                ダッシュボード
              </Link>
              
              <Link
                href="/tools"
                className={`inline-flex items-center px-1 pt-1 text-sm border-b-2 ${
                  pathname.startsWith('/tools')
                    ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300 dark:hover:text-white'
                }`}
              >
                ツール
              </Link>
              
              {user && (
                <>
                  <Link
                    href="/notes"
                    className={`inline-flex items-center px-1 pt-1 text-sm border-b-2 ${
                      pathname.startsWith('/notes')
                        ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300 dark:hover:text-white'
                    }`}
                  >
                    メモ
                  </Link>
                  
                  <Link
                    href="/tags"
                    className={`inline-flex items-center px-1 pt-1 text-sm border-b-2 ${
                      pathname.startsWith('/tags')
                        ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300 dark:hover:text-white'
                    }`}
                  >
                    タグ
                  </Link>
                  
                  <Link
                    href="/chat"
                    className={`inline-flex items-center px-1 pt-1 text-sm border-b-2 ${
                      pathname.startsWith('/chat')
                        ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300 dark:hover:text-white'
                    }`}
                  >
                    チャット
                  </Link>
                  
                  <Link
                    href="/games"
                    className={`inline-flex items-center px-1 pt-1 text-sm border-b-2 ${
                      pathname.startsWith('/games')
                        ? 'border-indigo-500 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-medium'
                        : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:border-gray-300 dark:hover:text-white'
                    }`}
                  >
                    ゲーム
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* デスクトップ検索 */}
          <div className="hidden md:flex items-center flex-1 max-w-xs ml-6">
            <div className="w-full relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="検索..."
                className="block w-full h-9 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* 右側メニュー（通知・プロフィール） */}
          <div className="flex items-center">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {/* 管理者/開発者メニュー - デスクトップのみ */}
                    <div className="hidden md:flex md:items-center md:space-x-2">
                      <AdminOnly>
                        <Link
                          href="/admin"
                          className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition"
                        >
                          <span className="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-medium px-2 py-1 rounded-full">
                            管理者
                          </span>
                        </Link>
                      </AdminOnly>
                      
                      <DeveloperOnly>
                        <Link
                          href="/dev"
                          className="p-1 text-gray-500 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition"
                        >
                          <span className="bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                            開発者
                          </span>
                        </Link>
                      </DeveloperOnly>
                    </div>

                    {/* 通知ボタン */}
                    <button className="p-1 text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition">
                      <div className="relative">
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <span className="absolute top-0 right-0 h-4 w-4 bg-indigo-600 text-white text-xs flex items-center justify-center rounded-full">
                          3
                        </span>
                      </div>
                    </button>
                
                    {/* プロフィールメニュー */}
                    <div className="relative" ref={menuRef}>
                      <button 
                        onClick={toggleMenu}
                        className="flex items-center text-sm focus:outline-none"
                        aria-expanded={showMenu}
                      >
                        {profile ? (
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-2 ring-white dark:ring-gray-800">
                              {profile.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div className="hidden md:block ml-2 text-left">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{profile.display_name || user.email}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {!roleLoading && (
                                  <>
                                    {role === 'admin' && '管理者'}
                                    {role === 'developer' && '開発者'}
                                    {role === 'pro_user' && 'Proユーザー'}
                                    {role === 'free_user' && '無料ユーザー'}
                                  </>
                                )}
                              </p>
                            </div>
                            <svg className="hidden md:block ml-1 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 ring-2 ring-white dark:ring-gray-800">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </div>
                        )}
                      </button>

                      {/* ドロップダウンメニュー */}
                      {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          <Link
                            href="/settings/profile"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowMenu(false)}
                          >
                            プロフィール設定
                          </Link>
                          <Link
                            href="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setShowMenu(false)}
                          >
                            アカウント設定
                          </Link>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          <button
                            onClick={() => {
                              setShowMenu(false);
                              signOut();
                            }}
                            className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            ログアウト
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Link
                      href="/login"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/signup"
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
                    >
                      登録
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* モバイルメニューボタン */}
            <div className="flex md:hidden ml-4">
              <button
                onClick={toggleMobileNav}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-expanded={showMobileNav}
              >
                <span className="sr-only">メニューを開く</span>
                {showMobileNav ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* モバイルメニュー */}
      <div className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${showMobileNav ? 'max-h-96' : 'max-h-0'}`}>
        {/* モバイル検索 */}
        <div className="pt-2 pb-3 px-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="検索..."
              className="block w-full h-10 pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* モバイルナビゲーションリンク */}
        <div className="py-2 px-3 space-y-1">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${getNavLinkStyle('/')}`}
            onClick={() => setShowMobileNav(false)}
          >
            ダッシュボード
          </Link>
          <Link
            href="/tools"
            className={`block px-3 py-2 rounded-md text-base font-medium ${getNavLinkStyle('/tools')}`}
            onClick={() => setShowMobileNav(false)}
          >
            ツール
          </Link>
          {user && (
            <>
              <Link
                href="/notes"
                className={`block px-3 py-2 rounded-md text-base font-medium ${getNavLinkStyle('/notes')}`}
                onClick={() => setShowMobileNav(false)}
              >
                メモ
              </Link>
              <Link
                href="/tags"
                className={`block px-3 py-2 rounded-md text-base font-medium ${getNavLinkStyle('/tags')}`}
                onClick={() => setShowMobileNav(false)}
              >
                タグ管理
              </Link>
              <Link
                href="/chat"
                className={`block px-3 py-2 rounded-md text-base font-medium ${getNavLinkStyle('/chat')}`}
                onClick={() => setShowMobileNav(false)}
              >
                チャット
              </Link>
              <Link
                href="/games"
                className={`block px-3 py-2 rounded-md text-base font-medium ${getNavLinkStyle('/games')}`}
                onClick={() => setShowMobileNav(false)}
              >
                ゲーム
              </Link>
              <AdminOnly>
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-md text-base font-medium text-indigo-600 dark:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowMobileNav(false)}
                >
                  管理者メニュー
                </Link>
              </AdminOnly>
              <DeveloperOnly>
                <Link
                  href="/dev"
                  className="block px-3 py-2 rounded-md text-base font-medium text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowMobileNav(false)}
                >
                  開発者メニュー
                </Link>
              </DeveloperOnly>
            </>
          )}
        </div>
        
        {/* モバイルユーザーメニュー */}
        {user && (
          <div className="pt-3 pb-3 border-t border-gray-200 dark:border-gray-700">
            <div className="px-5 flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  {profile?.display_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                  {profile?.display_name || user.email}
                </div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {!roleLoading && (
                    <>
                      {role === 'admin' && '管理者'}
                      {role === 'developer' && '開発者'}
                      {role === 'pro_user' && 'Proユーザー'}
                      {role === 'free_user' && '無料ユーザー'}
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <Link
                href="/settings/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowMobileNav(false)}
              >
                プロフィール設定
              </Link>
              <Link
                href="/settings"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setShowMobileNav(false)}
              >
                アカウント設定
              </Link>
              <button
                onClick={() => {
                  setShowMobileNav(false);
                  signOut();
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

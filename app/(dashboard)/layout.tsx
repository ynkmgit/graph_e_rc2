'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        redirect('/auth');
      } else {
        setUser(session.user);
      }
      setLoading(false);
    };

    checkUser();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    redirect('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* サイドバー */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-md">
        <div className="p-6">
          <Link href="/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            Graph E
          </Link>
        </div>
        <nav className="mt-6">
          <div className="px-4 py-2 text-xs text-gray-400 uppercase tracking-wider">
            メインメニュー
          </div>
          <Link 
            href="/dashboard" 
            className={`flex items-center px-6 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700 ${
              pathname === '/dashboard' ? 'bg-indigo-50 dark:bg-gray-700 border-l-4 border-indigo-500' : ''
            }`}
          >
            <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
            <span>ダッシュボード</span>
          </Link>
          <Link 
            href="/chat" 
            className={`flex items-center px-6 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700 ${
              pathname.startsWith('/chat') ? 'bg-indigo-50 dark:bg-gray-700 border-l-4 border-indigo-500' : ''
            }`}
          >
            <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
            <span>チャット</span>
          </Link>
          <Link 
            href="/profile" 
            className={`flex items-center px-6 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700 ${
              pathname.startsWith('/profile') ? 'bg-indigo-50 dark:bg-gray-700 border-l-4 border-indigo-500' : ''
            }`}
          >
            <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span>プロフィール</span>
          </Link>
          
          <div className="px-4 py-2 mt-6 text-xs text-gray-400 uppercase tracking-wider">
            管理者メニュー
          </div>
          <Link 
            href="/admin" 
            className={`flex items-center px-6 py-3 hover:bg-indigo-50 dark:hover:bg-gray-700 ${
              pathname.startsWith('/admin') ? 'bg-indigo-50 dark:bg-gray-700 border-l-4 border-indigo-500' : ''
            }`}
          >
            <svg className="w-5 h-5 text-indigo-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span>管理画面</span>
          </Link>
        </nav>
        
        <div className="px-6 py-4 mt-auto">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user?.email || 'ユーザー'}</p>
              <button 
                onClick={handleSignOut}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* メインコンテンツ */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {pathname === '/dashboard' && 'ダッシュボード'}
              {pathname.startsWith('/chat') && 'チャット'}
              {pathname.startsWith('/profile') && 'プロフィール'}
              {pathname.startsWith('/admin') && '管理画面'}
            </h1>
          </div>
        </header>
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

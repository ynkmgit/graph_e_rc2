'use client';

import { useAuth } from './AuthProvider';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

// ログインしていない場合にリダイレクトするコンポーネント
export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // ロード中は何もしない
    if (loading) return;

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user) {
      // 現在のパスを記憶して、ログイン後にリダイレクトするための情報を付与
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, router, pathname]);

  // ロード中はロード表示、またはユーザーがいない場合は何も表示しない
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-300">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // ユーザーがログインしている場合は子コンポーネントを表示
  return <>{children}</>;
}

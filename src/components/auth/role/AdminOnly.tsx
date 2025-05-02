'use client';

import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';

type AdminOnlyProps = {
  children: ReactNode;
  redirect?: boolean; // trueの場合、非管理者はホームページにリダイレクト
  fallbackMessage?: string; // 表示する代替メッセージ
};

/**
 * 管理者専用コンテンツを表示するコンポーネント
 * 管理者でないユーザーは代替メッセージかリダイレクト
 */
export default function AdminOnly({
  children,
  redirect = false,
  fallbackMessage = 'このコンテンツは管理者専用です'
}: AdminOnlyProps) {
  const { isAdmin, loading } = useUserRole();
  const router = useRouter();

  // リダイレクト設定の場合は非管理者をホームページに移動
  if (!loading && !isAdmin && redirect) {
    router.push('/');
    return null;
  }

  // ロード中は読み込み表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // 管理者の場合は通常コンテンツを表示
  if (isAdmin) {
    return <>{children}</>;
  }

  // 管理者でない場合は代替メッセージを表示
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-yellow-800">
      <p>{fallbackMessage}</p>
    </div>
  );
}

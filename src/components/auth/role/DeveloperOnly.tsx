'use client';

import { ReactNode } from 'react';
import { useUserRole } from '@/hooks/useUserRole';

type DeveloperOnlyProps = {
  children: ReactNode;
  fallback?: ReactNode; // 開発者以外に表示する代替コンテンツ
};

/**
 * 開発者専用コンテンツを表示するコンポーネント
 * 開発者および管理者のみ表示（isDeveloperフラグがtrueのユーザー）
 */
export default function DeveloperOnly({
  children,
  fallback = null
}: DeveloperOnlyProps) {
  const { isDeveloper, loading } = useUserRole();

  // ロード中は何も表示しない
  if (loading) {
    return null;
  }

  // 開発者の場合は通常コンテンツを表示
  if (isDeveloper) {
    return <>{children}</>;
  }

  // 開発者でない場合は代替コンテンツを表示
  return <>{fallback}</>;
}

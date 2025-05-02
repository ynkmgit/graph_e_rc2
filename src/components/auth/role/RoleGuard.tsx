'use client';

import { ReactNode } from 'react';
import { useUserRole, UserRole, PlanType } from '@/hooks/useUserRole';

type RoleGuardProps = {
  children: ReactNode;
  allowedRoles?: UserRole[];
  allowedPlans?: PlanType[];
  requireAll?: boolean; // trueの場合、すべての条件を満たす必要がある
  fallback?: ReactNode; // 条件を満たさない場合に表示する要素
};

/**
 * ユーザーの役割とプランに基づいてコンテンツへのアクセスを制御するコンポーネント
 */
export default function RoleGuard({
  children,
  allowedRoles = [],
  allowedPlans = [],
  requireAll = false,
  fallback = null
}: RoleGuardProps) {
  const { role, planType, isAdmin, loading, error } = useUserRole();

  // 管理者は常にすべてのコンテンツにアクセス可能
  if (isAdmin) return <>{children}</>;

  // ロード中は読み込み表示
  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // エラーがある場合はエラー表示
  if (error) {
    return (
      <div className="bg-red-50 p-3 rounded text-red-600 text-sm">
        ユーザー情報の取得に失敗しました
      </div>
    );
  }

  // ロールとプランの条件チェック
  const roleMatches = allowedRoles.length === 0 || allowedRoles.includes(role);
  const planMatches = allowedPlans.length === 0 || allowedPlans.includes(planType);

  // アクセス許可判定
  const hasAccess = requireAll 
    ? roleMatches && planMatches 
    : (allowedRoles.length === 0 && allowedPlans.length === 0) || roleMatches || planMatches;

  if (hasAccess) {
    return <>{children}</>;
  }

  // アクセス不可の場合はfallbackを表示
  return <>{fallback}</>;
}

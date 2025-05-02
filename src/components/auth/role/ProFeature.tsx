'use client';

import { ReactNode, useState } from 'react';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';

type ProFeatureProps = {
  children: ReactNode;
  featureName: string;
  description?: string;
  upgradeLinkPath?: string;
};

/**
 * Pro版（有料プラン）機能を表示するコンポーネント
 * 無料ユーザーの場合はアップグレード案内を表示
 */
export default function ProFeature({ 
  children, 
  featureName,
  description,
  upgradeLinkPath = '/settings/billing'
}: ProFeatureProps) {
  const { isPro, loading } = useUserRole();
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // ロード中は読み込みプレースホルダー表示
  if (loading) {
    return <div className="animate-pulse h-full w-full bg-gray-100 rounded-md min-h-20"></div>;
  }

  // Pro機能へのアクセス権がある場合は通常表示
  if (isPro) {
    return <>{children}</>;
  }

  // Pro機能へのアクセス権がない場合は制限表示
  return (
    <div className="relative border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-10">
        <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-medium mb-2">
          Proプラン限定機能
        </div>
        <h3 className="text-lg font-semibold mb-2">{featureName}</h3>
        {description && (
          <p className="text-gray-600 text-sm text-center mb-4 max-w-md">
            {description}
          </p>
        )}
        <button
          onClick={() => setShowUpgradeModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Proプランへアップグレード
        </button>
      </div>

      {/* 機能のプレビュー（ぼかして表示） */}
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>

      {/* アップグレードモーダル */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Proプランへアップグレード</h2>
            <p className="mb-4">
              Proプランでは以下の機能がご利用いただけます：
            </p>
            <ul className="list-disc pl-5 mb-4 text-sm">
              <li>すべてのツールへのアクセス</li>
              <li>無制限のルーム作成</li>
              <li>無制限の履歴保存</li>
              <li>高度な共同編集機能</li>
              <li>優先サポート</li>
            </ul>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 text-sm"
              >
                キャンセル
              </button>
              <Link
                href={upgradeLinkPath}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm"
                onClick={() => setShowUpgradeModal(false)}
              >
                プラン詳細を見る
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

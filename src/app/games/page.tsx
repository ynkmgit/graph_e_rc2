'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function GamesPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center p-8 pt-0">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">ボードゲーム</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <p className="dark:text-gray-200">ボードゲーム機能は準備中です。もうしばらくお待ちください。</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

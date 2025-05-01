'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col items-center p-8 pt-0">
        <div className="w-full max-w-5xl">
          <h1 className="text-3xl font-bold mb-6">チャット</h1>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <p>チャット機能は準備中です。もうしばらくお待ちください。</p>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

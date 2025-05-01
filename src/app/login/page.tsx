'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import LoginForm from '@/components/auth/LoginForm';

// この親コンポーネントはuseSearchParamsを使用しない
export default function Login() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center">ログイン</h1>
          <p className="mt-2 text-center text-gray-600">
            アカウントにログインしてください
          </p>
        </div>
        
        {/* useSearchParamsを使用する部分をSuspenseでラップ */}
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
        
        <div className="text-center mt-4">
          <p className="text-sm">
            アカウントをお持ちでないですか？{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-500">
              サインアップ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

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
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center dark:text-white">ログイン</h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
            アカウントにログインしてください
          </p>
        </div>
        
        {/* useSearchParamsを使用する部分をSuspenseでラップ */}
        <Suspense fallback={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        }>
          <LoginForm />
        </Suspense>
        
        <div className="text-center mt-4">
          <p className="text-sm dark:text-gray-300">
            アカウントをお持ちでないですか？{' '}
            <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300">
              サインアップ
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

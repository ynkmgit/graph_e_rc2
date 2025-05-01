'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export default function Signup() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 bg-white p-6 rounded-lg shadow-md">
        <div>
          <h1 className="text-3xl font-bold text-center">アカウント作成</h1>
          <p className="mt-2 text-center text-gray-600">
            新しいアカウントを作成してください
          </p>
        </div>

        <Suspense fallback={
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <SignupForm />
        </Suspense>

        <div className="text-center mt-4">
          <p className="text-sm">
            すでにアカウントをお持ちですか？{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-500">
              ログイン
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

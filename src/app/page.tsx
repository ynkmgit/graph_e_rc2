'use client';

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 pt-0">
      <div className="w-full max-w-5xl">
        <div className="relative flex flex-col place-items-center my-12">
          <h1 className="text-4xl font-bold text-center">リアルタイムインタラクティブプラットフォーム</h1>
          <p className="mt-4 text-xl text-center text-gray-600">
            リアルタイムチャットとボードゲームを統合したソーシャルプラットフォーム
          </p>
        </div>

        {!loading && (
          <div className="mb-32 grid text-center w-full gap-6 lg:mb-0 lg:grid-cols-2 lg:text-left">
            {user ? (
              <>
                <Link
                  href="/chat"
                  className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                >
                  <h2 className={`mb-3 text-2xl font-semibold`}>
                    チャット{" "}
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                      →
                    </span>
                  </h2>
                  <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                    リアルタイムチャット機能をお試しください。
                  </p>
                </Link>

                <Link
                  href="/games"
                  className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
                >
                  <h2 className={`mb-3 text-2xl font-semibold`}>
                    ボードゲーム{" "}
                    <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                      →
                    </span>
                  </h2>
                  <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                    インタラクティブなボードゲームを体験してみましょう。
                  </p>
                </Link>
              </>
            ) : (
              <div className="col-span-2 flex flex-col items-center p-8 bg-white rounded-lg shadow-sm">
                <h2 className="text-2xl font-semibold mb-4">アカウントを作成してプラットフォームを利用する</h2>
                <p className="text-gray-600 mb-6 text-center">
                  リアルタイムチャットやボードゲームを楽しむには、アカウントが必要です。
                </p>
                <div className="flex gap-4">
                  <Link
                    href="/login"
                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-3 rounded-md text-sm font-medium"
                  >
                    ログイン
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md text-sm font-medium"
                  >
                    サインアップ
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>
    </main>
  );
}

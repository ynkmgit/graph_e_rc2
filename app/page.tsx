import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ナビゲーションバー */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">Graph E</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/auth" 
                className="px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition"
              >
                ログイン
              </Link>
              <Link 
                href="/auth?signup=true" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
              >
                新規登録
              </Link>
            </div>
          </div>
        </div>
      </nav>
      
      {/* ヒーローセクション */}
      <div className="bg-gradient-to-b from-indigo-100 to-white dark:from-gray-800 dark:to-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex lg:items-center lg:justify-between">
            <div className="lg:w-1/2">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
                <span className="block">すべてがつながる</span>
                <span className="block text-indigo-600 dark:text-indigo-400">新しいコミュニケーション体験</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 dark:text-gray-300 sm:mt-5 sm:text-lg md:mt-5 md:text-xl">
                Graph Eでは、タスク管理からコミュニケーションまで、あなたの毎日をもっとスムーズに、もっと楽しくします。
                <span className="font-bold">リアルタイムチャット</span>、効率的なタスク管理、ソーシャル機能を備えた次世代のワークスペース。
              </p>
              <div className="mt-8 flex gap-4">
                <Link
                  href="/auth"
                  className="px-8 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition shadow-lg"
                >
                  はじめる
                </Link>
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 transition"
                >
                  デモを見る
                </Link>
              </div>
            </div>
            <div className="mt-10 lg:mt-0 lg:w-1/2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
                <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4 space-x-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">A</div>
                    <div>
                      <div className="py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-lg max-w-xs">
                        <p className="text-sm">今日のミーティングの資料、確認しました？</p>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">09:41</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-end mb-4 space-x-2">
                    <div>
                      <div className="py-2 px-3 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-lg max-w-xs">
                        <p className="text-sm">はい、すでに確認済みです。コメントも入れておきました。</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-gray-500 dark:text-gray-400">09:43</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">B</div>
                  </div>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                    <div className="flex space-x-2 items-center">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="メッセージを入力..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          disabled
                        />
                      </div>
                      <button className="p-2 rounded-full bg-indigo-600 text-white" disabled>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 特徴セクション */}
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              すべての機能を、一つのアプリで
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300">
              Graph Eは、あなたの仕事とコミュニケーションを一つの場所にまとめます
            </p>
          </div>
          
          <div className="mt-12">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">タスク管理</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  シンプルで使いやすいタスク管理機能。優先順位付け、締め切り設定、進捗管理をすべて一か所で。
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">リアルタイムチャット</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  チームとのコミュニケーションを円滑に。WebSocketベースの高速メッセージング、ファイル共有、グループチャットをサポート。
                </p>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition">
                <div className="bg-indigo-100 dark:bg-indigo-900 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">ユーザープロフィール</h3>
                <p className="mt-2 text-base text-gray-500 dark:text-gray-300">
                  自分だけのカスタマイズ可能なプロフィールで、チームメンバーとつながりましょう。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* フッター */}
      <footer className="bg-gray-800 text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Graph E</h2>
              <p className="text-gray-400 text-sm">© 2025 Graph E. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">
                プライバシーポリシー
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                利用規約
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                お問い合わせ
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

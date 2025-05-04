'use client';

import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Tabs } from "@/components/ui/Tabs";
import { useProfile } from "@/hooks/useProfile";

export default function Home() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();

  // ダミーの推奨ツールデータ
  const recommendedTools = [
    {
      id: 'harmonograph',
      name: 'ハーモノグラフ',
      description: '振り子の動きが生み出す美しい幾何学模様',
      image: '/harmonograph.png',
      accent: 'primary',
      lastUsed: '昨日'
    },
    {
      id: 'gameoflife',
      name: 'ライフゲーム',
      description: 'セルオートマトンによる生命シミュレーション',
      image: '/gameoflife.png',
      accent: 'success',
      lastUsed: '3日前'
    },
    {
      id: 'planets',
      name: '惑星軌道',
      description: '惑星の軌道パターンの視覚化',
      image: '/planets.png',
      accent: 'warning',
      lastUsed: '1週間前'
    }
  ];

  // チャットやツールのタブコンテンツ
  const tabsContent = [
    {
      id: 'game',
      label: 'ゲーム',
      content: (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-lg h-64 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-400">
              {user ? 'ゲームボードがここに表示されます' : 'ログインするとゲーム機能が利用できます'}
            </span>
          </div>
          <div className="mt-4 flex space-x-4">
            <Button variant="primary" disabled={!user}>リセット</Button>
            <Button variant="outline" disabled={!user}>保存</Button>
            <Button variant="outline" disabled={!user}>共有</Button>
          </div>
        </div>
      )
    },
    {
      id: 'chat',
      label: 'チャット',
      content: (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <div className="h-64 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {user ? (
              <>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg mb-2 max-w-xs">
                  <p className="text-sm text-indigo-800 dark:text-indigo-200">ユーザー1: こんにちは！</p>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg mb-2 max-w-xs ml-auto">
                  <p className="text-sm text-gray-800 dark:text-gray-200">ユーザー2: やあ、このゲーム楽しいね</p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-500 dark:text-gray-400">
                  ログインするとチャット機能が利用できます
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center">
            <input
              type="text"
              placeholder="メッセージを入力..."
              className="flex-grow rounded-lg border border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              disabled={!user}
            />
            <Button className="ml-2" disabled={!user}>
              送信
            </Button>
          </div>
        </div>
      )
    }
  ];

  // ユーザー向けのウェルカムメッセージ
  const welcomeMessage = user && profile
    ? `おかえりなさい、${profile.display_name || user.email}さん`
    : 'リアルタイムインタラクティブプラットフォームへようこそ';

  const welcomeDescription = user
    ? '最近の更新やアクティビティをチェックしましょう'
    : 'リアルタイムチャットとボードゲームを統合したソーシャルプラットフォーム';

  return (
    <Container>
      {/* ウェルカムバナー */}
      <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-indigo-900 dark:text-indigo-100">
              {welcomeMessage}
            </h1>
            <p className="text-indigo-700 dark:text-indigo-300 mt-2">
              {welcomeDescription}
            </p>
          </div>
          {!user && (
            <div className="mt-4 md:mt-0">
              <Button href="/signup" size="lg">
                今すぐ始める
              </Button>
            </div>
          )}
        </div>
      </div>

      {!loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* メインコンテンツエリア */}
          <div className="lg:col-span-2">
            {/* ゲーム＆チャット統合インターフェース */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                ゲーム＆チャット
              </h2>
              <Tabs 
                tabs={tabsContent} 
                defaultTabId="game" 
                variant="pills"
              />
            </div>

            {/* 未登録ユーザー向け情報 */}
            {!user && (
              <div className="border-2 border-amber-400 dark:border-amber-600 border-dashed bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-8">
                <h3 className="font-medium text-amber-800 dark:text-amber-200">
                  一部機能はログインなしでも利用できます
                </h3>
                <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                  フル機能を利用するには、アカウント登録またはログインしてください
                </p>
              </div>
            )}

            {/* おすすめツール */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                おすすめツール
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedTools.slice(0, 2).map(tool => (
                  <Card key={tool.id} accent={tool.accent as any} className="overflow-hidden">
                    <CardHeader>
                      <h3 className="font-medium">{tool.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {user ? `最終利用: ${tool.lastUsed}` : '基本機能は無料で利用可能'}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="h-36 bg-gray-50 dark:bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-gray-400">ツールプレビュー</span>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        href={`/tools/${tool.id}`} 
                        variant="outline" 
                        fullWidth
                      >
                        試してみる
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="lg:col-span-1">
            {/* ログイン中ユーザー向けアクティビティ */}
            {user ? (
              <>
                <Card className="mb-6">
                  <CardHeader>
                    <h3 className="font-medium">最近のアクティビティ</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border-l-2 border-indigo-500 pl-4">
                        <p className="text-sm font-medium">新機能が追加されました</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">30分前</p>
                      </div>
                      <div className="border-l-2 border-blue-500 pl-4">
                        <p className="text-sm font-medium">新しいユーザーが参加しました</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">2時間前</p>
                      </div>
                      <div className="border-l-2 border-emerald-500 pl-4">
                        <p className="text-sm font-medium">ゲーム設定を保存しました</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">昨日</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-medium">今後のイベント</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      <p className="font-medium text-sm">数学ツールのライブデモ</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">5月10日 19:00 〜 20:30</p>
                      <Button variant="link" size="sm" className="px-0 mt-2">
                        参加する →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <>
                {/* 未ログインユーザー向け情報 */}
                <Card className="mb-6 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800">
                  <CardHeader>
                    <h3 className="font-medium text-indigo-900 dark:text-indigo-100">ログインするとできること</h3>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-indigo-800 dark:text-indigo-200">
                      <li className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        リアルタイムチャット
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        設定の保存と共有
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        コミュニティへの参加
                      </li>
                      <li className="flex items-center">
                        <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        高度なツール機能
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-3">
                      <Button href="/signup" variant="primary" fullWidth>登録</Button>
                      <Button href="/login" variant="outline" fullWidth>ログイン</Button>
                    </div>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <h3 className="font-medium">注目のツール</h3>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-3">
                          H
                        </div>
                        <div>
                          <p className="font-medium text-sm">ハーモノグラフ</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">美しい幾何学模様</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mr-3">
                          L
                        </div>
                        <div>
                          <p className="font-medium text-sm">ライフゲーム</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">セルオートマトン</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400 mr-3">
                          P
                        </div>
                        <div>
                          <p className="font-medium text-sm">惑星軌道</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">宇宙シミュレーション</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      )}

      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      )}
    </Container>
  );
}

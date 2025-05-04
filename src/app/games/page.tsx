'use client';

import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useAuth } from "@/components/auth/AuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useState } from "react";

export default function GamesPage() {
  const { user } = useAuth();
  const [gameMode, setGameMode] = useState('standard');

  // ゲームとチャットのコンテンツ
  const mainTabs = [
    {
      id: 'game',
      label: 'ゲーム',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-700 h-[400px] flex items-center justify-center relative">
            {/* ゲームの視覚要素のプレースホルダー */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-indigo-500 rounded-full"></div>
              <div className="w-16 h-16 bg-red-500 rounded-full ml-20"></div>
              <div className="w-10 h-10 bg-green-500 rounded-full ml-16"></div>
            </div>
            
            <span className="text-lg text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded z-10">
              ゲームボード表示エリア
            </span>
          </div>
          
          {/* ゲームコントロール */}
          <div className="p-4 bg-gray-100 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary" size="sm">リセット</Button>
              <Button variant="outline" size="sm">保存</Button>
              <Button variant="outline" size="sm">共有</Button>
              
              <div className="ml-auto flex items-center space-x-3">
                <label className="text-sm text-gray-600 dark:text-gray-300">モード:</label>
                <select 
                  className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm"
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value)}
                >
                  <option value="standard">標準</option>
                  <option value="advanced">高度</option>
                  <option value="custom">カスタム</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'chat',
      label: 'チャット',
      content: (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm h-[490px] flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-medium">ゲームルーム チャット</h3>
          </div>
          
          {/* メッセージエリア */}
          <div className="flex-grow p-4 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-2">
                  A
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg rounded-tl-none max-w-xs">
                  <p className="text-sm">こんにちは！このゲームで遊びましょう。</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:23</p>
                </div>
              </div>
              
              <div className="flex items-start justify-end">
                <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg rounded-tr-none max-w-xs">
                  <p className="text-sm">了解です。どのモードでプレイしますか？</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:24</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400 ml-2">
                  B
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mr-2">
                  A
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg rounded-tl-none max-w-xs">
                  <p className="text-sm">標準モードでお願いします。準備はいいですか？</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">10:25</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* メッセージ入力 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <input 
                type="text" 
                placeholder="メッセージを入力..." 
                className="flex-grow rounded-l-lg border border-gray-300 dark:border-gray-600 p-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-r-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )
    }
  ];

  // ゲーム選択用のコンテンツ
  const gameOptions = [
    { id: 'boardgame1', name: 'オセロ', description: '2人用の戦略的ボードゲーム' },
    { id: 'boardgame2', name: 'チェス', description: '古典的な2人用戦略ゲーム' },
    { id: 'boardgame3', name: '将棋', description: '日本の伝統的な2人用ボードゲーム' },
    { id: 'boardgame4', name: '囲碁', description: '東洋の古典的なボードゲーム' },
  ];

  return (
    <ProtectedRoute>
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">ゲーム & チャット</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            友達とリアルタイムでゲームをプレイしながらチャットを楽しみましょう。
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* メインコンテンツ: ゲーム＆チャット */}
          <div className="lg:col-span-3">
            <Tabs 
              tabs={mainTabs} 
              defaultTabId="game" 
              variant="underline"
            />
          </div>
          
          {/* サイドバー: ゲーム選択とプレイヤー情報 */}
          <div className="lg:col-span-1 space-y-6">
            {/* ゲーム選択カード */}
            <Card>
              <CardHeader>
                <h3 className="font-medium">ゲームを選択</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {gameOptions.map(game => (
                    <div 
                      key={game.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 cursor-pointer transition"
                    >
                      <h4 className="font-medium text-sm">{game.name}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{game.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" fullWidth>
                  もっと見る
                </Button>
              </CardFooter>
            </Card>
            
            {/* オンラインプレイヤー */}
            <Card>
              <CardHeader>
                <h3 className="font-medium">オンラインプレイヤー</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        A
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">ユーザー1</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">オンライン</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center text-green-600 dark:text-green-400">
                        B
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">ユーザー2</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">オンライン</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="relative">
                      <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        C
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-gray-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium">ユーザー3</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">オフライン</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" fullWidth>
                  友達を招待
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </Container>
    </ProtectedRoute>
  );
}

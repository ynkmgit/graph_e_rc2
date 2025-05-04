'use client';

import { Container } from "@/components/ui/Container";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useState } from "react";

export default function ToolsPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  // ダミーのツールデータ
  const tools = [
    {
      id: 'harmonograph',
      name: 'ハーモノグラフ',
      description: '振り子の動きが生み出す美しい幾何学模様を作成するツール。パラメータを調整して独自のパターンを作成できます。',
      category: 'visualization',
      accent: 'primary',
      requiresAuth: false,
    },
    {
      id: 'gameoflife',
      name: 'ライフゲーム',
      description: 'セルオートマトンによる生命シミュレーション。単純なルールから複雑なパターンが生まれる過程を観察できます。',
      category: 'simulation',
      accent: 'success',
      requiresAuth: false,
    },
    {
      id: 'planets',
      name: '惑星軌道',
      description: '惑星の軌道パターンを視覚化するツール。重力パラメータを調整して、様々な軌道パターンを作成できます。',
      category: 'simulation',
      accent: 'warning',
      requiresAuth: false,
    },
    {
      id: 'jsonformatter',
      name: 'JSON整形ツール',
      description: 'JSONデータを整形・検証するツール。複雑なJSONデータを見やすく整形し、構造を理解しやすくします。',
      category: 'utility',
      accent: 'primary',
      requiresAuth: true,
    },
    {
      id: 'qrcode',
      name: 'QRコード生成',
      description: 'URLやテキストからQRコードを生成するツール。サイズや色をカスタマイズして、独自のQRコードを作成できます。',
      category: 'utility',
      accent: 'success',
      requiresAuth: true,
    },
    {
      id: 'euler3d',
      name: 'オイラーの公式 3Dグラフ',
      description: 'オイラーの公式を3D視覚化するツール。数学的関係性を直感的に理解するのに役立ちます。',
      category: 'visualization',
      accent: 'warning',
      requiresAuth: true,
    },
  ];

  // フィルタリング機能
  const filteredTools = tools.filter(tool => 
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">ツールギャラリー</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          インタラクティブなビジュアライゼーションや便利なユーティリティツールをお試しください。
        </p>
      </div>

      {/* 検索フィルター */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="ツールを検索..."
            className="w-full md:w-96 h-12 pl-4 pr-12 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            className="absolute right-4 top-4 h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* 未登録ユーザー向け情報 */}
      {!user && (
        <div className="border-2 border-amber-400 dark:border-amber-600 border-dashed bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="h-6 w-6 text-amber-500 dark:text-amber-400 mr-3 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-amber-800 dark:text-amber-200">
                一部機能はログインなしでも利用できます
              </h3>
              <p className="text-amber-700 dark:text-amber-300 text-sm mt-1">
                すべてのツールと高度な機能を利用するには、アカウント登録またはログインしてください
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ツールカードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <Card key={tool.id} accent={tool.accent as any} className="h-full flex flex-col">
            <CardHeader>
              <h2 className="text-xl font-semibold">{tool.name}</h2>
              <div className="inline-block bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-xs text-gray-700 dark:text-gray-300 mt-2">
                {tool.category === 'visualization' && 'ビジュアライゼーション'}
                {tool.category === 'simulation' && 'シミュレーション'}
                {tool.category === 'utility' && 'ユーティリティ'}
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-gray-600 dark:text-gray-300">
                {tool.description}
              </p>
              {tool.requiresAuth && !user && (
                <div className="mt-4 flex items-center text-amber-600 dark:text-amber-400 text-sm">
                  <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  ログインが必要
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button 
                href={`/tools/${tool.id}`} 
                variant={tool.requiresAuth && !user ? "secondary" : "primary"} 
                fullWidth
                disabled={tool.requiresAuth && !user}
              >
                {tool.requiresAuth && !user ? 'ログインが必要' : '試してみる'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* ツールが見つからない場合 */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <svg className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-gray-100">
            該当するツールが見つかりませんでした
          </h3>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            検索条件を変更して、再度お試しください。
          </p>
          {searchTerm && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setSearchTerm('')}
            >
              検索をクリア
            </Button>
          )}
        </div>
      )}
    </Container>
  );
}

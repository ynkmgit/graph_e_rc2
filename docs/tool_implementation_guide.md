# リアルタイムツールプラットフォーム実装ガイド

## 1. 技術概要

このガイドでは、リアルタイムインタラクティブプラットフォームにおけるツール機能の実装について詳細に解説します。

### 使用技術

- **フロントエンド**: Next.js 14.1.3、React 18.2.0、TailwindCSS
- **バックエンド**: Next.jsのServerless API Routes（Edge Runtime対応）
- **データベース**: Supabase (PostgreSQL)
- **リアルタイム機能**: Supabaseリアルタイムサブスクリプション
- **認証**: Supabase Auth
- **開発環境**: Docker
- **デプロイ環境**: Cloudflare Pages

## 2. アーキテクチャ設計

### ツールシステムの構造

```
+--------------------------------------+
|             ツールエンジン           |
+--------------------------------------+
|                                      |
|  +------------+  +----------------+  |
|  |   ツール    |  |  ツールステート  |  |
|  |  レジストリ  |  |   マネージャー   |  |
|  +------------+  +----------------+  |
|                                      |
|  +------------+  +----------------+  |
|  |  ツール     |  |  リアルタイム   |  |
|  |  ファクトリ  |  |  シンクロナイザ  |  |
|  +------------+  +----------------+  |
|                                      |
+--------------------------------------+
```

### フォルダ構造

```
src/
├── components/
│   ├── tools/
│   │   ├── ToolBase.tsx        # ツールの基底コンポーネント
│   │   ├── ToolContainer.tsx   # ツール表示コンテナ
│   │   ├── ToolGallery.tsx     # ツール一覧表示
│   │   ├── ToolSync.tsx        # リアルタイム同期コンポーネント
│   │   ├── types.ts            # ツール関連の型定義
│   │   └── categories/         # カテゴリ別ツールフォルダ
│   │       ├── text/           # テキスト処理ツール
│   │       ├── code/           # コード関連ツール
│   │       ├── media/          # メディア処理ツール
│   │       ├── data/           # データ変換ツール
│   │       └── collaborate/    # 共同作業ツール
│   ├── shared/                 # 共有コンポーネント
│   └── layouts/                # レイアウトコンポーネント
├── app/
│   ├── tools/                  # ツール関連ページ
│   │   ├── page.tsx            # ツールギャラリーページ
│   │   ├── [category]/         # カテゴリ別ツールページ
│   │   │   └── page.tsx  
│   │   └── [category]/[tool]/  # 個別ツールページ
│   │       └── page.tsx
│   ├── rooms/                  # 共有ルーム関連ページ
│   │   ├── page.tsx            # ルーム一覧ページ
│   │   ├── create/            # ルーム作成ページ
│   │   │   └── page.tsx
│   │   └── [id]/              # 個別ルームページ
│   │       └── page.tsx
│   └── api/                    # API Routes
│       ├── tools/              # ツール関連API
│       └── rooms/              # ルーム関連API
└── lib/
    ├── tools/                  # ツール関連ユーティリティ
    │   ├── registry.ts         # ツールレジストリ
    │   ├── factory.ts          # ツールファクトリ
    │   └── sync.ts             # 同期ユーティリティ
    ├── supabase/               # Supabase関連
    │   ├── schema.ts           # スキーマ型定義
    │   ├── client.ts           # クライアント初期化
    │   └── queries.ts          # クエリユーティリティ
    └── utils/                  # 汎用ユーティリティ
```

## 3. データベース設計

Supabaseでの実装を前提とした詳細なデータベーススキーマです。

### テーブル構造

#### users テーブル (既存を拡張)

```sql
-- 既存のユーザーテーブルにツール関連フィールドを追加
ALTER TABLE users 
ADD COLUMN tool_preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN favorite_tools TEXT[] DEFAULT '{}';
```

#### tool_data テーブル

```sql
-- ユーザーのツール状態を保存するテーブル
CREATE TABLE tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  name TEXT, -- ユーザーが付けた名前（保存時）
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tool_data_user_id ON tool_data(user_id);
CREATE INDEX idx_tool_data_tool_type ON tool_data(tool_type);
CREATE INDEX idx_tool_data_is_public ON tool_data(is_public) WHERE is_public = TRUE;
```

#### shared_rooms テーブル

```sql
-- 共有ルーム情報
CREATE TABLE shared_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT FALSE,
  access_code TEXT, -- プライベートルームのアクセスコード（オプション）
  room_type TEXT NOT NULL, -- 'chat', 'game', 'tool', 'multi'
  tool_type TEXT, -- 使用するツールタイプ（該当する場合）
  max_members INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- 期限切れになる時間（オプション）
);

-- インデックス
CREATE INDEX idx_shared_rooms_created_by ON shared_rooms(created_by);
CREATE INDEX idx_shared_rooms_is_active ON shared_rooms(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_shared_rooms_room_type ON shared_rooms(room_type);
```

#### room_members テーブル

```sql
-- ルームメンバー情報
CREATE TABLE room_members (
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- インデックス
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
```

#### shared_tool_states テーブル

```sql
-- 共有ツールの状態
CREATE TABLE shared_tool_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT DEFAULT 1, -- 楽観的ロックのためのバージョン
  last_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_shared_tool_states_room_id ON shared_tool_states(room_id);
CREATE INDEX idx_shared_tool_states_tool_type ON shared_tool_states(tool_type);
```

#### tool_activity_logs テーブル

```sql
-- ツール使用ログ（オプション）
CREATE TABLE tool_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tool_type TEXT NOT NULL,
  room_id UUID REFERENCES shared_rooms(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'share', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TTLインデックス（一定期間後に削除するポリシーと組み合わせる）
CREATE INDEX idx_tool_activity_logs_created_at ON tool_activity_logs(created_at);
```

### RLS（Row Level Security）ポリシー

セキュリティとアクセス制御のためのRLSポリシー例：

```sql
-- tool_data テーブルのRLSポリシー
ALTER TABLE tool_data ENABLE ROW LEVEL SECURITY;

-- 自分のデータまたは公開データのみ閲覧可能
CREATE POLICY "ユーザーは自分のツールデータと公開ツールデータを閲覧可能" 
ON tool_data FOR SELECT 
USING (auth.uid() = user_id OR is_public = TRUE);

-- 自分のデータのみ更新可能
CREATE POLICY "ユーザーは自分のツールデータのみ更新可能" 
ON tool_data FOR UPDATE 
USING (auth.uid() = user_id);

-- 自分のデータのみ削除可能
CREATE POLICY "ユーザーは自分のツールデータのみ削除可能" 
ON tool_data FOR DELETE 
USING (auth.uid() = user_id);

-- 認証済みユーザーは新しいツールデータを作成可能
CREATE POLICY "認証済みユーザーはツールデータを作成可能" 
ON tool_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 他のテーブルも同様にRLSポリシーを設定
```

## 4. コンポーネント設計

### ツールの基底コンポーネント

すべてのツールが継承する基本コンポーネント構造：

```tsx
// src/components/tools/ToolBase.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToolSync } from '@/lib/tools/sync';

export interface ToolProps {
  id?: string;
  toolType: string;
  initialState?: any;
  isShared?: boolean;
  roomId?: string;
  readOnly?: boolean;
  onStateChange?: (state: any) => void;
}

export default function ToolBase({
  id,
  toolType,
  initialState,
  isShared = false,
  roomId,
  readOnly = false,
  onStateChange,
}: ToolProps) {
  const [state, setState] = useState(initialState || {});
  const { user } = useAuth();
  const { syncState, syncError } = useToolSync(
    toolType,
    roomId,
    isShared
  );

  useEffect(() => {
    if (initialState) {
      setState(initialState);
    }
  }, [initialState]);

  useEffect(() => {
    if (isShared && roomId && state) {
      syncState(state);
    }
  }, [isShared, roomId, state, syncState]);

  const updateState = (newState: any) => {
    setState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  return (
    <div className="tool-base">
      {syncError && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
          同期エラー: {syncError}
        </div>
      )}
      
      {/* 継承先で実装するコンテンツを配置 */}
      <div className="tool-content">
        {/* ツール固有のUIはここで実装 */}
      </div>
    </div>
  );
}
```

### ツールコンテナ

個々のツールをラップするコンテナコンポーネント：

```tsx
// src/components/tools/ToolContainer.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { saveToolState, shareToolState } from '@/lib/tools/toolActions';

interface ToolContainerProps {
  toolType: string;
  isShared?: boolean;
  roomId?: string;
  toolId?: string;
}

export default function ToolContainer({ 
  toolType, 
  isShared = false,
  roomId,
  toolId
}: ToolContainerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentState, setCurrentState] = useState<any>(null);
  const [savedName, setSavedName] = useState('');
  const { user } = useAuth();
  
  // 動的にツールコンポーネントをインポート
  const ToolComponent = dynamic(
    () => import(`@/components/tools/categories/${toolType.split('.')[0]}/${toolType}`),
    { 
      loading: () => <div className="animate-pulse">ツールを読み込み中...</div>,
      ssr: false // クライアントサイドレンダリングのみに
    }
  );

  const handleSave = async () => {
    if (!user || !currentState) return;
    
    setIsSaving(true);
    try {
      await saveToolState({
        toolType,
        data: currentState,
        name: savedName || `${toolType} - ${new Date().toLocaleString()}`,
        userId: user.id
      });
      // 保存成功通知
    } catch (error) {
      console.error('保存エラー:', error);
      // エラー通知
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    // ツールの共有処理
  };

  const handleStateChange = (newState: any) => {
    setCurrentState(newState);
  };

  return (
    <div className="tool-container bg-white rounded-lg shadow-sm p-4">
      <div className="tool-header flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{toolType.split('.').pop()}</h2>
        
        <div className="tool-actions flex space-x-2">
          {!isShared && user && (
            <>
              <input
                type="text"
                placeholder="保存名を入力"
                className="px-2 py-1 border rounded text-sm"
                value={savedName}
                onChange={(e) => setSavedName(e.target.value)}
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {isSharing ? '共有中...' : '共有'}
              </button>
            </>
          )}
          
          {isShared && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              共有モード
            </span>
          )}
        </div>
      </div>
      
      <div className="tool-body">
        <ToolComponent
          toolType={toolType}
          isShared={isShared}
          roomId={roomId}
          id={toolId}
          onStateChange={handleStateChange}
        />
      </div>
    </div>
  );
}
```

## 5. リアルタイム同期機能

Supabaseのリアルタイムサブスクリプションを使ったツール状態の同期：

```tsx
// src/lib/tools/sync.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

interface SyncOptions {
  throttleMs?: number; // 更新をスロットリングする時間（ミリ秒）
  version?: number;    // 楽観的ロック用のバージョン
}

export function useToolSync(
  toolType: string,
  roomId?: string,
  isShared: boolean = false,
  options: SyncOptions = {}
) {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedState, setLastSyncedState] = useState<any>(null);
  const [stateVersion, setStateVersion] = useState(options.version || 1);
  const { user } = useAuth();
  
  // 外部からの状態更新を受け取るための購読設定
  useEffect(() => {
    if (!isShared || !roomId) return;
    
    // Supabaseリアルタイムサブスクリプションを設定
    const subscription = supabase
      .channel(`tool-${roomId}-${toolType}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_tool_states',
          filter: `room_id=eq.${roomId} AND tool_type=eq.${toolType}`
        },
        (payload) => {
          // 自分の更新は無視（二重更新防止）
          if (payload.new.last_updated_by === user?.id) return;
          
          setLastSyncedState(payload.new.state);
          setStateVersion(payload.new.version);
        }
      )
      .subscribe();
    
    // クリーンアップ関数
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isShared, roomId, toolType, user?.id]);
  
  // 状態を同期する関数
  const syncState = useCallback(
    async (state: any) => {
      if (!isShared || !roomId || !user) {
        return;
      }
      
      try {
        setSyncError(null);
        
        // 楽観的ロックを使用した更新
        const { data, error } = await supabase
          .from('shared_tool_states')
          .upsert(
            {
              room_id: roomId,
              tool_type: toolType,
              state,
              version: stateVersion + 1,
              last_updated_by: user.id,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'room_id, tool_type',
              returning: 'minimal'
            }
          );
        
        if (error) throw error;
        setStateVersion(stateVersion + 1);
      } catch (error: any) {
        console.error('同期エラー:', error);
        setSyncError(error.message || '状態の同期中にエラーが発生しました');
      }
    },
    [isShared, roomId, toolType, user, stateVersion]
  );
  
  return {
    syncState,
    syncError,
    lastSyncedState,
    stateVersion
  };
}
```

## 6. ツール実装例

### JSON整形ツール

JSONデータを整形するツールの実装例：

```tsx
// src/components/tools/categories/code/JsonFormatter.tsx
'use client';

import { useState, useEffect } from 'react';
import ToolBase, { ToolProps } from '@/components/tools/ToolBase';

interface JsonFormatterState {
  input: string;
  output: string;
  error: string | null;
  indentSize: number;
}

export default function JsonFormatter(props: ToolProps) {
  const [state, setState] = useState<JsonFormatterState>({
    input: '',
    output: '',
    error: null,
    indentSize: 2
  });
  
  useEffect(() => {
    // 初期状態の設定
    if (props.initialState) {
      setState({
        ...state,
        ...props.initialState
      });
    }
  }, [props.initialState]);
  
  const formatJson = () => {
    try {
      // 入力がない場合は処理しない
      if (!state.input.trim()) {
        setState({
          ...state,
          output: '',
          error: null
        });
        return;
      }
      
      // JSONとして解析
      const parsed = JSON.parse(state.input);
      
      // 整形してアウトプットに設定
      const formatted = JSON.stringify(parsed, null, state.indentSize);
      
      setState({
        ...state,
        output: formatted,
        error: null
      });
      
      // 親コンポーネントに状態変更を通知
      if (props.onStateChange) {
        props.onStateChange({
          input: state.input,
          output: formatted,
          indentSize: state.indentSize
        });
      }
    } catch (err: any) {
      setState({
        ...state,
        error: `JSONの解析に失敗しました: ${err.message}`
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({
      ...state,
      input: e.target.value
    });
  };
  
  const handleIndentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      indentSize: parseInt(e.target.value)
    });
    
    // インデントサイズ変更時に再フォーマット
    setTimeout(formatJson, 0);
  };
  
  const clearAll = () => {
    setState({
      ...state,
      input: '',
      output: '',
      error: null
    });
    
    if (props.onStateChange) {
      props.onStateChange({
        input: '',
        output: '',
        indentSize: state.indentSize
      });
    }
  };
  
  // ツールUIの実装
  return (
    <div className="json-formatter">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700">JSONを入力</label>
          <div className="flex items-center">
            <label className="mr-2 text-sm">インデント:</label>
            <select
              value={state.indentSize}
              onChange={handleIndentChange}
              className="border rounded px-2 py-1 text-sm"
              disabled={props.readOnly}
            >
              <option value="2">2スペース</option>
              <option value="4">4スペース</option>
              <option value="8">8スペース</option>
            </select>
          </div>
        </div>
        
        <textarea
          value={state.input}
          onChange={handleInputChange}
          onBlur={formatJson}
          placeholder='{"example": "JSONを入力してください"}'
          className="w-full h-40 p-2 border rounded font-mono text-sm"
          disabled={props.readOnly}
        />
      </div>
      
      <div className="flex justify-between mb-2">
        <button
          onClick={formatJson}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={props.readOnly}
        >
          フォーマット
        </button>
        
        <button
          onClick={clearAll}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          disabled={props.readOnly}
        >
          クリア
        </button>
      </div>
      
      {state.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {state.error}
        </div>
      )}
      
      <div>
        <label className="font-medium text-gray-700 block mb-2">整形結果</label>
        <pre className="bg-gray-50 p-4 rounded border overflow-auto h-40 text-sm">
          {state.output}
        </pre>
      </div>
    </div>
  );
}
```

## 7. ルーム機能の実装

### ルーム一覧ページ

```tsx
// src/app/rooms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchRooms = async () => {
      try {
        setLoading(true);
        
        // ユーザーが参加しているルームとパブリックルームを取得
        const { data: memberRooms, error: memberError } = await supabase
          .from('room_members')
          .select(`
            room_id,
            role,
            shared_rooms (
              id,
              name,
              description,
              room_type,
              tool_type,
              is_private,
              created_at,
              users (
                id,
                display_name,
                avatar_url
              )
            )
          `)
          .eq('user_id', user.id);
        
        if (memberError) throw memberError;
        
        // パブリックルームのうち、まだ参加していないものを取得
        const { data: publicRooms, error: publicError } = await supabase
          .from('shared_rooms')
          .select(`
            id,
            name,
            description,
            room_type,
            tool_type,
            is_private,
            created_at,
            users (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('is_private', false)
          .eq('is_active', true)
          .not('id', 'in', memberRooms?.map(r => r.room_id) || []);
        
        if (publicError) throw publicError;
        
        // 参加中のルームとパブリックルームを結合
        const formattedMemberRooms = memberRooms?.map(mr => ({
          ...mr.shared_rooms,
          role: mr.role,
          isMember: true
        })) || [];
        
        const formattedPublicRooms = publicRooms?.map(pr => ({
          ...pr,
          isMember: false,
          role: null
        })) || [];
        
        setRooms([...formattedMemberRooms, ...formattedPublicRooms]);
      } catch (err: any) {
        console.error('ルーム一覧取得エラー:', err);
        setError('ルームの一覧を取得できませんでした');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [user, router]);
  
  const joinRoom = async (roomId: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member'
        });
      
      if (error) throw error;
      
      // 成功したら当該ルームに移動
      router.push(`/rooms/${roomId}`);
    } catch (err: any) {
      console.error('ルーム参加エラー:', err);
      setError('ルームに参加できませんでした');
    }
  };
  
  const getRoomTypeIcon = (roomType: string, toolType?: string) => {
    switch (roomType) {
      case 'chat':
        return '💬';
      case 'game':
        return '🎮';
      case 'tool':
        return '🛠️';
      case 'multi':
        return '🧩';
      default:
        return '📦';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ルーム一覧</h1>
        <Link
          href="/rooms/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          新規ルーム作成
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {rooms.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded">
          <p className="text-gray-500">参加可能なルームがありません</p>
          <p className="mt-2">
            <Link
              href="/rooms/create"
              className="text-indigo-600 hover:underline"
            >
              最初のルームを作成しましょう
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-indigo-300 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-2xl mr-2">
                    {getRoomTypeIcon(room.room_type, room.tool_type)}
                  </span>
                  <h3 className="text-lg font-semibold inline-block">
                    {room.name}
                  </h3>
                </div>
                {room.is_private && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    プライベート
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {room.description || '説明なし'}
              </p>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  作成: {new Date(room.created_at).toLocaleDateString()}
                </div>
                
                <div>
                  {room.isMember ? (
                    <Link
                      href={`/rooms/${room.id}`}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded text-sm"
                    >
                      入室
                    </Link>
                  ) : (
                    <button
                      onClick={() => joinRoom(room.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                    >
                      参加する
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 8. デプロイメント設定

Cloudflare Pagesへのデプロイ設定について詳細を記載します。

### 環境変数の設定

```
# 本番環境用環境変数
NEXT_PUBLIC_SUPABASE_URL=本番用SupabaseのURL
NEXT_PUBLIC_SUPABASE_ANON_KEY=本番用Supabaseの匿名キー
```

### ビルド設定

Cloudflare Pagesダッシュボードでの設定：

- **ビルドコマンド**: `npm run build`
- **ビルド出力ディレクトリ**: `.next`
- **Node.jsバージョン**: `18.x`

### Edge Functionsへの対応

Edge Runtimeで実行するAPIルートの設定：

```tsx
// src/app/api/tools/[action]/route.ts
export const runtime = 'edge';

export async function POST(
  request: Request,
  { params }: { params: { action: string } }
) {
  // APIロジック実装
}
```

## 9. 将来の拡張性と考慮事項

### スケーラビリティ

- **サブスクリプションの管理**
  - 大量のリアルタイム接続に対応するための設計
  - 不要な接続を適切に解除する仕組み

- **データボリュームの考慮**
  - ツールデータの肥大化対策
  - 古いデータのアーカイブ戦略

### セキュリティ

- **入力検証**
  - すべてのユーザー入力に対する適切なバリデーション
  - 特にツール間のデータ連携時の検証強化

- **レート制限**
  - API呼び出しの制限実装
  - Supabaseの同時接続数制限への対応策

### 将来の機能拡張

- **プラグインシステム**
  - 外部開発者がツールを追加できる仕組み
  - プラグイン検証と安全性確保の仕組み

- **AIツール統合**
  - OpenAI APIなどとの連携
  - テキスト生成や要約機能の追加

---

# Real-time Tool Platform Implementation Guide

## 1. Technical Overview

This guide details the implementation of tool functionality in the real-time interactive platform.

### Technologies Used

- **Frontend**: Next.js 14.1.3, React 18.2.0, TailwindCSS
- **Backend**: Next.js Serverless API Routes (Edge Runtime compatible)
- **Database**: Supabase (PostgreSQL)
- **Real-time Features**: Supabase real-time subscriptions
- **Authentication**: Supabase Auth
- **Development Environment**: Docker
- **Deployment Environment**: Cloudflare Pages

## 2. Architecture Design

### Tool System Structure

```
+--------------------------------------+
|              Tool Engine             |
+--------------------------------------+
|                                      |
|  +------------+  +----------------+  |
|  |    Tool    |  |     Tool       |  |
|  |  Registry  |  |   State Manager |  |
|  +------------+  +----------------+  |
|                                      |
|  +------------+  +----------------+  |
|  |   Tool     |  |    Real-time   |  |
|  |  Factory   |  |   Synchronizer  |  |
|  +------------+  +----------------+  |
|                                      |
+--------------------------------------+
```

### Folder Structure

```
src/
├── components/
│   ├── tools/
│   │   ├── ToolBase.tsx        # Base tool component
│   │   ├── ToolContainer.tsx   # Tool display container
│   │   ├── ToolGallery.tsx     # Tool gallery display
│   │   ├── ToolSync.tsx        # Real-time sync component
│   │   ├── types.ts            # Tool-related type definitions
│   │   └── categories/         # Category-specific tool folders
│   │       ├── text/           # Text processing tools
│   │       ├── code/           # Code-related tools
│   │       ├── media/          # Media processing tools
│   │       ├── data/           # Data conversion tools
│   │       └── collaborate/    # Collaboration tools
│   ├── shared/                 # Shared components
│   └── layouts/                # Layout components
├── app/
│   ├── tools/                  # Tool-related pages
│   │   ├── page.tsx            # Tool gallery page
│   │   ├── [category]/         # Category-specific tool pages
│   │   │   └── page.tsx  
│   │   └── [category]/[tool]/  # Individual tool pages
│   │       └── page.tsx
│   ├── rooms/                  # Shared room-related pages
│   │   ├── page.tsx            # Room list page
│   │   ├── create/             # Room creation page
│   │   │   └── page.tsx
│   │   └── [id]/               # Individual room pages
│   │       └── page.tsx
│   └── api/                    # API Routes
│       ├── tools/              # Tool-related API
│       └── rooms/              # Room-related API
└── lib/
    ├── tools/                  # Tool-related utilities
    │   ├── registry.ts         # Tool registry
    │   ├── factory.ts          # Tool factory
    │   └── sync.ts             # Synchronization utilities
    ├── supabase/               # Supabase-related
    │   ├── schema.ts           # Schema type definitions
    │   ├── client.ts           # Client initialization
    │   └── queries.ts          # Query utilities
    └── utils/                  # General utilities
```

## 3. Database Design

Detailed database schema assuming implementation with Supabase.

### Table Structure

#### users Table (Extend Existing)

```sql
-- Add tool-related fields to existing user table
ALTER TABLE users 
ADD COLUMN tool_preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN favorite_tools TEXT[] DEFAULT '{}';
```

#### tool_data Table

```sql
-- Table to save user tool states
CREATE TABLE tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  name TEXT, -- User-given name (when saving)
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tool_data_user_id ON tool_data(user_id);
CREATE INDEX idx_tool_data_tool_type ON tool_data(tool_type);
CREATE INDEX idx_tool_data_is_public ON tool_data(is_public) WHERE is_public = TRUE;
```

#### shared_rooms Table

```sql
-- Shared room information
CREATE TABLE shared_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  is_private BOOLEAN DEFAULT FALSE,
  access_code TEXT, -- Access code for private rooms (optional)
  room_type TEXT NOT NULL, -- 'chat', 'game', 'tool', 'multi'
  tool_type TEXT, -- Tool type to use (if applicable)
  max_members INT DEFAULT 10,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- Expiration time (optional)
);

-- Indexes
CREATE INDEX idx_shared_rooms_created_by ON shared_rooms(created_by);
CREATE INDEX idx_shared_rooms_is_active ON shared_rooms(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_shared_rooms_room_type ON shared_rooms(room_type);
```

#### room_members Table

```sql
-- Room member information
CREATE TABLE room_members (
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);

-- Indexes
CREATE INDEX idx_room_members_user_id ON room_members(user_id);
```

#### shared_tool_states Table

```sql
-- Shared tool states
CREATE TABLE shared_tool_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  state JSONB NOT NULL DEFAULT '{}'::jsonb,
  version INT DEFAULT 1, -- Version for optimistic locking
  last_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_shared_tool_states_room_id ON shared_tool_states(room_id);
CREATE INDEX idx_shared_tool_states_tool_type ON shared_tool_states(tool_type);
```

#### tool_activity_logs Table

```sql
-- Tool usage logs (optional)
CREATE TABLE tool_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  tool_type TEXT NOT NULL,
  room_id UUID REFERENCES shared_rooms(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'share', etc.
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- TTL index (combined with policy to delete after a certain period)
CREATE INDEX idx_tool_activity_logs_created_at ON tool_activity_logs(created_at);
```

### RLS (Row Level Security) Policies

Example RLS policies for security and access control:

```sql
-- RLS policy for tool_data table
ALTER TABLE tool_data ENABLE ROW LEVEL SECURITY;

-- Users can view their own data and public data
CREATE POLICY "Users can view their own tool data and public tool data" 
ON tool_data FOR SELECT 
USING (auth.uid() = user_id OR is_public = TRUE);

-- Users can only update their own data
CREATE POLICY "Users can only update their own tool data" 
ON tool_data FOR UPDATE 
USING (auth.uid() = user_id);

-- Users can only delete their own data
CREATE POLICY "Users can only delete their own tool data" 
ON tool_data FOR DELETE 
USING (auth.uid() = user_id);

-- Authenticated users can create new tool data
CREATE POLICY "Authenticated users can create tool data" 
ON tool_data FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Similar RLS policies for other tables
```

## 4. Component Design

### Base Tool Component

Basic component structure that all tools inherit:

```tsx
// src/components/tools/ToolBase.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useToolSync } from '@/lib/tools/sync';

export interface ToolProps {
  id?: string;
  toolType: string;
  initialState?: any;
  isShared?: boolean;
  roomId?: string;
  readOnly?: boolean;
  onStateChange?: (state: any) => void;
}

export default function ToolBase({
  id,
  toolType,
  initialState,
  isShared = false,
  roomId,
  readOnly = false,
  onStateChange,
}: ToolProps) {
  const [state, setState] = useState(initialState || {});
  const { user } = useAuth();
  const { syncState, syncError } = useToolSync(
    toolType,
    roomId,
    isShared
  );

  useEffect(() => {
    if (initialState) {
      setState(initialState);
    }
  }, [initialState]);

  useEffect(() => {
    if (isShared && roomId && state) {
      syncState(state);
    }
  }, [isShared, roomId, state, syncState]);

  const updateState = (newState: any) => {
    setState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  };

  return (
    <div className="tool-base">
      {syncError && (
        <div className="bg-red-100 text-red-700 p-2 rounded mb-2">
          Sync Error: {syncError}
        </div>
      )}
      
      {/* Content to be implemented by inheriting components */}
      <div className="tool-content">
        {/* Tool-specific UI implemented here */}
      </div>
    </div>
  );
}
```

### Tool Container

Container component that wraps individual tools:

```tsx
// src/components/tools/ToolContainer.tsx
'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/components/auth/AuthProvider';
import { saveToolState, shareToolState } from '@/lib/tools/toolActions';

interface ToolContainerProps {
  toolType: string;
  isShared?: boolean;
  roomId?: string;
  toolId?: string;
}

export default function ToolContainer({ 
  toolType, 
  isShared = false,
  roomId,
  toolId
}: ToolContainerProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [currentState, setCurrentState] = useState<any>(null);
  const [savedName, setSavedName] = useState('');
  const { user } = useAuth();
  
  // Dynamically import tool component
  const ToolComponent = dynamic(
    () => import(`@/components/tools/categories/${toolType.split('.')[0]}/${toolType}`),
    { 
      loading: () => <div className="animate-pulse">Loading tool...</div>,
      ssr: false // Client-side rendering only
    }
  );

  const handleSave = async () => {
    if (!user || !currentState) return;
    
    setIsSaving(true);
    try {
      await saveToolState({
        toolType,
        data: currentState,
        name: savedName || `${toolType} - ${new Date().toLocaleString()}`,
        userId: user.id
      });
      // Success notification
    } catch (error) {
      console.error('Save error:', error);
      // Error notification
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = async () => {
    // Tool sharing logic
  };

  const handleStateChange = (newState: any) => {
    setCurrentState(newState);
  };

  return (
    <div className="tool-container bg-white rounded-lg shadow-sm p-4">
      <div className="tool-header flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">{toolType.split('.').pop()}</h2>
        
        <div className="tool-actions flex space-x-2">
          {!isShared && user && (
            <>
              <input
                type="text"
                placeholder="Enter save name"
                className="px-2 py-1 border rounded text-sm"
                value={savedName}
                onChange={(e) => setSavedName(e.target.value)}
              />
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                disabled={isSharing}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
              >
                {isSharing ? 'Sharing...' : 'Share'}
              </button>
            </>
          )}
          
          {isShared && (
            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
              Shared Mode
            </span>
          )}
        </div>
      </div>
      
      <div className="tool-body">
        <ToolComponent
          toolType={toolType}
          isShared={isShared}
          roomId={roomId}
          id={toolId}
          onStateChange={handleStateChange}
        />
      </div>
    </div>
  );
}
```

## 5. Real-time Synchronization

Tool state synchronization using Supabase real-time subscriptions:

```tsx
// src/lib/tools/sync.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

interface SyncOptions {
  throttleMs?: number; // Time to throttle updates (milliseconds)
  version?: number;    // Version for optimistic locking
}

export function useToolSync(
  toolType: string,
  roomId?: string,
  isShared: boolean = false,
  options: SyncOptions = {}
) {
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedState, setLastSyncedState] = useState<any>(null);
  const [stateVersion, setStateVersion] = useState(options.version || 1);
  const { user } = useAuth();
  
  // Set up subscription to receive external state updates
  useEffect(() => {
    if (!isShared || !roomId) return;
    
    // Set up Supabase real-time subscription
    const subscription = supabase
      .channel(`tool-${roomId}-${toolType}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shared_tool_states',
          filter: `room_id=eq.${roomId} AND tool_type=eq.${toolType}`
        },
        (payload) => {
          // Ignore own updates (prevent double updates)
          if (payload.new.last_updated_by === user?.id) return;
          
          setLastSyncedState(payload.new.state);
          setStateVersion(payload.new.version);
        }
      )
      .subscribe();
    
    // Cleanup function
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [isShared, roomId, toolType, user?.id]);
  
  // Function to sync state
  const syncState = useCallback(
    async (state: any) => {
      if (!isShared || !roomId || !user) {
        return;
      }
      
      try {
        setSyncError(null);
        
        // Update using optimistic locking
        const { data, error } = await supabase
          .from('shared_tool_states')
          .upsert(
            {
              room_id: roomId,
              tool_type: toolType,
              state,
              version: stateVersion + 1,
              last_updated_by: user.id,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: 'room_id, tool_type',
              returning: 'minimal'
            }
          );
        
        if (error) throw error;
        setStateVersion(stateVersion + 1);
      } catch (error: any) {
        console.error('Sync error:', error);
        setSyncError(error.message || 'An error occurred while syncing state');
      }
    },
    [isShared, roomId, toolType, user, stateVersion]
  );
  
  return {
    syncState,
    syncError,
    lastSyncedState,
    stateVersion
  };
}
```

## 6. Tool Implementation Example

### JSON Formatter Tool

Example implementation of a tool for formatting JSON data:

```tsx
// src/components/tools/categories/code/JsonFormatter.tsx
'use client';

import { useState, useEffect } from 'react';
import ToolBase, { ToolProps } from '@/components/tools/ToolBase';

interface JsonFormatterState {
  input: string;
  output: string;
  error: string | null;
  indentSize: number;
}

export default function JsonFormatter(props: ToolProps) {
  const [state, setState] = useState<JsonFormatterState>({
    input: '',
    output: '',
    error: null,
    indentSize: 2
  });
  
  useEffect(() => {
    // Set initial state
    if (props.initialState) {
      setState({
        ...state,
        ...props.initialState
      });
    }
  }, [props.initialState]);
  
  const formatJson = () => {
    try {
      // Do not process if input is empty
      if (!state.input.trim()) {
        setState({
          ...state,
          output: '',
          error: null
        });
        return;
      }
      
      // Parse as JSON
      const parsed = JSON.parse(state.input);
      
      // Format and set output
      const formatted = JSON.stringify(parsed, null, state.indentSize);
      
      setState({
        ...state,
        output: formatted,
        error: null
      });
      
      // Notify parent component of state change
      if (props.onStateChange) {
        props.onStateChange({
          input: state.input,
          output: formatted,
          indentSize: state.indentSize
        });
      }
    } catch (err: any) {
      setState({
        ...state,
        error: `Failed to parse JSON: ${err.message}`
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState({
      ...state,
      input: e.target.value
    });
  };
  
  const handleIndentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setState({
      ...state,
      indentSize: parseInt(e.target.value)
    });
    
    // Reformat when indent size changes
    setTimeout(formatJson, 0);
  };
  
  const clearAll = () => {
    setState({
      ...state,
      input: '',
      output: '',
      error: null
    });
    
    if (props.onStateChange) {
      props.onStateChange({
        input: '',
        output: '',
        indentSize: state.indentSize
      });
    }
  };
  
  // Tool UI implementation
  return (
    <div className="json-formatter">
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <label className="font-medium text-gray-700">Enter JSON</label>
          <div className="flex items-center">
            <label className="mr-2 text-sm">Indent:</label>
            <select
              value={state.indentSize}
              onChange={handleIndentChange}
              className="border rounded px-2 py-1 text-sm"
              disabled={props.readOnly}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="8">8 spaces</option>
            </select>
          </div>
        </div>
        
        <textarea
          value={state.input}
          onChange={handleInputChange}
          onBlur={formatJson}
          placeholder='{"example": "Enter your JSON here"}'
          className="w-full h-40 p-2 border rounded font-mono text-sm"
          disabled={props.readOnly}
        />
      </div>
      
      <div className="flex justify-between mb-2">
        <button
          onClick={formatJson}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          disabled={props.readOnly}
        >
          Format
        </button>
        
        <button
          onClick={clearAll}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded"
          disabled={props.readOnly}
        >
          Clear
        </button>
      </div>
      
      {state.error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {state.error}
        </div>
      )}
      
      <div>
        <label className="font-medium text-gray-700 block mb-2">Formatted Result</label>
        <pre className="bg-gray-50 p-4 rounded border overflow-auto h-40 text-sm">
          {state.output}
        </pre>
      </div>
    </div>
  );
}
```

## 7. Room Feature Implementation

### Room List Page

```tsx
// src/app/rooms/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function RoomsPage() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    const fetchRooms = async () => {
      try {
        setLoading(true);
        
        // Get rooms the user is a member of and public rooms
        const { data: memberRooms, error: memberError } = await supabase
          .from('room_members')
          .select(`
            room_id,
            role,
            shared_rooms (
              id,
              name,
              description,
              room_type,
              tool_type,
              is_private,
              created_at,
              users (
                id,
                display_name,
                avatar_url
              )
            )
          `)
          .eq('user_id', user.id);
        
        if (memberError) throw memberError;
        
        // Get public rooms that the user is not yet a member of
        const { data: publicRooms, error: publicError } = await supabase
          .from('shared_rooms')
          .select(`
            id,
            name,
            description,
            room_type,
            tool_type,
            is_private,
            created_at,
            users (
              id,
              display_name,
              avatar_url
            )
          `)
          .eq('is_private', false)
          .eq('is_active', true)
          .not('id', 'in', memberRooms?.map(r => r.room_id) || []);
        
        if (publicError) throw publicError;
        
        // Combine member rooms and public rooms
        const formattedMemberRooms = memberRooms?.map(mr => ({
          ...mr.shared_rooms,
          role: mr.role,
          isMember: true
        })) || [];
        
        const formattedPublicRooms = publicRooms?.map(pr => ({
          ...pr,
          isMember: false,
          role: null
        })) || [];
        
        setRooms([...formattedMemberRooms, ...formattedPublicRooms]);
      } catch (err: any) {
        console.error('Error fetching room list:', err);
        setError('Could not retrieve room list');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRooms();
  }, [user, router]);
  
  const joinRoom = async (roomId: string) => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from('room_members')
        .insert({
          room_id: roomId,
          user_id: user.id,
          role: 'member'
        });
      
      if (error) throw error;
      
      // Navigate to the room after successful join
      router.push(`/rooms/${roomId}`);
    } catch (err: any) {
      console.error('Error joining room:', err);
      setError('Could not join room');
    }
  };
  
  const getRoomTypeIcon = (roomType: string, toolType?: string) => {
    switch (roomType) {
      case 'chat':
        return '💬';
      case 'game':
        return '🎮';
      case 'tool':
        return '🛠️';
      case 'multi':
        return '🧩';
      default:
        return '📦';
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Rooms</h1>
        <Link
          href="/rooms/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
        >
          Create New Room
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {rooms.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded">
          <p className="text-gray-500">No available rooms</p>
          <p className="mt-2">
            <Link
              href="/rooms/create"
              className="text-indigo-600 hover:underline"
            >
              Create your first room
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-indigo-300 transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-2xl mr-2">
                    {getRoomTypeIcon(room.room_type, room.tool_type)}
                  </span>
                  <h3 className="text-lg font-semibold inline-block">
                    {room.name}
                  </h3>
                </div>
                {room.is_private && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    Private
                  </span>
                )}
              </div>
              
              <p className="text-gray-600 text-sm mt-2 line-clamp-2">
                {room.description || 'No description'}
              </p>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Created: {new Date(room.created_at).toLocaleDateString()}
                </div>
                
                <div>
                  {room.isMember ? (
                    <Link
                      href={`/rooms/${room.id}`}
                      className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded text-sm"
                    >
                      Enter
                    </Link>
                  ) : (
                    <button
                      onClick={() => joinRoom(room.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Join
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 8. Deployment Configuration

Detailed information about deploying to Cloudflare Pages.

### Environment Variables

```
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=Production Supabase URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=Production Supabase anonymous key
```

### Build Settings

Settings in the Cloudflare Pages dashboard:

- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Node.js version**: `18.x`

### Edge Functions Support

Configuration for API routes running on Edge Runtime:

```tsx
// src/app/api/tools/[action]/route.ts
export const runtime = 'edge';

export async function POST(
  request: Request,
  { params }: { params: { action: string } }
) {
  // API logic implementation
}
```

## 9. Future Extensibility and Considerations

### Scalability

- **Subscription Management**
  - Design for handling large numbers of real-time connections
  - Mechanism to properly release unnecessary connections

- **Data Volume Considerations**
  - Measures to prevent tool data bloat
  - Strategy for archiving old data

### Security

- **Input Validation**
  - Appropriate validation for all user inputs
  - Enhanced validation especially when transferring data between tools

- **Rate Limiting**
  - API call limitation implementation
  - Countermeasures for Supabase's simultaneous connection limits

### Future Feature Extensions

- **Plugin System**
  - Mechanism for external developers to add tools
  - Plugin verification and safety assurance mechanism

- **AI Tool Integration**
  - Integration with OpenAI API etc.
  - Addition of text generation and summarization features
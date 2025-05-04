# リアルタイムインタラクティブプラットフォーム

リアルタイムチャット、ボードゲーム、インタラクティブビジュアライゼーション、ユーティリティツールを統合したフリーミアム型ソーシャルプラットフォームです。既存の「ぐらふい」プロジェクトの機能を継承し、さらに拡張していきます。

## 目次

- [プロジェクト概要](#プロジェクト概要)
- [機能一覧](#機能一覧)
- [技術スタック](#技術スタック)
- [開発環境のセットアップ](#開発環境のセットアップ)
- [プロジェクト構造](#プロジェクト構造)
- [実装状況](#実装状況)
- [開発ロードマップ](#開発ロードマップ)
- [開発ガイド](#開発ガイド)
- [デプロイガイド](#デプロイガイド)

## プロジェクト概要

このプロジェクトは、Next.js、Supabase、Docker、Cloudflare Pagesを使用して構築されたリアルタイムインタラクティブプラットフォームです。ユーザーはリアルタイムチャットでコミュニケーションを取りながら、視覚的シミュレーション、ボードゲーム、便利なツールを利用・共有できます。基本機能は無料で提供し、高度な機能を有料プランとして提供するフリーミアムモデルを採用しています。

## 機能一覧

### 継承される「ぐらふい」の機能
- **ハーモノグラフ**: 振り子の動きが生み出す美しい幾何学模様
- **ライフゲーム**: セルオートマトンによる生命シミュレーション
- **惑星軌道（星たちのダンス）**: 惑星の軌道パターンの視覚化
- **オイラーの公式 3Dグラフ**: 数学的公式の3D視覚化
- **その他のツール**: 十字グラフ、生存戦略ゲームなど

### 新たに開発する機能
- **リアルタイムチャット**: ユーザー間でのテキストコミュニケーション
- **メモ機能**: ユーザーごとのメモ作成・管理、公開・非公開設定、タグ付け、マークダウン対応
- **ユーティリティツール**: JSON整形、QRコード生成など
- **共有・協働機能**: ツールの共同編集とリアルタイム共有
- **ユーザープロフィール**: カスタマイズ可能なプロフィール
- **コンテンツギャラリー**: ユーザー作品の共有と閲覧

### 無料機能と有料機能の区分
- **無料機能**: 基本的なツール、シンプルなチャット、基本的な共有機能
- **有料機能**: 高度なツール設定、無制限の履歴保存、チーム機能、高度な協働ツール

詳細な機能マップは `docs/platform_mindmap.md` を参照してください。

## 技術スタック

- **フロントエンド**: Next.js 14.1.3（React 18）、TailwindCSS
- **バックエンド**: Next.jsの`use server`機能 + Supabase API
- **データベース**: Supabase（PostgreSQL）
- **リアルタイム機能**: Supabaseリアルタイムサブスクリプション
- **認証**: Supabase Auth
- **開発環境**: Docker、Docker Compose
- **デプロイ環境**: Cloudflare Pages
- **言語**: TypeScript
- **ローカル公開**: ngrok（開発環境の外部公開）
- **その他ライブラリ**: react-markdown、remark-gfm（マークダウン対応）

## 開発環境のセットアップ

### 前提条件

- Docker と Docker Compose がインストール済み
- Git がインストール済み
- Supabaseアカウントを作成済み
- ngrokアカウント（無料または有料プラン）

### セットアップ手順

1. リポジトリをクローンする
   ```bash
   git clone <repository-url>
   cd graph_e_rc2
   ```

2. 環境変数ファイルを設定する
   ```bash
   cp .env.example .env
   # .envファイルを編集して必要な環境変数を設定する
   ```

   必須の環境変数:
   - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
   - `NGROK_AUTHTOKEN`: ngrokの認証トークン（外部公開に必要）

3. Dockerコンテナをビルドして起動する
   ```bash
   docker-compose up -d
   ```

4. データベースのセットアップ
   - Supabaseダッシュボードにログイン
   - SQLエディタを開く
   - `/sql/scripts/user_profiles.sql` の内容を実行
   - 必要に応じて `/sql/scripts/notes_table.sql` を実行
   - タグ機能を使用する場合は `/sql/scripts/tags/tags_tables.sql` を実行

5. アプリケーションにアクセスする
   ```
   http://localhost:3000  # アプリケーション本体
   http://localhost:4040  # ngrok管理パネル（外部公開URL確認用）
   ```

## プロジェクト構造

```
graph_e_rc2/
├── docs/                   # プロジェクト設計ドキュメント
│   ├── platform_mindmap.md # 機能マインドマップ
│   ├── platform_concept.md # プラットフォームコンセプト詳細
│   ├── existing_features.md # 既存「ぐらふい」機能リファレンス
│   └── supabase_storage_setup.md # Supabaseストレージ設定手順
├── sql/                    # データベース関連ファイル
│   ├── schema.sql          # 最新のスキーマ定義
│   ├── changes.md          # データベース変更履歴
│   └── scripts/            # 実行用SQLスクリプト
├── src/                    # ソースコード
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # 管理者機能
│   │   ├── auth/           # 認証関連のルート
│   │   ├── chat/           # チャット機能
│   │   ├── games/          # ゲーム機能
│   │   ├── login/          # ログインページ
│   │   ├── notes/          # メモ機能
│   │   │   ├── [id]/       # メモ詳細・編集ページ
│   │   │   ├── new/        # 新規メモ作成ページ
│   │   │   └── tags/       # タグごとのメモ一覧
│   │   ├── tags/           # タグ管理機能
│   │   ├── settings/       # 設定画面
│   │   │   └── profile/    # プロフィール設定
│   │   └── signup/         # サインアップページ
│   ├── components/         # 共通コンポーネント
│   │   ├── auth/           # 認証関連コンポーネント
│   │   ├── notes/          # メモ関連コンポーネント
│   │   ├── tags/           # タグ関連コンポーネント
│   │   ├── markdown/       # マークダウン関連コンポーネント
│   │   ├── profile/        # プロフィール関連コンポーネント
│   │   ├── ui/             # 共通UIコンポーネント
│   │   └── Header.tsx      # ヘッダーコンポーネント
│   ├── config/             # 設定ファイル
│   │   └── avatars.ts      # アバター設定
│   ├── hooks/              # カスタムフック
│   │   ├── useUserRole.ts  # ユーザーロール管理フック
│   │   ├── useProfile.ts   # プロフィール管理フック
│   │   ├── useNotes.ts     # メモ管理フック
│   │   └── useTags.ts      # タグ管理フック
│   ├── lib/                # ユーティリティ
│   │   └── supabase.ts     # Supabase設定
│   └── types/              # 型定義
│       ├── profile.ts      # プロフィール関連の型定義
│       ├── note.ts         # メモ関連の型定義
│       └── tag.ts          # タグ関連の型定義
├── public/                 # 静的ファイル
│   └── avatars/            # アバター画像
│       └── samples/        # サンプルアバター
├── config/                 # 設定ファイル
├── bkup/                   # バックアップファイル
├── docker-compose.yml      # Docker Compose設定
├── Dockerfile              # Dockerビルド設定
└── .env.example            # 環境変数サンプル
```

## 実装状況

### 完了済み機能
✅ 基本プロジェクト構造のセットアップ  
✅ Docker開発環境の構築  
✅ ユーザー認証システム（サインアップ、ログイン、ログアウト）  
✅ 認証保護されたルート（ProtectedRoute）  
✅ ユーザー属性管理（ロールベースのアクセス制御）  
✅ 管理者ダッシュボードの基本UI  
✅ RLSポリシーの設定と修正  
✅ ユーザープロフィール機能（表示名、ユーザーID、自己紹介文）  
✅ プロフィール画像機能（サンプルアバター選択、有料ユーザー向けカスタムアバター）  
✅ オンラインステータス管理（オンライン、オフライン、取り込み中）  
✅ メモ機能（作成、編集、削除、公開/非公開設定）  
✅ タグ機能（タグの作成、編集、削除、メモへのタグ付け）  
✅ マークダウン対応メモ（リッチテキスト編集と表示）  

### 進行中の機能
🔄 リアルタイムチャット機能の実装  
🔄 既存「ぐらふい」ツールの移植  
🔄 基本的な共有機能の開発  
🔄 メモの検索機能の実装  
🔄 メモの画像添付機能の実装  

### 今後の実装予定
📅 ハーモノグラフツールの移植  
📅 ライフゲームの移植  
📅 惑星軌道ツールの移植  
📅 JSON整形、QRコード生成などのユーティリティツール  
📅 有料機能（Pro機能）の実装  
📅 チーム機能と協働ツールの開発  

## 開発ロードマップ

### 第1フェーズ（基盤構築）- 現在進行中
- 基本認証システム（完了）
- ユーザープロフィール機能（完了）
- メモ機能（完了）
- タグ機能（完了）
- マークダウン対応（完了）
- リアルタイムチャット機能
- 最初の「ぐらふい」ツール2つの移植（ハーモノグラフ、ライフゲーム）
- 基本的なユーティリティツール

### 第2フェーズ（機能拡充）
- 追加ツールの移植と実装
- 基本的な共有機能
- プロファイル機能の強化
- 初期の有料機能

### 第3フェーズ（収益化強化）
- チーム機能
- 高度な協働ツール
- プレミアムツール拡張

## 開発ガイド

### データベース操作

#### テーブル作成方法
1. `/sql/scripts/` ディレクトリに新しいSQLファイルを作成
2. Supabaseダッシュボードでスクリプトを実行
3. `/sql/changes.md` に変更内容を記録
4. `/sql/schema.sql` を更新

#### RLSポリシー設定
- 各テーブルに適切なRLSポリシーを設定
- 基本方針: ユーザーは自分のデータのみアクセス可能、管理者はすべてのデータにアクセス可能

### プロフィール機能の使用方法

#### プロフィール情報の取得
```tsx
import { useProfile } from '@/hooks/useProfile';

function MyComponent() {
  const { profile, loading, error } = useProfile();
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  
  return (
    <div>
      <h1>{profile?.display_name || 'ゲスト'}</h1>
      {profile?.username && <p>@{profile.username}</p>}
    </div>
  );
}
```

#### プロフィールカードの使用
```tsx
import ProfileCard from '@/components/profile/ProfileCard';

function UsersList({ users }) {
  return (
    <div>
      {users.map(user => (
        <ProfileCard 
          key={user.id} 
          profile={user} 
          showStatus 
          showUsername 
        />
      ))}
    </div>
  );
}
```

### メモ機能の使用方法

#### メモの取得と表示
```tsx
import { useNotes } from '@/hooks/useNotes';

function NotesListComponent() {
  const { notes, loading, error } = useNotes();
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  
  return (
    <div>
      <h1>メモ一覧</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
```

#### メモの作成（タグ付け機能付き）
```tsx
import { useNotes } from '@/hooks/useNotes';
import { useTags } from '@/hooks/useTags';
import { NoteFormInput } from '@/types/note';

function CreateNoteComponent() {
  const { createNote } = useNotes();
  const { tags, createTag } = useTags();
  
  const handleSubmit = async (data: NoteFormInput) => {
    const { success, error } = await createNote(data);
    if (success) {
      // 成功時の処理
    } else {
      // エラー時の処理
    }
  };
  
  return (
    <NoteForm 
      initialData={{ title: '', content: '', is_public: false, tagIds: [] }}
      onSubmit={handleSubmit}
      loading={false}
      mode="create"
    />
  );
}
```

#### マークダウンレンダラーの使用
```tsx
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

function NoteContentDisplay({ content }) {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <MarkdownRenderer content={content} />
    </div>
  );
}
```

### タグ機能の使用方法

#### タグの取得と表示
```tsx
import { useTags } from '@/hooks/useTags';
import TagBadge from '@/components/tags/TagBadge';

function TagsListComponent() {
  const { tags, loading, error } = useTags();
  
  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  
  return (
    <div>
      <h1>タグ一覧</h1>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <TagBadge key={tag.id} tag={tag} />
        ))}
      </div>
    </div>
  );
}
```

#### タグセレクターの使用
```tsx
import { useTags } from '@/hooks/useTags';
import TagSelector from '@/components/tags/TagSelector';
import { useState } from 'react';

function TagSelectorComponent() {
  const { tags, createTag } = useTags();
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  
  return (
    <TagSelector
      availableTags={tags}
      selectedTagIds={selectedTagIds}
      onChange={setSelectedTagIds}
      onCreateTag={createTag}
    />
  );
}
```

#### タグでメモをフィルタリング
```tsx
import { useNotes } from '@/hooks/useNotes';
import { useRouter } from 'next/navigation';

function FilterByTagComponent() {
  const router = useRouter();
  const { fetchNotesByTagId } = useNotes();
  
  const handleTagClick = (tagId: string) => {
    router.push(`/notes/tags/${tagId}`);
  };
  
  // ...
}
```

### 認証関連の開発

#### 保護されたルートの作成
```tsx
'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>保護されたコンテンツ</div>
    </ProtectedRoute>
  );
}
```

#### ロールベースのアクセス制御
```tsx
import { AdminOnly } from '@/components/auth/role';

export default function AdminPage() {
  return (
    <AdminOnly redirect={true}>
      <div>管理者専用コンテンツ</div>
    </AdminOnly>
  );
}
```

### ngrokを使った外部公開

アプリケーションを一時的に外部公開する場合：

1. Dockerが起動していることを確認（`docker-compose up -d`）
2. ngrok管理パネル（http://localhost:4040）にアクセス
3. 発行されたURLを使用して外部からアプリケーションにアクセス

### コードスタイル
- コンポーネントは機能ごとにディレクトリ分け
- 状態管理は基本的にReactの標準機能を使用
- TailwindCSSを使用したスタイリング
- TypeScriptの型定義は厳密に行う

## デプロイガイド

### Cloudflare Pagesへのデプロイ

#### 準備
1. Cloudflareアカウントを作成
2. 新しいPagesプロジェクトを設定

#### ビルド設定
- ビルドコマンド: `npm run build`
- 出力ディレクトリ: `.next`
- Node.jsバージョン: `18.x`以上

#### 環境変数設定
必要な環境変数:
- `NEXT_PUBLIC_SUPABASE_URL`: 本番環境用SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: 本番環境用Supabaseの匿名キー

#### 注意事項
1. **クライアントコンポーネントの制約**
   - `useSearchParams`や`usePathname`などのクライアントサイドフックを使用する場合は、`Suspense`でラップする

2. **Edge Runtime対応**
   - 動的なAPI routes（route handlers）は、Edge Runtimeとして設定
   ```typescript
   export const runtime = 'edge';
   ```

3. **デプロイ前の確認**
   - ローカルでビルドテストを実行（`npm run build`）
   - 認証リダイレクトURLが本番環境用になっているか確認

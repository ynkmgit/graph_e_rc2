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
- **メモ機能**: ユーザーごとのメモ作成・管理、公開・非公開設定
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
│   │   │   └── new/        # 新規メモ作成ページ
│   │   ├── settings/       # 設定画面
│   │   │   └── profile/    # プロフィール設定
│   │   └── signup/         # サインアップページ
│   ├── components/         # 共通コンポーネント
│   │   ├── auth/           # 認証関連コンポーネント
│   │   ├── notes/          # メモ関連コンポーネント
│   │   ├── profile/        # プロフィール関連コンポーネント
│   │   ├── ui/             # 共通UIコンポーネント
│   │   └── Header.tsx      # ヘッダーコンポーネント
│   ├── config/             # 設定ファイル
│   │   └── avatars.ts      # アバター設定
│   ├── hooks/              # カスタムフック
│   │   ├── useUserRole.ts  # ユーザーロール管理フック
│   │   ├── useProfile.ts   # プロフィール管理フック
│   │   └── useNotes.ts     # メモ管理フック
│   ├── lib/                # ユーティリティ
│   │   └── supabase.ts     # Supabase設定
│   └── types/              # 型定義
│       ├── profile.ts      # プロフィール関連の型定義
│       └── note.ts         # メモ関連の型定義
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

### 進行中の機能
🔄 リアルタイムチャット機能の実装  
🔄 既存「ぐらふい」ツールの移植  
🔄 基本的な共有機能の開発  

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

#### メモの作成
```tsx
import { useNotes } from '@/hooks/useNotes';
import { NoteFormInput } from '@/types/note';

function CreateNoteComponent() {
  const { createNote } = useNotes();
  
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
      initialData={{ title: '', content: '', is_public: false }}
      onSubmit={handleSubmit}
      loading={false}
      mode="create"
    />
  );
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

---

# Real-time Interactive Platform

A freemium social platform that integrates real-time chat, board games, interactive visualizations and utility tools. This project inherits features from the existing "ぐらふい" (Graph-e) project and extends them further.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Implementation Status](#implementation-status)
- [Development Roadmap](#development-roadmap)
- [Development Guide](#development-guide)
- [Deployment Guide](#deployment-guide)

## Project Overview

This project is a real-time interactive platform built using Next.js, Supabase, Docker, and Cloudflare Pages. Users can communicate through real-time chat while enjoying visual simulations, board games, and using/sharing useful tools. It adopts a freemium model, offering basic features for free and advanced features as paid plans.

## Features

### Inherited "ぐらふい" Features
- **Harmonograph**: Beautiful geometric patterns created by pendulum movements
- **Game of Life**: Life simulation through cellular automaton
- **Planetary Orbit (Dance of Stars)**: Visualization of planetary orbit patterns
- **Euler's Formula 3D Graph**: 3D visualization of mathematical formula
- **Other Tools**: Cross Graph, Survival Strategy Game, and more

### Newly Developed Features
- **Real-time Chat**: Text communication between users
- **Notes Feature**: Create and manage notes with public/private settings
- **Utility Tools**: JSON formatter, QR code generator, etc.
- **Sharing & Collaboration**: Co-editing and real-time sharing of tools
- **User Profiles**: Customizable profiles
- **Content Gallery**: Sharing and browsing user creations

### Free and Paid Features
- **Free Features**: Basic tools, simple chat, basic sharing functionality
- **Paid Features**: Advanced tool settings, unlimited history storage, team features, advanced collaboration tools

For a detailed feature map, please refer to `docs/platform_mindmap.md`.

## Tech Stack

- **Frontend**: Next.js 14.1.3 (React 18), TailwindCSS
- **Backend**: Next.js `use server` functionality + Supabase API
- **Database**: Supabase (PostgreSQL)
- **Real-time Features**: Supabase Realtime Subscriptions
- **Authentication**: Supabase Auth
- **Development Environment**: Docker, Docker Compose
- **Deployment Environment**: Cloudflare Pages
- **Language**: TypeScript
- **Local Tunneling**: ngrok (exposing local development environment)

## Development Environment Setup

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- Supabase account created
- ngrok account (free or paid plan)

### Setup Steps

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd graph_e_rc2
   ```

2. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit the .env file to set necessary environment variables
   ```

   Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
   - `NGROK_AUTHTOKEN`: ngrok authentication token (for external access)

3. Build and start Docker containers
   ```bash
   docker-compose up -d
   ```

4. Database Setup
   - Log in to Supabase dashboard
   - Open SQL Editor
   - Execute the contents of `/sql/scripts/user_profiles.sql`
   - If needed, execute `/sql/scripts/notes_table.sql`

5. Access the application
   ```
   http://localhost:3000  # Main application
   http://localhost:4040  # ngrok admin panel (for checking public URL)
   ```

## Project Structure

```
graph_e_rc2/
├── docs/                   # Project design documents
│   ├── platform_mindmap.md # Feature mind map
│   ├── platform_concept.md # Platform concept details
│   ├── existing_features.md # Existing "ぐらふい" features reference
│   └── supabase_storage_setup.md # Supabase storage setup guide
├── sql/                    # Database related files
│   ├── schema.sql          # Latest schema definition
│   ├── changes.md          # Database change history
│   └── scripts/            # SQL scripts for execution
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin functionality
│   │   ├── auth/           # Authentication-related routes
│   │   ├── chat/           # Chat functionality
│   │   ├── games/          # Games functionality
│   │   ├── login/          # Login page
│   │   ├── notes/          # Notes functionality
│   │   │   ├── [id]/       # Note details and edit pages
│   │   │   └── new/        # New note creation page
│   │   ├── settings/       # Settings pages
│   │   │   └── profile/    # Profile settings
│   │   └── signup/         # Signup page
│   ├── components/         # Common components
│   │   ├── auth/           # Authentication-related components
│   │   ├── notes/          # Notes-related components
│   │   ├── profile/        # Profile-related components
│   │   ├── ui/             # Common UI components
│   │   └── Header.tsx      # Header component
│   ├── config/             # Configuration files
│   │   └── avatars.ts      # Avatar configuration
│   ├── hooks/              # Custom hooks
│   │   ├── useUserRole.ts  # User role management hook
│   │   ├── useProfile.ts   # Profile management hook
│   │   └── useNotes.ts     # Notes management hook
│   ├── lib/                # Utilities
│   │   └── supabase.ts     # Supabase configuration
│   └── types/              # Type definitions
│       ├── profile.ts      # Profile-related type definitions
│       └── note.ts         # Notes-related type definitions
├── public/                 # Static files
│   └── avatars/            # Avatar images
│       └── samples/        # Sample avatars
├── config/                 # Configuration files
├── bkup/                   # Backup files
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build configuration
└── .env.example            # Sample environment variables
```

## Implementation Status

### Completed Features
✅ Basic project structure setup  
✅ Docker development environment  
✅ User authentication system (signup, login, logout)  
✅ Protected routes (ProtectedRoute)  
✅ User attribute management (role-based access control)  
✅ Admin dashboard basic UI  
✅ RLS policy configuration and fixes  
✅ User profile functionality (display name, username, bio)  
✅ Profile image functionality (sample avatar selection, custom avatar for paid users)  
✅ Online status management (online, offline, busy)  
✅ Notes functionality (create, edit, delete, public/private settings)  

### In Progress
🔄 Real-time chat functionality implementation  
🔄 Migration of existing "ぐらふい" tools  
🔄 Basic sharing functionality development  

### Planned
📅 Harmonograph tool migration  
📅 Game of Life migration  
📅 Planetary Orbit tool migration  
📅 Utility tools (JSON formatter, QR code generator, etc.)  
📅 Paid features (Pro features) implementation  
📅 Team features and collaboration tools development  

## Development Roadmap

### Phase 1 (Foundation) - Current
- Basic authentication system (Completed)
- User profile functionality (Completed)
- Notes functionality (Completed)
- Real-time chat functionality
- First two "ぐらふい" tools migration (Harmonograph, Game of Life)
- Basic utility tools

### Phase 2 (Feature Expansion)
- Additional tools migration and implementation
- Basic sharing functionality
- Profile feature enhancement
- Initial paid features

### Phase 3 (Monetization Enhancement)
- Team features
- Advanced collaboration tools
- Premium tool expansion

## Development Guide

### Database Operations

#### Creating Tables
1. Create a new SQL file in the `/sql/scripts/` directory
2. Execute the script in the Supabase dashboard
3. Record the changes in `/sql/changes.md`
4. Update `/sql/schema.sql`

#### RLS Policy Configuration
- Set appropriate RLS policies for each table
- Basic principle: Users can only access their own data, administrators can access all data

### Using Profile Features

#### Getting Profile Information
```tsx
import { useProfile } from '@/hooks/useProfile';

function MyComponent() {
  const { profile, loading, error } = useProfile();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>{profile?.display_name || 'Guest'}</h1>
      {profile?.username && <p>@{profile.username}</p>}
    </div>
  );
}
```

#### Using Profile Card
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

### Using Notes Feature

#### Fetching and Displaying Notes
```tsx
import { useNotes } from '@/hooks/useNotes';

function NotesListComponent() {
  const { notes, loading, error } = useNotes();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Notes List</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <NoteCard key={note.id} note={note} />
        ))}
      </div>
    </div>
  );
}
```

#### Creating Notes
```tsx
import { useNotes } from '@/hooks/useNotes';
import { NoteFormInput } from '@/types/note';

function CreateNoteComponent() {
  const { createNote } = useNotes();
  
  const handleSubmit = async (data: NoteFormInput) => {
    const { success, error } = await createNote(data);
    if (success) {
      // Handle success
    } else {
      // Handle error
    }
  };
  
  return (
    <NoteForm 
      initialData={{ title: '', content: '', is_public: false }}
      onSubmit={handleSubmit}
      loading={false}
      mode="create"
    />
  );
}
```

### Authentication Development

#### Creating Protected Routes
```tsx
'use client';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute>
      <div>Protected Content</div>
    </ProtectedRoute>
  );
}
```

#### Role-Based Access Control
```tsx
import { AdminOnly } from '@/components/auth/role';

export default function AdminPage() {
  return (
    <AdminOnly redirect={true}>
      <div>Admin Only Content</div>
    </AdminOnly>
  );
}
```

### External Access with ngrok

To temporarily expose your application externally:

1. Ensure Docker is running (`docker-compose up -d`)
2. Access the ngrok admin panel (http://localhost:4040)
3. Use the issued URL to access your application from external sources

### Code Style
- Components are organized by functionality
- State management primarily uses React's standard features
- Styling with TailwindCSS
- Strict TypeScript type definitions

## Deployment Guide

### Deploying to Cloudflare Pages

#### Preparation
1. Create a Cloudflare account
2. Set up a new Pages project

#### Build Settings
- Build command: `npm run build`
- Output directory: `.next`
- Node.js version: `18.x` or higher

#### Environment Variables
Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL for production
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key for production

#### Important Notes
1. **Client Component Constraints**
   - Hooks like `useSearchParams` and `usePathname` must be wrapped in a `Suspense` boundary

2. **Edge Runtime Configuration**
   - Dynamic API routes (route handlers) must be configured to run with the Edge Runtime
   ```typescript
   export const runtime = 'edge';
   ```

3. **Pre-deployment Checklist**
   - Run build test locally (`npm run build`)
   - Verify that authentication redirect URLs are set to production URLs
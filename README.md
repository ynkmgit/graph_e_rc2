# リアルタイムインタラクティブプラットフォーム

リアルタイムチャット、ボードゲーム、インタラクティブビジュアライゼーションとユーティリティツールを統合したフリーミアム型ソーシャルプラットフォームです。既存の「ぐらふい」プロジェクトの機能を継承し、さらに拡張していきます。

## プロジェクト概要

このプロジェクトは、Next.js、Supabase、Docker、Cloudflare Pagesを使用して構築されたリアルタイムインタラクティブプラットフォームです。ユーザーはリアルタイムチャットでコミュニケーションを取りながら、視覚的シミュレーション、ボードゲーム、便利なツールを利用・共有したりできます。基本機能は無料で提供し、高度な機能を有料プランとして提供するフリーミアムモデルを採用しています。

## 主な機能

### 継承される「ぐらふい」の機能
- **ハーモノグラフ**: 振り子の動きが生み出す美しい幾何学模様
- **ライフゲーム**: セルオートマトンによる生命シミュレーション
- **惑星軌道（星たちのダンス）**: 惑星の軌道パターンの視覚化
- **オイラーの公式 3Dグラフ**: 数学的公式の3D視覚化
- **その他のツール**: 十字グラフ、生存戦略ゲームなど

### 新たに開発する機能
- **リアルタイムチャット**: ユーザー間でのテキストコミュニケーション
- **ユーティリティツール**: JSON整形、QRコード生成など
- **共有・協働機能**: ツールの共同編集とリアルタイム共有
- **ユーザープロフィール**: カスタマイズ可能なプロフィール
- **コンテンツギャラリー**: ユーザー作品の共有と閲覧

### 無料機能と有料機能の区分
- **無料機能**: 基本的なツール、シンプルなチャット、基本的な共有機能
- **有料機能**: 高度なツール設定、無制限の履歴保存、チーム機能、高度な協働ツール

詳細な機能マップは `docs/platform_mindmap.md` を参照してください。

## 技術スタック

- **フロントエンド**: Next.js（React）
- **バックエンド**: Next.jsの`use server`機能 + Supabase API
- **データベース**: Supabase（PostgreSQL）
- **リアルタイム機能**: Supabaseリアルタイムサブスクリプション
- **開発環境**: Docker
- **デプロイ環境**: Cloudflare Pages
- **認証**: Supabase Auth
- **ローカル公開**: ngrok（ローカル開発環境の外部公開）

## データベース設計

### 主要テーブル
- **user_profiles**: ユーザー属性管理（役割とプラン情報）
  - 役割区分: admin（管理者）、developer（開発者）、free_user（無料ユーザー）、pro_user（有料ユーザー）
  - プラン区分: free（無料）、pro（プロ）、enterprise（法人）
  - スクリプト: `/sql/scripts/user_profiles.sql`

### データベース管理
- SQLスクリプトは `/sql` ディレクトリで管理
- 変更履歴は `/sql/changes.md` に記録
- 最新のスキーマは `/sql/schema.sql` で確認可能

## 開発環境のセットアップ

### 前提条件

- Docker と Docker Compose がインストールされていること
- Git がインストールされていること
- Supabaseアカウントを作成していること
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

3. Dockerコンテナをビルドして起動する
   ```bash
   docker-compose up -d
   ```

4. データベースのセットアップ
   ```
   # Supabaseダッシュボードで /sql/scripts/user_profiles.sql を実行
   ```

5. アプリケーションにアクセスする
   ```
   http://localhost:3000  # ローカルアクセス
   http://localhost:4040  # ngrok管理パネル（外部公開URL確認用）
   ```

## ディレクトリ構造

```
graph_e_rc2/
├── docs/                   # プロジェクト設計ドキュメント
│   ├── platform_mindmap.md # 機能マインドマップ
│   ├── platform_concept.md # プラットフォームコンセプト詳細
│   ├── existing_features.md # 既存「ぐらふい」機能リファレンス
│   └── tool_implementation_guide.md # ツール実装ガイド
├── sql/                    # データベース関連ファイル
│   ├── schema.sql          # 最新のスキーマ定義
│   ├── changes.md          # 変更の簡易記録
│   └── scripts/            # 実行したSQLスクリプト
│       └── user_profiles.sql # ユーザープロファイルテーブル作成
├── src/                    # ソースコード
│   ├── app/                # Next.js App Router
│   │   ├── auth/           # 認証関連のルート
│   │   ├── login/          # ログインページ
│   │   ├── signup/         # サインアップページ
│   │   ├── chat/           # チャット機能
│   │   ├── games/          # ゲーム機能
│   │   └── tools/          # ツール機能（既存+新規）
│   ├── components/         # 共通コンポーネント
│   │   ├── auth/           # 認証関連のコンポーネント
│   │   ├── tools/          # ツール関連コンポーネント
│   │   └── ui/             # 共通UIコンポーネント
│   └── lib/                # ユーティリティと共通ロジック
│       ├── supabase.ts     # Supabase設定
│       └── tools/          # ツール関連ユーティリティ
├── public/                 # 静的ファイル
├── config/                 # 設定ファイル
├── docker-compose.yml      # Docker Compose設定
├── Dockerfile              # Dockerビルド設定
└── .env.example            # 環境変数サンプル
```

## 実装状況

### 完了済み
- 基本プロジェクト構造の設定
- Docker開発環境の構築
- ユーザー認証機能（サインアップ、ログイン、ログアウト）
- 認証保護されたルート
- ユーザー属性管理データベース設計

### 進行中
- リアルタイムチャット機能
- 既存「ぐらふい」ツールの移植
- 基本的な共有機能
- オンライン状態表示
- 通知システム

### 今後の予定
- ハーモノグラフツールの移植
- ライフゲームの移植
- 惑星軌道ツールの移植
- 新規ユーティリティツールの実装
- 有料機能の設計と実装

## ロードマップ

### 第1フェーズ（基盤構築）
- 基本認証システムの完成
- シンプルなチャット機能
- 既存「ぐらふい」ツールの移植（ハーモノグラフ、ライフゲーム）
- 基本的なツール（JSON整形、QRコード生成など）

### 第2フェーズ（機能拡充）
- 追加ツールの移植と実装
- 基本的な共有機能
- 初期の有料機能（高度なチャット機能、プレミアムツール）

### 第3フェーズ（収益化強化）
- チーム機能（プライベートルーム、高度な権限管理）
- 高度な協働ツール（プロジェクト管理機能など）
- プレミアムツール拡張（AI支援機能、高度なデータ分析）

## ngrokを使った外部公開

開発中のアプリケーションを一時的に外部公開する必要がある場合、ngrokを使用します。

1. Docker Composeでngrokサービスも起動されます
2. ngrok管理パネル（http://localhost:4040）で発行されたURLを確認
3. 発行されたURLを使用して外部からアプリケーションにアクセス可能

## デプロイ注意事項

### Cloudflare Pagesへのデプロイ

Cloudflare Pagesにデプロイする際の注意点：

1. **クライアントコンポーネントの制約**
   - `useSearchParams`や`usePathname`などのクライアントサイドフックを使用する場合は、必ず`Suspense`でラップする必要があります
   - これらのフックは別のクライアントコンポーネントに分離し、親コンポーネントから`Suspense`でラップすることを推奨します

2. **Edge Runtime対応**
   - 動的なAPI routes（route handlers）は、Edge Runtimeとして設定する必要があります
   - 各route.tsファイルに以下の行を追加してください:
     ```typescript
     export const runtime = 'edge';
     ```
   - これはCloudflare Workersの環境で実行するために必要な設定です

3. **環境変数の設定**
   - Cloudflare Pagesの環境変数設定でSupabaseの認証情報を設定する必要があります
   - 本番環境用のAPIキーとURLを使用してください（開発環境のものとは分けることを推奨）

4. **ビルド設定**
   - ビルドコマンド: `npm run build`
   - ビルド出力ディレクトリ: `.next`
   - Node.jsバージョン: `18.x`または最新の安定版

5. **デプロイ時の確認事項**
   - デプロイ前にローカルで`npm run build`を実行してビルドエラーがないか確認
   - 特に認証関連のリダイレクトURLが本番環境のURLになっているか確認

---

# Real-time Interactive Platform

A freemium social platform that integrates real-time chat, board games, interactive visualizations and utility tools. This project inherits features from the existing "ぐらふい" (Graph-e) project and extends them further.

## Project Overview

This project is a real-time interactive platform built using Next.js, Supabase, Docker, and Cloudflare Pages. Users can communicate through real-time chat while enjoying visual simulations, board games, and using/sharing useful tools. It adopts a freemium model, offering basic features for free and advanced features as paid plans.

## Main Features

### Inherited "ぐらふい" Features
- **Harmonograph**: Beautiful geometric patterns created by pendulum movements
- **Game of Life**: Life simulation through cellular automaton
- **Planetary Orbit (Dance of Stars)**: Visualization of planetary orbit patterns
- **Euler's Formula 3D Graph**: 3D visualization of mathematical formula
- **Other Tools**: Cross Graph, Survival Strategy Game, and more

### Newly Developed Features
- **Real-time Chat**: Text communication between users
- **Utility Tools**: JSON formatter, QR code generator, etc.
- **Sharing & Collaboration**: Co-editing and real-time sharing of tools
- **User Profiles**: Customizable profiles
- **Content Gallery**: Sharing and browsing user creations

### Free and Paid Features
- **Free Features**: Basic tools, simple chat, basic sharing functionality
- **Paid Features**: Advanced tool settings, unlimited history storage, team features, advanced collaboration tools

For a detailed feature map, please refer to `docs/platform_mindmap.md`.

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Next.js `use server` functionality + Supabase API
- **Database**: Supabase (PostgreSQL)
- **Real-time Features**: Supabase Realtime Subscriptions
- **Development Environment**: Docker
- **Deployment Environment**: Cloudflare Pages
- **Authentication**: Supabase Auth
- **Local Tunneling**: ngrok (exposing local development environment)

## Database Design

### Main Tables
- **user_profiles**: User attribute management (roles and plan information)
  - Role types: admin, developer, free_user, pro_user
  - Plan types: free, pro, enterprise
  - Script: `/sql/scripts/user_profiles.sql`

### Database Management
- SQL scripts are managed in the `/sql` directory
- Change history is recorded in `/sql/changes.md`
- Latest schema can be found in `/sql/schema.sql`

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

3. Build and start Docker containers
   ```bash
   docker-compose up -d
   ```

4. Database Setup
   ```
   # Run /sql/scripts/user_profiles.sql in Supabase dashboard
   ```

5. Access the application
   ```
   http://localhost:3000  # Local access
   http://localhost:4040  # ngrok admin panel (for checking public URL)
   ```

## Directory Structure

```
graph_e_rc2/
├── docs/                   # Project design documents
│   ├── platform_mindmap.md # Feature mind map
│   ├── platform_concept.md # Platform concept details
│   ├── existing_features.md # Existing "ぐらふい" features reference
│   └── tool_implementation_guide.md # Tool implementation guide
├── sql/                    # Database related files
│   ├── schema.sql          # Latest schema definition
│   ├── changes.md          # Change history record
│   └── scripts/            # SQL scripts executed
│       └── user_profiles.sql # User profile table creation
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   │   ├── auth/           # Authentication-related routes
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── chat/           # Chat functionality
│   │   ├── games/          # Games functionality
│   │   └── tools/          # Tool functionality (existing + new)
│   ├── components/         # Common components
│   │   ├── auth/           # Authentication-related components
│   │   ├── tools/          # Tool-related components
│   │   └── ui/             # Common UI components
│   └── lib/                # Utilities and common logic
│       ├── supabase.ts     # Supabase configuration
│       └── tools/          # Tool-related utilities
├── public/                 # Static files
├── config/                 # Configuration files
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build configuration
└── .env.example            # Sample environment variables
```

## Implementation Status

### Completed
- Basic project structure setup
- Docker development environment
- User authentication (signup, login, logout)
- Protected routes
- User attribute management database design

### In Progress
- Real-time chat functionality
- Migration of existing "ぐらふい" tools
- Basic sharing functionality
- Online status display
- Notification system

### Planned
- Integration of Harmonograph tool
- Integration of Game of Life
- Integration of Planetary Orbit tool
- Implementation of new utility tools
- Design and implementation of paid features

## Roadmap

### Phase 1 (Foundation)
- Complete basic authentication system
- Simple chat functionality
- Migration of existing "ぐらふい" tools (Harmonograph, Game of Life)
- Basic tools (JSON formatter, QR code generator, etc.)

### Phase 2 (Feature Expansion)
- Additional tools migration and implementation
- Basic sharing functionality
- Initial paid features (advanced chat features, premium tools)

### Phase 3 (Monetization Enhancement)
- Team features (private rooms, advanced permission management)
- Advanced collaboration tools (project management features, etc.)
- Premium tool expansion (AI assistance features, advanced data analysis)

## External Access with ngrok

When you need to temporarily expose your development application externally:

1. The ngrok service is started with Docker Compose
2. Check the issued URL on the ngrok admin panel (http://localhost:4040)
3. Use the issued URL to access your application from external sources

## Deployment Notes

### Deploying to Cloudflare Pages

Important notes for deploying to Cloudflare Pages:

1. **Client Component Constraints**
   - Hooks like `useSearchParams` and `usePathname` must be wrapped in a `Suspense` boundary
   - It's recommended to separate these hooks into separate client components and wrap them with `Suspense` from the parent component

2. **Edge Runtime Configuration**
   - Dynamic API routes (route handlers) must be configured to run with the Edge Runtime
   - Add the following line to each route.ts file:
     ```typescript
     export const runtime = 'edge';
     ```
   - This configuration is required for execution in the Cloudflare Workers environment

3. **Environment Variables**
   - Set Supabase authentication information in Cloudflare Pages environment variables
   - Use production API keys and URLs (recommended to keep them separate from development ones)

4. **Build Settings**
   - Build command: `npm run build`
   - Build output directory: `.next`
   - Node.js version: `18.x` or the latest stable version

5. **Pre-deployment Checklist**
   - Run `npm run build` locally to check for build errors before deploying
   - Verify that authentication redirect URLs are set to production URLs
# Graph E RC2

Next.js + Supabaseを使った、リアルタイム機能に対応したフルスタックWebアプリケーション

## プロジェクト概要

Graph E RC2は、タスク管理、リアルタイムチャット、ユーザープロフィール管理などの機能を提供するWebアプリケーションです。モダンなUIと優れたユーザー体験を実現するために、Next.jsとSupabaseを中心とした最新の技術スタックを採用しています。

## 主要機能

- **認証システム**: ユーザー登録・ログイン機能（Supabase Auth）
- **ダッシュボード**: タスク管理、統計情報表示
- **タスク管理**: タスクの追加・完了状態の切替・削除機能
- **リアルタイムチャット**: WebSocket通信によるリアルタイムメッセージング
- **チャット機能**: チャットルームの作成・参加、メッセージ送受信
- **プロフィール管理**: ユーザー情報の設定と更新
- **管理機能**: ユーザーロールの管理、データベース情報の閲覧

## 技術スタック

- **フロントエンド**: Next.js 14.1.0 (React 18, TypeScript)
- **スタイリング**: TailwindCSS
- **バックエンド**: Supabase (PostgreSQL, Functions, RLS)
- **データベース**: Supabase PostgreSQL
- **認証機構**: Supabase Auth
- **リアルタイム通信**: Supabase Realtime
- **デプロイ環境**: Vercel, Docker (または任意のプラットフォーム)
- **開発補助ツール**: ngrok

## 特徴

- **サーバーレスアーキテクチャ**: フルスタックでありながらサーバー運用コストゼロ
- **リアルタイム通信**: WebSocketによる高速で信頼性の高いリアルタイム通信
- **セキュリティ**: RLS（Row Level Security）による厳格なアクセス制御
- **型安全**: TypeScriptによる型安全なコード開発
- **モダンUI**: TailwindCSSによるレスポンシブで美しいUI
- **コンテナ化**: Dockerによる一貫した開発・デプロイ環境

## 環境設定

### 通常のセットアップ (Dockerなし)

1. リポジトリのクローン:
   ```bash
   git clone <repository-url>
   cd graph_e_rc2
   ```

2. 依存パッケージのインストール:
   ```bash
   npm install
   ```

3. 環境変数の設定:
   ```bash
   # .env.exampleをコピーして.envファイルを作成
   cp .env.example .env.local
   
   # .env.localファイルを編集して必要な環境変数を設定
   ```

4. 開発サーバーの起動:
   ```bash
   npm run dev
   ```

5. ブラウザで http://localhost:3000 にアクセス

### Dockerを使用したセットアップ

1. リポジトリのクローン:
   ```bash
   git clone <repository-url>
   cd graph_e_rc2
   ```

2. 環境変数の設定:
   ```bash
   # .env.exampleをコピーして.envファイルを作成
   cp .env.example .env
   
   # .envファイルを編集して必要な環境変数を設定
   ```

3. 開発環境の起動:
   ```bash
   # 開発環境（ホットリロード対応）
   docker-compose -f docker-compose.dev.yml up -d
   
   # または本番に近い環境
   docker-compose up -d
   ```

4. ブラウザで http://localhost:3000 にアクセス

5. コンテナの停止:
   ```bash
   # 開発環境
   docker-compose -f docker-compose.dev.yml down
   
   # または本番環境
   docker-compose down
   ```

## Docker環境について

プロジェクトには以下のDockerファイルが含まれています：

- **Dockerfile**: 本番用ビルド環境
- **Dockerfile.dev**: 開発用環境（ホットリロード対応）
- **docker-compose.yml**: 基本的なコンテナ構成
- **docker-compose.dev.yml**: 開発向けの拡張構成

### Dockerコマンド例

```bash
# 開発環境のビルドと起動（初回または依存関係変更時）
docker-compose -f docker-compose.dev.yml up --build

# 本番ビルドのテスト
docker-compose up --build

# コンテナ内でコマンド実行
docker-compose exec app npm run <command>

# ログの確認
docker-compose logs -f app
```

## 環境変数の説明

- **Supabase**:
  - `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- **サイトURL** (認証リダイレクト用):
  - `NEXT_PUBLIC_SITE_URL`: サイトのURL (開発時は `http://localhost:3000`)
- **ngrok** (オプション、ローカル開発用):
  - `NGROK_AUTHTOKEN`: ngrokの認証トークン

## Supabaseプロジェクトのセットアップ

1. [Supabase](https://supabase.com/) でアカウント作成・ログイン
2. 新しいプロジェクトを作成
3. SQL Editorで `supabase_init.sql` ファイルの内容を実行
4. プロジェクトの設定 > API から URL と anon キーを取得し、環境変数に設定
5. 認証設定:
   - Email認証を有効化
   - サイトURLを設定 (本番環境: 実際のドメイン、開発環境: http://localhost:3000)

## データベース構造

このプロジェクトでは、以下のテーブルスキーマを使用しています:

### 1. user_profiles (ユーザープロフィール)
```sql
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 2. user_roles (ユーザー権限)
```sql
CREATE TABLE public.user_roles (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'user')) DEFAULT 'user'
);
```

### 3. todos (タスク管理)
```sql
CREATE TABLE public.todos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### 4. chat_rooms (チャットルーム)
```sql
CREATE TABLE public.chat_rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_private BOOLEAN NOT NULL DEFAULT false
);
```

### 5. chat_room_members (チャットルームメンバー)
```sql
CREATE TABLE public.chat_room_members (
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);
```

### 6. chat_messages (チャットメッセージ)
```sql
CREATE TABLE public.chat_messages (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  is_edited BOOLEAN NOT NULL DEFAULT false
);
```

## プロジェクト構造

- `/app`: Next.jsのApp Router構成のメインディレクトリ
  - `/(auth)`: 認証関連のページ
  - `/(dashboard)`: ダッシュボード、チャット、プロフィール管理
  - `/auth/callback`: Supabase認証コールバック
- `/components`: 再利用可能なUIコンポーネント
- `/lib`: ユーティリティ関数とSupabase連携コード
  - `/middleware`: 認証ミドルウェア
- `/public`: 静的ファイル

## デプロイ方法

### Vercelへのデプロイ
1. Vercelでプロジェクトを設定
2. 環境変数を設定
3. デプロイ

### Dockerを使用したデプロイ
1. 本番用にビルド
   ```bash
   docker build -t graph-e-rc2 --build-arg NEXT_PUBLIC_SUPABASE_URL=<URL> --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=<KEY> --build-arg NEXT_PUBLIC_SITE_URL=<URL> .
   ```

2. コンテナの実行
   ```bash
   docker run -p 3000:3000 graph-e-rc2
   ```

## ローカル開発のヒント

- ngrokを使用して外部からのアクセスを可能にする（Supabase認証のコールバックURL設定のため）
  ```bash
  npx ngrok http 3000
  ```
  ※ ngrokで発行されたURLをSupabaseのサイトURLとして一時的に設定

- または、Docker環境でTraefikを使用する場合：
  ```bash
  docker-compose -f docker-compose.dev.yml up -d
  ```
  ※ 必要に応じてTraefikの設定を調整

## RC1から改善された点

- **Cloudflare D1からSupabaseへの移行**: 統一されたプラットフォームでの開発
- **リアルタイム機能の追加**: WebSocketベースのリアルタイムメッセージング
- **認証フローの改善**: メール確認フローの適正化
- **SQLスキーマの最適化**: RLSによるセキュリティの強化
- **型安全性の向上**: データベース型定義の改善
- **Docker対応**: コンテナ化による一貫した開発・運用環境

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細については[LICENSE](LICENSE)ファイルを参照してください。

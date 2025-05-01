# リアルタイムインタラクティブプラットフォーム

リアルタイムチャットとボードゲームを統合したソーシャルプラットフォームです。

## プロジェクト概要

このプロジェクトは、Next.js、Supabase、Docker、Cloudflare Pagesを使用して構築されたリアルタイムインタラクティブプラットフォームです。ユーザーはリアルタイムチャットでコミュニケーションを取りながら、様々なボードゲームを楽しむことができます。

## 技術スタック

- **フロントエンド**: Next.js（React）
- **バックエンド**: Next.jsの`use server`機能 + Supabase API
- **データベース**: Supabase（PostgreSQL）
- **リアルタイム機能**: Supabaseリアルタイムサブスクリプション
- **開発環境**: Docker
- **デプロイ環境**: Cloudflare Pages
- **認証**: Supabase Auth
- **ローカル公開**: ngrok（ローカル開発環境の外部公開）

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

4. アプリケーションにアクセスする
   ```
   http://localhost:3000  # ローカルアクセス
   http://localhost:4040  # ngrok管理パネル（外部公開URL確認用）
   ```

## 主な機能

- ユーザー認証（サインアップ、ログイン、ログアウト）
- リアルタイムチャット
- オンライン状態表示
- ボードゲームプラットフォーム
- マルチプレイヤー対応
- 通知システム

## 実装状況

### 完了済み
- 基本プロジェクト構造の設定
- Docker開発環境の構築
- ユーザー認証機能（サインアップ、ログイン、ログアウト）
- 認証保護されたルート

### 進行中
- リアルタイムチャット機能
- ボードゲームプラットフォーム
- オンライン状態表示
- 通知システム

## ディレクトリ構造

```
graph_e_rc2/
├── src/                    # ソースコード
│   ├── app/                # Next.js App Router
│   │   ├── auth/           # 認証関連のルート
│   │   ├── login/          # ログインページ
│   │   ├── signup/         # サインアップページ
│   │   ├── chat/           # チャット機能
│   │   ├── games/          # ゲーム機能
│   ├── components/         # 共通コンポーネント
│   │   ├── auth/           # 認証関連のコンポーネント
│   │   ├── Header.tsx      # ヘッダーコンポーネント
│   └── lib/                # ユーティリティと共通ロジック
│       ├── supabase.ts     # Supabase設定
├── public/                 # 静的ファイル
├── config/                 # 設定ファイル
├── docker-compose.yml      # Docker Compose設定
├── Dockerfile              # Dockerビルド設定
└── .env.example            # 環境変数サンプル
```

## ngrokを使った外部公開

開発中のアプリケーションを一時的に外部公開する必要がある場合、ngrokを使用します。

1. Docker Composeでngrokサービスも起動されます
2. ngrok管理パネル（http://localhost:4040）で発行されたURLを確認
3. 発行されたURLを使用して外部からアプリケーションにアクセス可能

---

# Real-time Interactive Platform

A social platform that integrates real-time chat and board games.

## Project Overview

This project is a real-time interactive platform built using Next.js, Supabase, Docker, and Cloudflare Pages. Users can communicate through real-time chat while enjoying various board games.

## Tech Stack

- **Frontend**: Next.js (React)
- **Backend**: Next.js `use server` functionality + Supabase API
- **Database**: Supabase (PostgreSQL)
- **Real-time Features**: Supabase Realtime Subscriptions
- **Development Environment**: Docker
- **Deployment Environment**: Cloudflare Pages
- **Authentication**: Supabase Auth
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

3. Build and start Docker containers
   ```bash
   docker-compose up -d
   ```

4. Access the application
   ```
   http://localhost:3000  # Local access
   http://localhost:4040  # ngrok admin panel (for checking public URL)
   ```

## Main Features

- User authentication (signup, login, logout)
- Real-time chat
- Online status display
- Board game platform
- Multiplayer support
- Notification system

## Implementation Status

### Completed
- Basic project structure setup
- Docker development environment
- User authentication (signup, login, logout)
- Protected routes

### In Progress
- Real-time chat functionality
- Board game platform
- Online status display
- Notification system

## Directory Structure

```
graph_e_rc2/
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   │   ├── auth/           # Authentication-related routes
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── chat/           # Chat functionality
│   │   ├── games/          # Games functionality
│   ├── components/         # Common components
│   │   ├── auth/           # Authentication-related components
│   │   ├── Header.tsx      # Header component
│   └── lib/                # Utilities and common logic
│       ├── supabase.ts     # Supabase configuration
├── public/                 # Static files
├── config/                 # Configuration files
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build configuration
└── .env.example            # Sample environment variables
```

## External Access with ngrok

When you need to temporarily expose your development application externally:

1. The ngrok service is started with Docker Compose
2. Check the issued URL on the ngrok admin panel (http://localhost:4040)
3. Use the issued URL to access your application from external sources

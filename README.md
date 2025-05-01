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

## 開発環境のセットアップ

### 前提条件

- Docker と Docker Compose がインストールされていること
- Git がインストールされていること
- Supabaseアカウントを作成していること

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
   http://localhost:3000
   ```

## 主な機能

- ユーザー認証（サインアップ、ログイン、ログアウト）
- リアルタイムチャット
- オンライン状態表示
- ボードゲームプラットフォーム
- マルチプレイヤー対応
- 通知システム

## ディレクトリ構造

```
graph_e_rc2/
├── src/                    # ソースコード
│   ├── app/                # Next.js App Router
│   ├── components/         # 共通コンポーネント
│   └── lib/                # ユーティリティと共通ロジック
├── public/                 # 静的ファイル
├── docker-compose.yml      # Docker Compose設定
├── Dockerfile              # Dockerビルド設定
└── .env.example            # 環境変数サンプル
```

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

## Development Environment Setup

### Prerequisites

- Docker and Docker Compose installed
- Git installed
- Supabase account created

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
   http://localhost:3000
   ```

## Main Features

- User authentication (signup, login, logout)
- Real-time chat
- Online status display
- Board game platform
- Multiplayer support
- Notification system

## Directory Structure

```
graph_e_rc2/
├── src/                    # Source code
│   ├── app/                # Next.js App Router
│   ├── components/         # Common components
│   └── lib/                # Utilities and common logic
├── public/                 # Static files
├── docker-compose.yml      # Docker Compose configuration
├── Dockerfile              # Docker build configuration
└── .env.example            # Sample environment variables
```

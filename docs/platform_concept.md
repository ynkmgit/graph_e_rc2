# リアルタイムインタラクティブプラットフォーム機能拡張構想

## 1. プロジェクト概要

### ビジョン

「リアルタイムインタラクティブプラットフォーム」を、単なるチャットとゲームの場から、**ユーティリティツールも提供する総合的なソーシャル・ユーティリティプラットフォーム**へと拡張する。ユーザーはコミュニケーションと並行して、実用的なWebツールを利用・共有できるプラットフォームを目指す。

### 目的

- 既存のチャットとゲーム機能に加え、**実用的なWebツール**を統合
- ユーザー同士が**リアルタイムで共同作業**できる機能を提供
- **ツールの共有と協働**を通じたコミュニティ形成を促進
- プラットフォームの使用価値と滞在時間を向上

### 参考サイト

本プロジェクトは、以下のサイトのコンセプトを参考に設計します：
- [無限ツールズ](https://mugen-tools.com/) - 多様なWebツールを提供するサイト
- プラットフォームの独自性として、ツールの**リアルタイム共有機能**と**ソーシャル要素**を付加

## 2. 機能要件

### A. コミュニケーション機能の拡張

#### リアルタイムチャット（既存機能の強化）
- テキスト整形機能（マークダウン対応）
- メッセージの校正支援（文章校正支援機能）
- リアルタイム翻訳機能
- コード共有支援（構文ハイライト、整形機能）

#### 協働エディタ
- リアルタイムでの共同文書編集
- JSONやCSVなどのデータ形式を共同編集・整形

### B. ゲーム・エンターテイメント

#### ボードゲーム（既存機能の強化）
- チェス、オセロ、将棋などの基本ゲーム
- カスタムゲームの作成機能

#### ミニゲーム・ツール
- サイコロを振る機能
- クイズ作成・共有機能
- タイマー・ストップウォッチ機能（共有可能）

### C. 開発者向けツール

#### コード関連ツール
- JSON整形
- BASE64エンコード・デコード
- ハッシュ計算ツール
- CSS・HTMLフォーマッタ

#### デザインサポート
- カラーコード変換ツール
- CSSグラデーション作成支援
- シンプルなピクセルアート作成ツール

### D. ユーティリティツール

#### テキスト処理
- 文章校正支援
- マークダウン・HTMLの相互変換

#### メディア処理
- 画像→imgタグ変換
- QRコード生成
- 簡易図形・アイコン作成

#### データ変換
- CSV→JSONなどの変換ツール
- 単位変換ツール

### E. 共同作業ツール

#### アイデア出し
- ブレインストーミングボード
- タスク管理ボード
- マインドマップ作成

#### プロジェクト管理
- シンプルなカンバンボード
- タイムライン共有

## 3. 技術アーキテクチャ

### システム構成

```
+-------------------+      +-------------------+
|                   |      |                   |
|  フロントエンド   <----->  バックエンド      |
|  (Next.js)        |      |  (Next.js API)    |
|                   |      |                   |
+-------------------+      +------+------------+
                                  |
                                  v
                           +------+------------+
                           |                   |
                           |  Supabase        |
                           |  (データ/認証)    |
                           |                   |
                           +-------------------+
```

#### フロントエンド
- Next.jsによるクライアントサイドレンダリング
- Reactコンポーネントによるツール実装
- Supabaseクライアントによるリアルタイム通信

#### バックエンド
- Next.jsのAPI機能を利用したサーバーサイド処理
- Supabase APIを活用したデータ操作
- Edgeランタイムでの高速処理

#### データベース/認証
- Supabase（PostgreSQL）によるデータ管理
- Supabaseリアルタイムサブスクリプションによる同期
- Supabase Authによる認証管理

### データフロー

1. **ツール操作時**:
   ```
   ユーザー操作 → Reactコンポーネント → Supabase同期 → 他ユーザーに反映
   ```

2. **チャット機能**:
   ```
   メッセージ送信 → API Route → Supabaseへ保存 → リアルタイムサブスクリプション → 全員に配信
   ```

3. **ゲーム操作**:
   ```
   ゲーム操作 → 状態変更 → Supabaseへ保存 → リアルタイムサブスクリプション → 全プレイヤーに反映
   ```

## 4. データモデル

### ユーザーテーブル（既存の拡張）
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  last_online TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ツールデータテーブル
```sql
CREATE TABLE tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tool_type TEXT NOT NULL,
  data JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 共有ルームテーブル
```sql
CREATE TABLE shared_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  is_private BOOLEAN DEFAULT FALSE,
  room_type TEXT NOT NULL, -- 'chat', 'game', 'tool'
  tool_type TEXT, -- 使用するツールタイプ（該当する場合）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ルームメンバーテーブル
```sql
CREATE TABLE room_members (
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);
```

### ツール共有状態テーブル
```sql
CREATE TABLE shared_tool_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  state JSONB,
  last_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. 実装計画

### フェーズ1: 基盤構築（所要期間: 2週間）

- **ツールエンジン基本アーキテクチャ設計**
  - 共通ツールインターフェース設計
  - ツール状態管理システム
  - ツールギャラリーUIの基本構造

- **データベーススキーマ拡張**
  - 上記データモデルの実装
  - Supabaseセキュリティポリシー設定

- **基本UIフレームワーク**
  - ツール表示コンポーネント
  - 共有システムのUI

### フェーズ2: 基本ツール実装（所要期間: 3週間）

- **テキスト処理ツール群**
  - 文章校正支援ツール
  - マークダウンエディタ
  - テキスト変換ツール

- **コード関連ツール群**
  - JSON整形ツール
  - Base64エンコード・デコード
  - HTMLフォーマッタ

- **単純計算ツール**
  - 単位変換
  - 日付・時間計算

### フェーズ3: リアルタイム機能強化（所要期間: 2週間）

- **ツール状態同期機能**
  - リアルタイム状態更新システム
  - 編集権限管理

- **共同作業モード**
  - ルーム作成・管理機能
  - 参加者管理システム

- **チャット・ゲームとの連携**
  - ツール結果の共有機能
  - チャットへの埋め込み表示

### フェーズ4: 高度なツール追加（所要期間: 3週間）

- **画像処理系ツール**
  - QRコード生成
  - 簡易画像エディタ

- **データ可視化ツール**
  - 簡易チャート生成
  - データテーブル表示・編集

- **カスタムツール作成機能**
  - ユーザー定義ツールの基盤

## 6. UIコンセプト

### メインレイアウト

```
+---------------------------------------------------+
|                ヘッダー/ナビゲーション            |
+---------------------------------------------------+
|                                   |               |
|                                   |               |
|                                   |               |
|                                   |               |
|        メインコンテンツエリア     |   サイドバー  |
|        (チャット/ゲーム/ツール)   |   (ユーザー   |
|                                   |   /ルーム一覧) |
|                                   |               |
|                                   |               |
+---------------------------------------------------+
|                    フッター                       |
+---------------------------------------------------+
```

### ツールギャラリー

```
+---------------------------------------------------+
|  検索バー   |   カテゴリフィルター   |  並び替え  |
+---------------------------------------------------+
|  [ツール1]  |  [ツール2]  |  [ツール3]  |  [ツール4]  |
+---------------------------------------------------+
|  [ツール5]  |  [ツール6]  |  [ツール7]  |  [ツール8]  |
+---------------------------------------------------+
|               もっと見る                          |
+---------------------------------------------------+
```

### ツール使用画面

```
+---------------------------------------------------+
|  ツール名  |  共有  |  保存  |  エクスポート     |
+---------------------------------------------------+
|                                                   |
|                   入力エリア                      |
|                                                   |
+---------------------------------------------------+
|                                                   |
|                   出力エリア                      |
|                                                   |
+---------------------------------------------------+
|  オプション  |  設定  |  使用履歴  |  関連ツール  |
+---------------------------------------------------+
```

### 共有ルーム

```
+---------------------------------------------------+
|  ルーム名  |  参加者 (3)  |  設定  |  退出       |
+---------------------------------------------------+
|                                   |               |
|                                   |               |
|                                   |               |
|                                   |               |
|        共有ツール/チャット        |   参加者     |
|          表示エリア               |   リスト     |
|                                   |               |
|                                   |               |
|                                   |               |
+---------------------------------------------------+
|  メッセージ入力  |  ツール切替  |  アクション   |
+---------------------------------------------------+
```

## 7. 将来の拡張性

- **API連携**
  - 外部APIと連携したツール追加
  - OpenAI等のAIサービス統合

- **プラグインシステム**
  - サードパーティによるツール開発

- **モバイル対応**
  - レスポンシブデザイン最適化
  - PWA対応

- **カスタマイズ機能**
  - ユーザー別テーマ設定
  - ツール配置カスタマイズ

- **プレミアム機能**
  - 高度なツールや機能の有料提供
  - チーム向け拡張機能

## 8. セキュリティ考慮事項

- **データアクセス制御**
  - Row Level Security (RLS) によるアクセス制限
  - 共有データの権限管理

- **ユーザー入力の検証**
  - すべての入力に対する適切なバリデーション
  - サニタイズ処理

- **レート制限**
  - API呼び出しの制限
  - リソース使用量の監視

- **監査ログ**
  - 重要な操作のログ記録
  - 不正アクセス検知

---

# Real-time Interactive Platform Feature Extension Concept

## 1. Project Overview

### Vision

Transform the "Real-time Interactive Platform" from a simple chat and game platform into a **comprehensive social utility platform that provides useful web tools**. We aim to create a platform where users can utilize and share practical web tools while communicating with each other.

### Purpose

- Integrate **practical web tools** in addition to existing chat and game features
- Provide functionality for users to **collaborate in real-time**
- Promote community building through **tool sharing and collaboration**
- Increase platform value and user engagement time

### Reference Site

This project is designed with reference to the concepts of the following site:
- [Mugen Tools](https://mugen-tools.com/) - A site that provides various web tools
- The platform's uniqueness will be enhanced by adding **real-time sharing functionality** and **social elements** to tools

## 2. Feature Requirements

### A. Communication Feature Extensions

#### Real-time Chat (Enhancement of Existing Features)
- Text formatting functionality (Markdown support)
- Message proofreading support
- Real-time translation
- Code sharing support (syntax highlighting, formatting)

#### Collaborative Editor
- Real-time collaborative document editing
- Collaborative editing and formatting of data formats like JSON and CSV

### B. Games & Entertainment

#### Board Games (Enhancement of Existing Features)
- Basic games like chess, reversi, shogi
- Custom game creation functionality

#### Mini Games & Tools
- Dice rolling function
- Quiz creation and sharing
- Timer/stopwatch function (shareable)

### C. Developer Tools

#### Code-related Tools
- JSON formatter
- BASE64 encoder/decoder
- Hash calculation tool
- CSS/HTML formatter

#### Design Support
- Color code conversion tool
- CSS gradient creation support
- Simple pixel art creation tool

### D. Utility Tools

#### Text Processing
- Text proofreading support
- Markdown/HTML conversion

#### Media Processing
- Image to img tag conversion
- QR code generation
- Simple shape/icon creation

#### Data Conversion
- CSV to JSON conversion tools
- Unit conversion tools

### E. Collaboration Tools

#### Ideation
- Brainstorming board
- Task management board
- Mind map creation

#### Project Management
- Simple Kanban board
- Timeline sharing

## 3. Technical Architecture

### System Configuration

```
+-------------------+      +-------------------+
|                   |      |                   |
|  Frontend         <----->  Backend          |
|  (Next.js)        |      |  (Next.js API)    |
|                   |      |                   |
+-------------------+      +------+------------+
                                  |
                                  v
                           +------+------------+
                           |                   |
                           |  Supabase        |
                           |  (Data/Auth)      |
                           |                   |
                           +-------------------+
```

#### Frontend
- Client-side rendering with Next.js
- Tool implementation using React components
- Real-time communication using Supabase client

#### Backend
- Server-side processing using Next.js API functions
- Data operations using Supabase API
- Fast processing with Edge runtime

#### Database/Authentication
- Data management with Supabase (PostgreSQL)
- Synchronization using Supabase real-time subscriptions
- Authentication management with Supabase Auth

### Data Flow

1. **When operating tools**:
   ```
   User operation → React component → Supabase sync → Reflected to other users
   ```

2. **Chat functionality**:
   ```
   Message sent → API Route → Saved to Supabase → Real-time subscription → Broadcast to everyone
   ```

3. **Game operation**:
   ```
   Game operation → State change → Saved to Supabase → Real-time subscription → Reflected to all players
   ```

## 4. Data Model

### Users Table (Extension of Existing)
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  last_online TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tool Data Table
```sql
CREATE TABLE tool_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  tool_type TEXT NOT NULL,
  data JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Shared Rooms Table
```sql
CREATE TABLE shared_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  is_private BOOLEAN DEFAULT FALSE,
  room_type TEXT NOT NULL, -- 'chat', 'game', 'tool'
  tool_type TEXT, -- Tool type to use (if applicable)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Room Members Table
```sql
CREATE TABLE room_members (
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'owner', 'admin', 'member', 'viewer'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (room_id, user_id)
);
```

### Shared Tool States Table
```sql
CREATE TABLE shared_tool_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES shared_rooms(id) ON DELETE CASCADE,
  tool_type TEXT NOT NULL,
  state JSONB,
  last_updated_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Implementation Plan

### Phase 1: Foundation Building (Duration: 2 weeks)

- **Tool Engine Basic Architecture Design**
  - Common tool interface design
  - Tool state management system
  - Basic structure of tool gallery UI

- **Database Schema Extension**
  - Implementation of the above data model
  - Supabase security policy configuration

- **Basic UI Framework**
  - Tool display component
  - Sharing system UI

### Phase 2: Basic Tool Implementation (Duration: 3 weeks)

- **Text Processing Tool Group**
  - Text proofreading support tool
  - Markdown editor
  - Text conversion tools

- **Code-related Tool Group**
  - JSON formatter
  - Base64 encoder/decoder
  - HTML formatter

- **Simple Calculation Tools**
  - Unit conversion
  - Date/time calculation

### Phase 3: Real-time Feature Enhancement (Duration: 2 weeks)

- **Tool State Synchronization**
  - Real-time state update system
  - Edit permission management

- **Collaborative Mode**
  - Room creation/management functionality
  - Participant management system

- **Integration with Chat & Games**
  - Tool result sharing functionality
  - Embedded display in chat

### Phase 4: Advanced Tool Addition (Duration: 3 weeks)

- **Image Processing Tools**
  - QR code generation
  - Simple image editor

- **Data Visualization Tools**
  - Simple chart generation
  - Data table display/editing

- **Custom Tool Creation**
  - Foundation for user-defined tools

## 6. UI Concept

### Main Layout

```
+---------------------------------------------------+
|                Header/Navigation                  |
+---------------------------------------------------+
|                                   |               |
|                                   |               |
|                                   |               |
|                                   |               |
|        Main Content Area          |   Sidebar    |
|        (Chat/Game/Tool)           |   (Users/    |
|                                   |   Room List)  |
|                                   |               |
|                                   |               |
+---------------------------------------------------+
|                    Footer                         |
+---------------------------------------------------+
```

### Tool Gallery

```
+---------------------------------------------------+
|  Search Bar  |  Category Filter   |  Sort         |
+---------------------------------------------------+
|  [Tool 1]    |  [Tool 2]  |  [Tool 3]  |  [Tool 4]  |
+---------------------------------------------------+
|  [Tool 5]    |  [Tool 6]  |  [Tool 7]  |  [Tool 8]  |
+---------------------------------------------------+
|               See More                            |
+---------------------------------------------------+
```

### Tool Usage Screen

```
+---------------------------------------------------+
|  Tool Name  |  Share  |  Save  |  Export         |
+---------------------------------------------------+
|                                                   |
|                   Input Area                      |
|                                                   |
+---------------------------------------------------+
|                                                   |
|                   Output Area                     |
|                                                   |
+---------------------------------------------------+
|  Options  |  Settings  |  History  |  Related Tools |
+---------------------------------------------------+
```

### Shared Room

```
+---------------------------------------------------+
|  Room Name  |  Participants (3)  |  Settings  |  Exit |
+---------------------------------------------------+
|                                   |               |
|                                   |               |
|                                   |               |
|                                   |               |
|        Shared Tool/Chat           |  Participant |
|          Display Area             |     List     |
|                                   |               |
|                                   |               |
|                                   |               |
+---------------------------------------------------+
|  Message Input  |  Tool Switch  |  Actions      |
+---------------------------------------------------+
```

## 7. Future Extensibility

- **API Integration**
  - Adding tools integrated with external APIs
  - Integration with AI services like OpenAI

- **Plugin System**
  - Tool development by third parties

- **Mobile Support**
  - Responsive design optimization
  - PWA support

- **Customization Features**
  - User-specific theme settings
  - Tool layout customization

- **Premium Features**
  - Paid provision of advanced tools and features
  - Team extension features

## 8. Security Considerations

- **Data Access Control**
  - Access restriction using Row Level Security (RLS)
  - Permission management for shared data

- **User Input Validation**
  - Appropriate validation for all inputs
  - Sanitization processing

- **Rate Limiting**
  - API call limitations
  - Resource usage monitoring

- **Audit Logs**
  - Logging of important operations
  - Unauthorized access detection
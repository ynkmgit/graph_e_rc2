/*
 * schema.sql
 * 最終更新日: 2025-05-04
 * 概要: 完全なデータベーススキーマ
 */

-- ユーザープロファイルテーブル
CREATE TABLE public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'free_user',  -- 'admin', 'developer', 'free_user', 'pro_user'
  plan_type TEXT NOT NULL DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
  plan_started_at TIMESTAMP WITH TIME ZONE,
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,  -- 論理削除のための日時フィールド、NULLは削除されていないことを示す
  
  -- プロフィール拡張フィールド
  username TEXT UNIQUE,  -- @から始まる一意のID
  bio TEXT,              -- 自己紹介文
  avatar_type TEXT NOT NULL DEFAULT 'sample', -- 'sample'または'custom'
  selected_avatar_id TEXT, -- サンプルアバターの場合、選択したアバターID
  online_status TEXT NOT NULL DEFAULT 'offline', -- 'online', 'offline', 'busy'など
  last_active_at TIMESTAMP WITH TIME ZONE, -- 最終アクティブ時間
  
  -- バリデーション用チェック制約
  CONSTRAINT valid_username CHECK (username ~ '^[a-z0-9_]{3,20}$'), -- 小文字、数字、アンダースコアのみ、3-20文字
  CONSTRAINT valid_avatar_type CHECK (avatar_type IN ('sample', 'custom'))
);

-- インデックス
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_plan_type ON public.user_profiles(plan_type);
CREATE INDEX idx_user_profiles_deleted_at ON public.user_profiles(deleted_at);
CREATE INDEX idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX idx_user_profiles_online_status ON public.user_profiles(online_status);

-- Row Level Security ポリシー
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- 通常ユーザーは自分の削除されていないプロファイルのみ参照可能
CREATE POLICY "ユーザーは自分のプロファイルを参照可能" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id AND deleted_at IS NULL);

-- ユーザーは自分のプロファイルの更新が可能
CREATE POLICY "ユーザーは自分のプロファイルを更新可能" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- 管理者はすべてのプロファイルにアクセス可能（削除されたユーザーも含む）
CREATE POLICY "管理者はすべてのプロファイルにアクセス可能" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ユーザーは自分のプロファイル作成が可能
CREATE POLICY "ユーザーは自分のプロファイルを作成可能" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- メモテーブル
CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL -- 論理削除用
);

-- インデックス
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_is_public ON public.notes(is_public);
CREATE INDEX idx_notes_created_at ON public.notes(created_at);
CREATE INDEX idx_notes_deleted_at ON public.notes(deleted_at);

-- Row Level Security ポリシー
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のメモのみ参照可能
CREATE POLICY "ユーザーは自分のメモを参照可能" 
ON public.notes FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- 公開メモは誰でも参照可能
CREATE POLICY "公開メモは誰でも参照可能" 
ON public.notes FOR SELECT 
USING (is_public = true AND deleted_at IS NULL);

-- ユーザーは自分のメモの作成が可能
CREATE POLICY "ユーザーは自分のメモを作成可能" 
ON public.notes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のメモの更新が可能
CREATE POLICY "ユーザーは自分のメモを更新可能" 
ON public.notes FOR UPDATE 
USING (auth.uid() = user_id);

-- ユーザーは自分のメモの削除が可能
CREATE POLICY "ユーザーは自分のメモを削除可能" 
ON public.notes FOR DELETE 
USING (auth.uid() = user_id);

-- 管理者はすべてのメモにアクセス可能
CREATE POLICY "管理者はすべてのメモにアクセス可能" 
ON public.notes FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
/*
 * schema.sql
 * 最終更新日: 2025-05-03
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
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL  -- 論理削除のための日時フィールド、NULLは削除されていないことを示す
);

-- インデックス
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_plan_type ON public.user_profiles(plan_type);
CREATE INDEX idx_user_profiles_deleted_at ON public.user_profiles(deleted_at);

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

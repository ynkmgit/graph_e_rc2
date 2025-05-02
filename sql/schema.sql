/*
 * schema.sql
 * 最終更新日: 2023-05-03
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
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_plan_type ON public.user_profiles(plan_type);

-- Row Level Security ポリシー
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ユーザーは自分のプロファイルを参照可能" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "ユーザーは自分のプロファイルを更新可能" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "管理者はすべてのプロファイルにアクセス可能" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "ユーザーは自分のプロファイルを作成可能" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

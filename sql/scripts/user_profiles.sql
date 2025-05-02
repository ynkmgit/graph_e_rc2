/*
 * user_profiles.sql
 * 作成日: 2023-05-03
 * 概要: ユーザー属性管理テーブル
 * 目的: 管理者、開発者、無料版、Pro版などの属性を割り当て
 */

-- ユーザープロファイルテーブルの作成
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

-- 検索やフィルタリングを高速化するインデックス
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_user_profiles_plan_type ON public.user_profiles(plan_type);

-- 行レベルセキュリティを有効化
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- セキュリティポリシー: ユーザーは自分のプロファイルを参照可能
CREATE POLICY "ユーザーは自分のプロファイルを参照可能" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

-- セキュリティポリシー: ユーザーは自分のプロファイルを更新可能
CREATE POLICY "ユーザーは自分のプロファイルを更新可能" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id);

-- セキュリティポリシー: 管理者はすべてのプロファイルにアクセス可能
CREATE POLICY "管理者はすべてのプロファイルにアクセス可能" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- プロファイル作成時にユーザーが自分のプロファイルを作成できるようにする
CREATE POLICY "ユーザーは自分のプロファイルを作成可能" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

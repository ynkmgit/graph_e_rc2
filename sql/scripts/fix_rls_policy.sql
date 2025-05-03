/*
 * fix_rls_policy.sql
 * 作成日: 2025-05-03
 * 概要: RLSポリシーの無限再帰問題を修正
 * 目的: 管理者権限チェックのポリシーを修正し、無限再帰を防止する
 */

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "管理者はすべてのプロファイルにアクセス可能" ON public.user_profiles;
DROP POLICY IF EXISTS "ユーザーは自分のプロファイルを参照可能" ON public.user_profiles;

-- 管理者権限用セキュリティデフォルトとして管理者テーブルを作成
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 最初の管理者を登録 (hoge1@example.comユーザーのIDを確認し適切なIDに変更する必要があります)
-- このSQLは実行前に確認し、適切なユーザーIDに書き換えてください
INSERT INTO public.admin_users (id)
SELECT id FROM public.user_profiles 
WHERE role = 'admin' 
ON CONFLICT (id) DO NOTHING;

-- 修正した管理者ポリシー（無限再帰を防止するデザイン）
CREATE POLICY "管理者はすべてのプロファイルにアクセス可能" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE id = auth.uid()
  )
);

-- ユーザー自身のプロファイル参照ポリシー（削除済みユーザーのアクセス制限を含む）
CREATE POLICY "ユーザーは自分のプロファイルを参照可能" 
ON public.user_profiles FOR SELECT 
USING (
  auth.uid() = id AND (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE id = auth.uid()
    ) OR deleted_at IS NULL
  )
);

-- その他のポリシーは必要に応じて調整

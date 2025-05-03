/*
 * add_deleted_at_field.sql
 * 作成日: 2025-05-03
 * 概要: ユーザープロファイルテーブルに論理削除フィールドを追加
 * 目的: 論理削除機能の実装
 */

-- user_profilesテーブルにdeleted_atフィールドを追加
ALTER TABLE public.user_profiles
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- 削除済みステータスでの検索を高速化するインデックス
CREATE INDEX idx_user_profiles_deleted_at ON public.user_profiles(deleted_at);

-- 既存のポリシーを修正して、論理削除されていないユーザーのみ表示するように調整
DROP POLICY IF EXISTS "ユーザーは自分のプロファイルを参照可能" ON public.user_profiles;
CREATE POLICY "ユーザーは自分のプロファイルを参照可能" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id AND deleted_at IS NULL);

-- 管理者には論理削除されたユーザーも表示可能
DROP POLICY IF EXISTS "管理者はすべてのプロファイルにアクセス可能" ON public.user_profiles;
CREATE POLICY "管理者はすべてのプロファイルにアクセス可能" 
ON public.user_profiles FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 変更履歴の更新
COMMENT ON TABLE public.user_profiles IS 'ユーザー属性管理（論理削除機能を追加）';

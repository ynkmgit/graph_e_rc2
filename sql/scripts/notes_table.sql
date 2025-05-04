-- notes_table.sql
-- メモ機能のテーブル作成
-- 作成日: 2025-05-04

-- メモテーブル作成
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
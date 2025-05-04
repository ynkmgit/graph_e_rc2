-- tags_tables.sql
-- タグ機能のテーブル作成
-- 作成日: 2025-05-04

-- タグテーブル作成
CREATE TABLE public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#6B7280', -- デフォルトグレー（Tailwindのgray-500）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL, -- 論理削除用
  UNIQUE(user_id, name) -- 同一ユーザーの同名タグを防止
);

-- メモとタグの中間テーブル作成
CREATE TABLE public.note_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) NOT NULL,
  tag_id UUID REFERENCES public.tags(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(note_id, tag_id) -- 同一メモに同一タグを防止
);

-- インデックス
CREATE INDEX idx_tags_user_id ON public.tags(user_id);
CREATE INDEX idx_tags_name ON public.tags(name);
CREATE INDEX idx_tags_deleted_at ON public.tags(deleted_at);
CREATE INDEX idx_note_tags_note_id ON public.note_tags(note_id);
CREATE INDEX idx_note_tags_tag_id ON public.note_tags(tag_id);

-- Row Level Security ポリシー
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_tags ENABLE ROW LEVEL SECURITY;

-- タグテーブルのRLSポリシー

-- ユーザーは自分のタグのみ参照可能
CREATE POLICY "ユーザーは自分のタグを参照可能" 
ON public.tags FOR SELECT 
USING (auth.uid() = user_id AND deleted_at IS NULL);

-- ユーザーは自分のタグのみ作成可能
CREATE POLICY "ユーザーは自分のタグを作成可能" 
ON public.tags FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のタグのみ更新可能
CREATE POLICY "ユーザーは自分のタグを更新可能" 
ON public.tags FOR UPDATE 
USING (auth.uid() = user_id);

-- ユーザーは自分のタグのみ削除可能
CREATE POLICY "ユーザーは自分のタグを削除可能" 
ON public.tags FOR DELETE 
USING (auth.uid() = user_id);

-- メモタグ中間テーブルのRLSポリシー

-- ユーザーは自分のメモに関連するタグ情報を参照可能
CREATE POLICY "ユーザーは自分のメモのタグ情報を参照可能" 
ON public.note_tags FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_id
    AND notes.user_id = auth.uid()
    AND notes.deleted_at IS NULL
  )
);

-- 公開メモのタグ情報は誰でも参照可能
CREATE POLICY "公開メモのタグ情報は誰でも参照可能" 
ON public.note_tags FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_id
    AND notes.is_public = true
    AND notes.deleted_at IS NULL
  )
);

-- ユーザーは自分のメモにのみタグを追加可能
CREATE POLICY "ユーザーは自分のメモにタグを追加可能" 
ON public.note_tags FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_id
    AND notes.user_id = auth.uid()
  )
);

-- ユーザーは自分のメモからのみタグを削除可能
CREATE POLICY "ユーザーは自分のメモからタグを削除可能" 
ON public.note_tags FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_id
    AND notes.user_id = auth.uid()
  )
);

-- 管理者はすべてのタグにアクセス可能
CREATE POLICY "管理者はすべてのタグにアクセス可能" 
ON public.tags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 管理者はすべてのメモタグ関連にアクセス可能
CREATE POLICY "管理者はすべてのメモタグ関連にアクセス可能" 
ON public.note_tags FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- ロールバック用のコメント
-- DROP TABLE IF EXISTS public.note_tags;
-- DROP TABLE IF EXISTS public.tags;

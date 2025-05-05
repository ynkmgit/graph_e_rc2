/*
 * schema.sql
 * 最終更新日: 2025-05-05
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

-- タグテーブル
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

-- メモとタグの中間テーブル
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

-- メモ画像用のテーブル
CREATE TABLE public.note_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  note_id UUID REFERENCES public.notes(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL -- 論理削除用
);

-- インデックス
CREATE INDEX idx_note_images_note_id ON public.note_images(note_id);
CREATE INDEX idx_note_images_user_id ON public.note_images(user_id);
CREATE INDEX idx_note_images_deleted_at ON public.note_images(deleted_at);

-- Row Level Security ポリシー
ALTER TABLE public.note_images ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のメモの画像のみ参照可能
CREATE POLICY "ユーザーは自分のメモの画像を参照可能" 
ON public.note_images FOR SELECT 
USING (
  auth.uid() = user_id AND deleted_at IS NULL
);

-- 公開メモの画像は誰でも参照可能
CREATE POLICY "公開メモの画像は誰でも参照可能" 
ON public.note_images FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_id
    AND notes.is_public = true
    AND notes.deleted_at IS NULL
  )
);

-- ユーザーは自分のメモの画像のみ作成可能
CREATE POLICY "ユーザーは自分のメモの画像を作成可能" 
ON public.note_images FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.notes
    WHERE notes.id = note_id
    AND notes.user_id = auth.uid()
  )
);

-- ユーザーは自分のメモの画像のみ更新可能
CREATE POLICY "ユーザーは自分のメモの画像を更新可能" 
ON public.note_images FOR UPDATE 
USING (auth.uid() = user_id);

-- ユーザーは自分のメモの画像のみ削除可能
CREATE POLICY "ユーザーは自分のメモの画像を削除可能" 
ON public.note_images FOR DELETE 
USING (auth.uid() = user_id);

-- 管理者はすべてのメモの画像にアクセス可能
CREATE POLICY "管理者はすべてのメモの画像にアクセス可能" 
ON public.note_images FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);

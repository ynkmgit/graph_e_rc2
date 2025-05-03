-- ユーザープロフィールテーブルの拡張（修正版）
-- 実行日: 2023-05-03

-- ユーザーIDフィールドの追加（@から始まる一意のID）
ALTER TABLE public.user_profiles
ADD COLUMN username TEXT UNIQUE;

-- 自己紹介文の追加
ALTER TABLE public.user_profiles
ADD COLUMN bio TEXT;

-- アバター関連フィールドの追加
ALTER TABLE public.user_profiles
ADD COLUMN avatar_type TEXT NOT NULL DEFAULT 'sample',
ADD COLUMN selected_avatar_id TEXT;

-- オンラインステータス関連フィールドの追加
ALTER TABLE public.user_profiles
ADD COLUMN online_status TEXT NOT NULL DEFAULT 'offline',
ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE;

-- バリデーション用チェック制約の追加
ALTER TABLE public.user_profiles
ADD CONSTRAINT valid_username CHECK (username ~ '^[a-z0-9_]{3,20}$'),
ADD CONSTRAINT valid_avatar_type CHECK (avatar_type IN ('sample', 'custom'));

-- ユーザー名にインデックスを追加（検索を高速化）
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON public.user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_online_status ON public.user_profiles(online_status);

-- RLSポリシーの変更は不要（既存のポリシーがこれらの新しいフィールドにも適用される）

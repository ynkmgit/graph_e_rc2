-- user_profiles テーブルの username 制約を修正
-- 実行日: 2023-05-03

-- 既存の制約を削除
ALTER TABLE public.user_profiles
DROP CONSTRAINT IF EXISTS valid_username;

-- NULL値を許容する新しい制約を追加
ALTER TABLE public.user_profiles
ADD CONSTRAINT valid_username CHECK (
  username IS NULL OR username ~ '^[a-z0-9_]{3,20}$'
);

-- スキーマ修正のログを残す
COMMENT ON CONSTRAINT valid_username ON public.user_profiles IS 
'ユーザー名は3-20文字の小文字英数字とアンダースコアのみ許可。NULL値は許容。';

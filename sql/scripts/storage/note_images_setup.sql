-- note_images_setup.sql
-- メモの画像添付機能のためのストレージバケットとRLSポリシーの設定
-- 作成日: 2025-05-05

-- メモ画像用のテーブル作成
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

-- ストレージバケットの作成方法と権限設定についてのコメント
/*
このSQLを実行した後、Supabaseダッシュボードで以下の操作を行ってください：

1. ストレージ > 新しいバケットの作成
   - バケット名: noteimages （小文字のみ使用）
   - パブリックアクセス: 無効
   - アップロード保護: 有効

2. バケットのRLSポリシーを追加
   a. 画像の表示用ポリシー:
      - ポリシー名: ユーザーは自分がアップロードした画像を閲覧可能
      - ターゲット: バケット
      - オペレーション: SELECT
      - USING式: (bucket_id = 'noteimages' AND auth.uid() = owner) OR EXISTS (
        SELECT 1 FROM public.note_images 
        JOIN public.notes ON note_images.note_id = notes.id
        WHERE storage_path = pathnamespace || '/' || name
        AND notes.is_public = true
      )

   b. 画像のアップロード用ポリシー:
      - ポリシー名: ユーザーは画像をアップロード可能
      - ターゲット: バケット
      - オペレーション: INSERT
      - USING式: bucket_id = 'noteimages' AND auth.uid() IS NOT NULL

   c. 画像の削除用ポリシー:
      - ポリシー名: ユーザーは自分がアップロードした画像を削除可能
      - ターゲット: バケット
      - オペレーション: DELETE
      - USING式: bucket_id = 'noteimages' AND auth.uid() = owner

*/

-- ロールバック用のコメント
-- DROP TABLE IF EXISTS public.note_images;

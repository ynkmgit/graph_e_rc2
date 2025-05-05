-- note_images_rollback.sql
-- メモの画像添付機能のテーブルとRLSポリシーを削除
-- 作成日: 2025-05-05

-- 警告: このSQLスクリプトは既存のデータを完全に削除します。
-- 実行前に重要なデータがある場合はバックアップを取ってください。

-- まずはポリシーを削除
DROP POLICY IF EXISTS "ユーザーは自分のメモの画像を参照可能" ON public.note_images;
DROP POLICY IF EXISTS "公開メモの画像は誰でも参照可能" ON public.note_images;
DROP POLICY IF EXISTS "ユーザーは自分のメモの画像を作成可能" ON public.note_images;
DROP POLICY IF EXISTS "ユーザーは自分のメモの画像を更新可能" ON public.note_images;
DROP POLICY IF EXISTS "ユーザーは自分のメモの画像を削除可能" ON public.note_images;
DROP POLICY IF EXISTS "管理者はすべてのメモの画像にアクセス可能" ON public.note_images;

-- インデックスを削除
DROP INDEX IF EXISTS idx_note_images_note_id;
DROP INDEX IF EXISTS idx_note_images_user_id;
DROP INDEX IF EXISTS idx_note_images_deleted_at;

-- テーブルを削除
DROP TABLE IF EXISTS public.note_images;

-- ストレージバケットのクリーンアップ方法についてのコメント
/*
このSQLを実行した後、Supabaseダッシュボードで以下の操作を行ってください：

1. ストレージ > 'noteimages' バケットを選択
2. 「Empty bucket」を実行して、すべてのファイルを削除
3. 「Delete bucket」を実行して、バケットを削除

4. RLSポリシーがある場合は手動で削除
   - ポリシー「ユーザーは自分がアップロードした画像を閲覧可能」
   - ポリシー「ユーザーは画像をアップロード可能」
   - ポリシー「ユーザーは自分がアップロードした画像を削除可能」
*/

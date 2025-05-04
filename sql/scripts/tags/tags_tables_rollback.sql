-- tags_tables_rollback.sql
-- タグ機能のテーブル削除（ロールバック用）
-- 作成日: 2025-05-04

-- メモタグの中間テーブルを削除
DROP TABLE IF EXISTS public.note_tags;

-- タグテーブルを削除
DROP TABLE IF EXISTS public.tags;

-- コメント: このSQLはタグ機能に関するすべてのテーブルを削除します。
-- 実行する前に必ずバックアップを取ってください。

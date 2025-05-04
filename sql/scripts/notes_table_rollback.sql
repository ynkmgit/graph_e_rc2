-- notes_table_rollback.sql
-- メモ機能のテーブル削除（ロールバック用）
-- 作成日: 2025-05-04

-- トランザクション開始
BEGIN;

-- 各ポリシーを削除
DROP POLICY IF EXISTS "ユーザーは自分のメモを参照可能" ON public.notes;
DROP POLICY IF EXISTS "公開メモは誰でも参照可能" ON public.notes;
DROP POLICY IF EXISTS "ユーザーは自分のメモを作成可能" ON public.notes;
DROP POLICY IF EXISTS "ユーザーは自分のメモを更新可能" ON public.notes;
DROP POLICY IF EXISTS "ユーザーは自分のメモを削除可能" ON public.notes;
DROP POLICY IF EXISTS "管理者はすべてのメモにアクセス可能" ON public.notes;

-- インデックスも自動的に削除されるため明示的な削除は不要
-- テーブルを削除
DROP TABLE IF EXISTS public.notes;

-- トランザクション終了
COMMIT;

-- ロールバックしたい場合はCOMMITをROLLBACKに変更
/**
 * メモ関連の型定義
 */

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// メモ更新用フォーム入力の型
export interface NoteFormInput {
  title: string;
  content: string;
  is_public: boolean;
}

// メモリスト項目用の省略情報型
export interface NoteListItem {
  id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  updated_at: string;
}

// 検証関数
export function isValidTitle(title: string): boolean {
  return title.trim().length >= 1 && title.length <= 100;
}

export function isValidContent(content: string): boolean {
  return content.length <= 10000;
}

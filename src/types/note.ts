/**
 * メモ関連の型定義
 */
import { Tag } from './tag';

export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tags?: Tag[];  // タグ情報（オプショナル）
}

// メモ更新用フォーム入力の型
export interface NoteFormInput {
  title: string;
  content: string;
  is_public: boolean;
  tagIds?: string[];  // タグIDリスト（オプショナル）
}

// メモリスト項目用の省略情報型
export interface NoteListItem {
  id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  updated_at: string;
  tags?: Tag[];  // タグ情報（オプショナル）
}

// 検証関数
export function isValidTitle(title: string): boolean {
  return title.trim().length >= 1 && title.length <= 100;
}

export function isValidContent(content: string): boolean {
  return content.length <= 10000;
}

/**
 * タグ関連の型定義
 */

export interface Tag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface NoteTag {
  id: string;
  note_id: string;
  tag_id: string;
  created_at: string;
}

// タグ作成・更新用のフォーム入力型
export interface TagFormInput {
  name: string;
  color: string;
}

// 関連タグIDリスト
export interface NoteTagsInput {
  tagIds: string[];
}

// タグ選択用データ型
export interface TagOption {
  id: string;
  name: string;
  color: string;
}

// バリデーション関数
export function isValidTagName(name: string): boolean {
  return name.trim().length >= 1 && name.length <= 30;
}

// 利用可能なタグカラー（Tailwindの色に準拠）
export const TAG_COLORS = {
  gray: '#6B7280',
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#10B981',
  blue: '#3B82F6',
  indigo: '#6366F1',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

// カラー表示名
export const TAG_COLOR_NAMES: Record<string, string> = {
  '#6B7280': 'グレー',
  '#EF4444': 'レッド',
  '#F59E0B': 'イエロー',
  '#10B981': 'グリーン',
  '#3B82F6': 'ブルー',
  '#6366F1': 'インディゴ',
  '#8B5CF6': 'パープル',
  '#EC4899': 'ピンク',
};

// メモ型にタグ情報を追加（Note型の拡張）
export interface NoteWithTags {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  tags: Tag[];  // タグの配列を追加
}

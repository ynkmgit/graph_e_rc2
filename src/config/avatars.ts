/**
 * アバター設定ファイル
 * サンプルアバターのリストと関連する機能を定義
 */

// アバターのカテゴリ定義
export type AvatarCategory = 'abstract' | 'character' | 'professional' | 'simple';

// アバター情報の型定義
export interface AvatarInfo {
  id: string;         // アバターの一意の識別子
  name: string;       // 表示名
  category: AvatarCategory; // カテゴリ
  path: string;       // 画像のパス（public/avatarsからの相対パス）
  isPro: boolean;     // Proユーザー専用かどうか
}

// サンプルアバターのリスト
export const SAMPLE_AVATARS: AvatarInfo[] = [
  // シンプルカテゴリ
  {
    id: 'simple_1',
    name: 'ブルーサークル',
    category: 'simple',
    path: '/avatars/samples/simple_1.png',
    isPro: false,
  },
  {
    id: 'simple_2',
    name: 'レッドサークル',
    category: 'simple',
    path: '/avatars/samples/simple_2.png',
    isPro: false,
  },
  {
    id: 'simple_3',
    name: 'グリーンサークル',
    category: 'simple',
    path: '/avatars/samples/simple_3.png',
    isPro: false,
  },
  {
    id: 'simple_4',
    name: 'イエローサークル',
    category: 'simple',
    path: '/avatars/samples/simple_4.png',
    isPro: false,
  },

  // キャラクターカテゴリ
  {
    id: 'character_1',
    name: 'ネコ',
    category: 'character',
    path: '/avatars/samples/character_1.png',
    isPro: false,
  },
  {
    id: 'character_2',
    name: 'イヌ',
    category: 'character',
    path: '/avatars/samples/character_2.png',
    isPro: false,
  },
  {
    id: 'character_3',
    name: 'クマ',
    category: 'character',
    path: '/avatars/samples/character_3.png',
    isPro: false,
  },
  {
    id: 'character_4',
    name: 'ロボット',
    category: 'character',
    path: '/avatars/samples/character_4.png',
    isPro: true,
  },

  // 抽象的カテゴリ
  {
    id: 'abstract_1',
    name: '波紋',
    category: 'abstract',
    path: '/avatars/samples/abstract_1.png',
    isPro: false,
  },
  {
    id: 'abstract_2',
    name: '星雲',
    category: 'abstract',
    path: '/avatars/samples/abstract_2.png',
    isPro: false,
  },
  {
    id: 'abstract_3',
    name: '幾何学',
    category: 'abstract',
    path: '/avatars/samples/abstract_3.png',
    isPro: true,
  },
  {
    id: 'abstract_4',
    name: 'パターン',
    category: 'abstract',
    path: '/avatars/samples/abstract_4.png',
    isPro: true,
  },

  // 職業カテゴリ
  {
    id: 'professional_1',
    name: 'デベロッパー',
    category: 'professional',
    path: '/avatars/samples/professional_1.png',
    isPro: false,
  },
  {
    id: 'professional_2',
    name: 'アーティスト',
    category: 'professional',
    path: '/avatars/samples/professional_2.png',
    isPro: false,
  },
  {
    id: 'professional_3',
    name: '科学者',
    category: 'professional',
    path: '/avatars/samples/professional_3.png',
    isPro: true,
  },
  {
    id: 'professional_4',
    name: 'ビジネスパーソン',
    category: 'professional',
    path: '/avatars/samples/professional_4.png',
    isPro: true,
  },
];

// デフォルトのアバターID
export const DEFAULT_AVATAR_ID = 'simple_1';

// アバターIDから情報を取得する関数
export function getAvatarById(id: string): AvatarInfo | undefined {
  return SAMPLE_AVATARS.find(avatar => avatar.id === id);
}

// デフォルトのアバター情報を取得する関数
export function getDefaultAvatar(): AvatarInfo {
  return getAvatarById(DEFAULT_AVATAR_ID) || SAMPLE_AVATARS[0];
}

// カテゴリ別にアバターを取得する関数
export function getAvatarsByCategory(category: AvatarCategory): AvatarInfo[] {
  return SAMPLE_AVATARS.filter(avatar => avatar.category === category);
}

// Proユーザー向けのアバターを含めてフィルタリングする関数
export function filterAvatarsByProAccess(avatars: AvatarInfo[], isPro: boolean): AvatarInfo[] {
  if (isPro) {
    return avatars; // Proユーザーはすべてのアバターにアクセス可能
  }
  return avatars.filter(avatar => !avatar.isPro);
}

// カスタムアバターのパスを生成する関数
export function getCustomAvatarPath(userId: string, filename: string): string {
  return `${userId}/${filename}`;
}

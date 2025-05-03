/**
 * プロフィール関連の型定義
 */

export interface UserProfile {
  id: string;                        // ユーザーID (Supabase Auth UUID)
  display_name: string | null;       // 表示名
  username: string | null;           // @から始まるユニークなユーザーID (ユーザー名)
  bio: string | null;                // 自己紹介文
  avatar_url: string | null;         // アバターURL (Supabaseストレージのパス)
  avatar_type: 'sample' | 'custom';  // アバタータイプ
  selected_avatar_id: string | null; // 選択したサンプルアバターID
  role: 'admin' | 'developer' | 'free_user' | 'pro_user'; // ユーザーロール
  plan_type: 'free' | 'pro' | 'enterprise';               // プランタイプ
  online_status: 'online' | 'offline' | 'busy';           // オンラインステータス
  last_active_at: string | null;     // 最終アクティブ時間 (ISO文字列)
  plan_expires_at: string | null;    // プラン有効期限 (ISO文字列)
  created_at: string;                // 作成日時 (ISO文字列)
  updated_at: string;                // 更新日時 (ISO文字列)
}

// プロフィール更新用フォーム入力の型
export interface ProfileFormInput {
  display_name: string;
  username: string;
  bio: string;
  avatar_type: 'sample' | 'custom';
  selected_avatar_id: string | null;
  online_status: 'online' | 'offline' | 'busy';
}

// プロフィールカード表示用
export interface ProfileCardProps {
  profile: UserProfile;
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  showUsername?: boolean;
  onClick?: () => void;
}

// ユーザー名の形式検証関数
export function isValidUsername(username: string): boolean {
  // 3-20文字のアルファベット小文字、数字、アンダースコアのみ
  const usernameRegex = /^[a-z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

// 表示名の形式検証関数
export function isValidDisplayName(displayName: string): boolean {
  // 1-30文字
  return displayName.trim().length >= 1 && displayName.length <= 30;
}

// 自己紹介文の形式検証関数
export function isValidBio(bio: string): boolean {
  // 200文字以内
  return bio.length <= 200;
}

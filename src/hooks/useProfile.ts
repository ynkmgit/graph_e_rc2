'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { UserProfile, ProfileFormInput } from '@/types/profile';
import { DEFAULT_AVATAR_ID } from '@/config/avatars';

interface UseProfileResult {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (data: Partial<ProfileFormInput>) => Promise<{ success: boolean; error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ success: boolean; error: string | null }>;
}

export const useProfile = (): UseProfileResult => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // プロフィール情報を取得
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data as UserProfile);
        
        // オンラインステータスを更新
        await supabase
          .from('user_profiles')
          .update({ 
            online_status: 'online',
            last_active_at: new Date().toISOString()
          })
          .eq('id', user.id);
      } catch (err: any) {
        console.error('プロフィール取得エラー:', err);
        setError(err.message || 'プロフィール情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // クリーンアップ: ページ離脱時にオフラインステータスに更新
    return () => {
      if (user) {
        supabase
          .from('user_profiles')
          .update({ 
            online_status: 'offline',
            last_active_at: new Date().toISOString()
          })
          .eq('id', user.id)
          .then(() => {
            console.log('オフラインステータスに更新しました');
          })
          .catch((err) => {
            console.error('ステータス更新エラー:', err);
          });
      }
    };
  }, [user]);

  // プロフィール情報を更新
  const updateProfile = async (data: Partial<ProfileFormInput>) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      // ユーザー名が空の場合はNULLとして送信
      const username = data.username && data.username.trim() !== '' 
                       ? data.username 
                       : null;
      
      const { error } = await supabase
        .from('user_profiles')
        .update({
          display_name: data.display_name,
          username: username,
          bio: data.bio && data.bio.trim() !== '' ? data.bio : null,
          avatar_type: data.avatar_type,
          selected_avatar_id: data.selected_avatar_id || DEFAULT_AVATAR_ID,
          online_status: data.online_status,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // 成功したら状態を更新
      setProfile(prev => prev ? { 
        ...prev, 
        display_name: data.display_name,
        username: username,
        bio: data.bio && data.bio.trim() !== '' ? data.bio : null,
        avatar_type: data.avatar_type,
        selected_avatar_id: data.selected_avatar_id || DEFAULT_AVATAR_ID,
        online_status: data.online_status,
      } as UserProfile : null);
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('プロフィール更新エラー:', err);
      
      // ユーザー名の一意性エラーを判定
      if (err.message?.includes('duplicate key value') && err.message?.includes('username')) {
        return { success: false, error: 'このユーザー名は既に使用されています' };
      }
      
      return { success: false, error: err.message || 'プロフィールの更新に失敗しました' };
    }
  };

  // アバター画像をアップロード（有料ユーザー用）
  const uploadAvatar = async (file: File) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      // ファイルのMIMEタイプを確認
      if (!file.type.startsWith('image/')) {
        return { success: false, error: '画像ファイルのみアップロード可能です' };
      }

      // 画像のサイズを確認 (2MB制限)
      if (file.size > 2 * 1024 * 1024) {
        return { success: false, error: '画像サイズは2MB以下にしてください' };
      }

      // ファイル名をランダム化して拡張子を維持
      const extension = file.name.split('.').pop();
      const fileName = `${Date.now()}.${extension}`;
      const filePath = `${user.id}/${fileName}`;

      // Supabaseストレージにアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // アップロードしたファイルの公開URLを取得
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // プロフィール情報を更新
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_type: 'custom',
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 成功したら状態を更新
      setProfile(prev => prev 
        ? { 
            ...prev, 
            avatar_type: 'custom', 
            avatar_url: urlData.publicUrl 
          } as UserProfile 
        : null
      );

      return { success: true, error: null };
    } catch (err: any) {
      console.error('アバターアップロードエラー:', err);
      return { success: false, error: err.message || 'アバターのアップロードに失敗しました' };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar
  };
};

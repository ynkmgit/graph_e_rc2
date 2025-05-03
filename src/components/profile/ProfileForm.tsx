'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import AvatarSelector from './AvatarSelector';
import { getAvatarById, getDefaultAvatar } from '@/config/avatars';
import { isValidUsername, isValidDisplayName, isValidBio, ProfileFormInput } from '@/types/profile';
import Image from 'next/image';

export default function ProfileForm() {
  const router = useRouter();
  const { profile, loading, error, updateProfile, uploadAvatar } = useProfile();
  const { isPro } = useUserRole();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // フォーム入力値
  const [formData, setFormData] = useState<ProfileFormInput>({
    display_name: '',
    username: '',
    bio: '',
    avatar_type: 'sample',
    selected_avatar_id: null,
    online_status: 'online'
  });
  
  // バリデーションエラー
  const [errors, setErrors] = useState({
    display_name: '',
    username: '',
    bio: ''
  });
  
  // ファイルアップロード用
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // プロフィールデータをフォームに設定
  useEffect(() => {
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        username: profile.username || '',
        bio: profile.bio || '',
        avatar_type: profile.avatar_type || 'sample',
        selected_avatar_id: profile.selected_avatar_id,
        online_status: profile.online_status || 'online'
      });
    }
  }, [profile]);

  // ファイル選択時のプレビュー生成
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // クリーンアップ
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // 入力フィールド変更ハンドラ
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 入力時のバリデーションエラークリア
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // ファイル選択ハンドラ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFormData(prev => ({ ...prev, avatar_type: 'custom' }));
    }
  };

  // サンプルアバター選択ハンドラ
  const handleAvatarSelect = (id: string) => {
    setFormData(prev => ({ 
      ...prev, 
      avatar_type: 'sample',
      selected_avatar_id: id
    }));
    setSelectedFile(null);
  };

  // フォーム送信前のバリデーション
  const validateForm = (): boolean => {
    const newErrors = {
      display_name: '',
      username: '',
      bio: ''
    };
    
    // 表示名のバリデーション
    if (!formData.display_name.trim()) {
      newErrors.display_name = '表示名は必須です';
    } else if (!isValidDisplayName(formData.display_name)) {
      newErrors.display_name = '表示名は1〜30文字で入力してください';
    }
    
    // ユーザー名のバリデーション
    if (formData.username.trim() && !isValidUsername(formData.username)) {
      newErrors.username = 'ユーザー名は小文字英数字とアンダースコアのみ、3〜20文字で入力してください';
    }
    
    // 自己紹介のバリデーション
    if (formData.bio && !isValidBio(formData.bio)) {
      newErrors.bio = '自己紹介は200文字以内で入力してください';
    }
    
    setErrors(newErrors);
    
    // エラーがあるかチェック
    return !Object.values(newErrors).some(error => error !== '');
  };

  // フォーム送信ハンドラ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // カスタムアバターをアップロード（有料ユーザーのみ）
      if (formData.avatar_type === 'custom' && selectedFile && isPro) {
        const { success, error } = await uploadAvatar(selectedFile);
        if (!success) {
          throw new Error(error || 'アバターのアップロードに失敗しました');
        }
      }
      
      // プロフィール情報を更新
      const { success, error } = await updateProfile(formData);
      if (!success) {
        throw new Error(error || 'プロフィールの更新に失敗しました');
      }
      
      setMessage({ type: 'success', text: 'プロフィールを更新しました' });
      
      // 3秒後にメッセージをクリア
      setTimeout(() => {
        setMessage(null);
        // トップページにリダイレクト
        router.push('/');
      }, 2000);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  // プロフィール画像のソースを決定
  const currentAvatarSrc = () => {
    if (previewUrl) {
      return previewUrl;
    }
    
    if (profile?.avatar_type === 'custom' && profile.avatar_url) {
      return profile.avatar_url;
    }
    
    const avatarId = formData.selected_avatar_id || profile?.selected_avatar_id;
    if (avatarId) {
      const avatarInfo = getAvatarById(avatarId);
      if (avatarInfo) {
        return avatarInfo.path;
      }
    }
    
    return getDefaultAvatar().path;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* メッセージ表示 */}
      {message && (
        <div className={`p-4 mb-4 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700' 
            : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* 左側: アバター選択 */}
        <div className="md:col-span-1 space-y-4">
          <div className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-3">
              <Image
                src={currentAvatarSrc()}
                alt="プロフィール画像"
                fill
                className="rounded-full object-cover"
              />
            </div>
            
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {formData.display_name || '名称未設定'}
            </p>
            
            {formData.username && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                @{formData.username}
              </p>
            )}
          </div>
          
          {/* カスタムアバターアップロード (Proユーザーのみ) */}
          {isPro && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                カスタムアバター
              </label>
              <div className="flex items-center justify-center">
                <label className="cursor-pointer bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-2 rounded-md text-sm font-medium dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:text-indigo-200">
                  <span>画像をアップロード</span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                JPG, PNG, GIF (最大 2MB)
              </p>
            </div>
          )}
        </div>
        
        {/* 右側: フォーム */}
        <div className="md:col-span-2 space-y-4">
          {/* 表示名 */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              表示名 <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.display_name ? 'border-red-300' : ''
              }`}
              maxLength={30}
              required
            />
            {errors.display_name && (
              <p className="mt-1 text-sm text-red-600">{errors.display_name}</p>
            )}
          </div>
          
          {/* ユーザー名 */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              ユーザー名 (任意)
            </label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                @
              </span>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.username ? 'border-red-300' : ''
                }`}
                placeholder="username"
                maxLength={20}
              />
            </div>
            {errors.username ? (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                小文字英数字とアンダースコアのみ、3〜20文字
              </p>
            )}
          </div>
          
          {/* 自己紹介 */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              自己紹介 (任意)
            </label>
            <textarea
              id="bio"
              name="bio"
              rows={3}
              value={formData.bio}
              onChange={handleChange}
              className={`mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.bio ? 'border-red-300' : ''
              }`}
              placeholder="あなた自身について簡単に説明してください"
              maxLength={200}
            />
            {errors.bio ? (
              <p className="mt-1 text-sm text-red-600">{errors.bio}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                最大200文字
              </p>
            )}
          </div>
          
          {/* オンラインステータス */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              オンラインステータス
            </label>
            <div className="mt-2 flex space-x-3">
              {['online', 'busy', 'offline'].map((status) => (
                <label key={status} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="online_status"
                    value={status}
                    checked={formData.online_status === status}
                    onChange={() => setFormData(prev => ({ ...prev, online_status: status as any }))}
                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {status === 'online' ? 'オンライン' : status === 'busy' ? '取り込み中' : 'オフライン'}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* サンプルアバター選択 */}
      <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
        <AvatarSelector
          selectedId={formData.selected_avatar_id || getDefaultAvatar().id}
          onSelect={handleAvatarSelect}
        />
      </div>
      
      {/* 送信ボタン */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isSubmitting ? 'opacity-75 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? '保存中...' : '変更を保存'}
        </button>
      </div>
    </form>
  );
}

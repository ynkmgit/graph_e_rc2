'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { UserProfile, ProfileCardProps } from '@/types/profile';
import { getAvatarById, getDefaultAvatar } from '@/config/avatars';

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  busy: 'bg-yellow-500'
};

const statusTooltips = {
  online: 'オンライン',
  offline: 'オフライン',
  busy: '取り込み中'
};

const sizeClasses = {
  sm: {
    container: 'flex items-center space-x-2',
    avatar: 'w-8 h-8',
    text: 'text-sm'
  },
  md: {
    container: 'flex items-center space-x-3',
    avatar: 'w-10 h-10',
    text: 'text-base'
  },
  lg: {
    container: 'flex items-center space-x-4',
    avatar: 'w-16 h-16',
    text: 'text-lg'
  }
};

export default function ProfileCard({
  profile,
  size = 'md',
  showStatus = true,
  showUsername = false,
  onClick
}: ProfileCardProps) {
  // プロフィール画像のソースを決定
  const avatarSrc = useMemo(() => {
    if (profile.avatar_type === 'custom' && profile.avatar_url) {
      return profile.avatar_url;
    }
    
    // サンプルアバター
    if (profile.selected_avatar_id) {
      const avatarInfo = getAvatarById(profile.selected_avatar_id);
      if (avatarInfo) {
        return avatarInfo.path;
      }
    }
    
    // デフォルトアバター
    return getDefaultAvatar().path;
  }, [profile]);

  // 表示名を決定
  const displayName = profile.display_name || '名称未設定';

  // ステータスの色を決定
  const statusColor = statusColors[profile.online_status || 'offline'];
  const statusTitle = statusTooltips[profile.online_status || 'offline'];

  // サイズによるスタイル
  const classes = sizeClasses[size];

  return (
    <div 
      className={`${classes.container} ${onClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-colors' : ''}`}
      onClick={onClick}
    >
      <div className="relative">
        <Image
          src={avatarSrc}
          alt={displayName}
          width={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          height={size === 'lg' ? 64 : size === 'md' ? 40 : 32}
          className={`${classes.avatar} rounded-full object-cover`}
        />
        
        {showStatus && (
          <span 
            className={`absolute bottom-0 right-0 w-3 h-3 ${statusColor} rounded-full border-2 border-white dark:border-gray-800`}
            title={statusTitle}
          />
        )}
      </div>
      
      <div>
        <p className={`${classes.text} font-medium text-gray-900 dark:text-white`}>
          {displayName}
        </p>
        
        {showUsername && profile.username && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            @{profile.username}
          </p>
        )}
      </div>
    </div>
  );
}

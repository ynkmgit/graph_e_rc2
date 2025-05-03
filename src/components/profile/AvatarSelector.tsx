'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useUserRole } from '@/hooks/useUserRole';
import { 
  SAMPLE_AVATARS, 
  getAvatarById, 
  getDefaultAvatar,
  filterAvatarsByProAccess,
  AvatarCategory
} from '@/config/avatars';

interface AvatarSelectorProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export default function AvatarSelector({ selectedId, onSelect }: AvatarSelectorProps) {
  const { isPro } = useUserRole();
  const [selectedCategory, setSelectedCategory] = useState<AvatarCategory | 'all'>('all');
  
  // 選択されたアバター情報
  const selectedAvatar = useMemo(() => {
    return selectedId ? getAvatarById(selectedId) : getDefaultAvatar();
  }, [selectedId]);

  // カテゴリ別アバターのフィルタリング
  const filteredAvatars = useMemo(() => {
    let avatars = SAMPLE_AVATARS;
    
    // カテゴリでフィルタリング
    if (selectedCategory !== 'all') {
      avatars = avatars.filter(avatar => avatar.category === selectedCategory);
    }
    
    // Pro限定アバターのフィルタリング
    return filterAvatarsByProAccess(avatars, isPro);
  }, [selectedCategory, isPro]);

  // カテゴリ選択ボタン
  const CategoryButton = ({ category, label }: { category: AvatarCategory | 'all', label: string }) => (
    <button
      className={`px-3 py-1 rounded-full text-sm font-medium ${
        selectedCategory === category
          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
      }`}
      onClick={() => setSelectedCategory(category)}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">アバターを選択</h3>
        {isPro ? (
          <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-indigo-900 dark:text-indigo-300">
            Proユーザー
          </span>
        ) : (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Proにアップグレードで追加アバター解放
          </span>
        )}
      </div>

      {/* カテゴリフィルター */}
      <div className="flex flex-wrap gap-2">
        <CategoryButton category="all" label="すべて" />
        <CategoryButton category="simple" label="シンプル" />
        <CategoryButton category="character" label="キャラクター" />
        <CategoryButton category="abstract" label="抽象" />
        <CategoryButton category="professional" label="職業" />
      </div>

      {/* アバターグリッド */}
      <div className="grid grid-cols-4 gap-3 md:grid-cols-6 lg:grid-cols-8">
        {filteredAvatars.map((avatar) => (
          <div
            key={avatar.id}
            className={`relative cursor-pointer rounded-lg p-1 transition-colors ${
              selectedAvatar?.id === avatar.id
                ? 'bg-indigo-100 ring-2 ring-indigo-500 dark:bg-indigo-900 dark:ring-indigo-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
            onClick={() => onSelect(avatar.id)}
            title={avatar.name}
          >
            <Image
              src={avatar.path}
              alt={avatar.name}
              width={64}
              height={64}
              className="rounded-full mx-auto"
            />
            
            {/* Proバッジ */}
            {avatar.isPro && (
              <span className="absolute top-0 right-0 bg-indigo-500 text-white text-xs px-1 rounded-sm">
                Pro
              </span>
            )}
            
            {/* 選択チェック */}
            {selectedAvatar?.id === avatar.id && (
              <span className="absolute bottom-0 right-0 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center">
                ✓
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Tag, TAG_COLORS, TAG_COLOR_NAMES, isValidTagName } from '@/types/tag';
import TagBadge from './TagBadge';

interface TagSelectorProps {
  availableTags: Tag[];
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  onCreateTag?: (name: string, color: string) => Promise<Tag | null>;
  className?: string;
}

export default function TagSelector({
  availableTags,
  selectedTagIds,
  onChange,
  onCreateTag,
  className = '',
}: TagSelectorProps) {
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS.gray);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // 選択中のタグと利用可能なタグを分離
  const selectedTags = availableTags.filter(tag => selectedTagIds.includes(tag.id));
  const unselectedTags = availableTags.filter(tag => !selectedTagIds.includes(tag.id));

  // タグの選択・解除
  const toggleTag = (tagId: string) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  // 新しいタグの作成
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setError('タグ名を入力してください');
      return;
    }

    if (!isValidTagName(newTagName)) {
      setError('タグ名は1〜30文字で入力してください');
      return;
    }

    if (availableTags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      setError('同じ名前のタグが既に存在します');
      return;
    }

    if (!onCreateTag) return;

    setIsCreating(true);
    setError(null);

    try {
      const newTag = await onCreateTag(newTagName, newTagColor);
      if (newTag) {
        // 新しいタグを選択状態に追加
        onChange([...selectedTagIds, newTag.id]);
        setNewTagName('');
        setNewTagColor(TAG_COLORS.gray);
      }
    } catch (err: any) {
      setError(err.message || 'タグの作成に失敗しました');
    } finally {
      setIsCreating(false);
      setShowColorPicker(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 選択中のタグ */}
      <div className="flex flex-wrap gap-2">
        {selectedTags.length > 0 ? (
          selectedTags.map(tag => (
            <TagBadge
              key={tag.id}
              tag={tag}
              onClick={() => toggleTag(tag.id)}
              showDelete
              onDelete={() => toggleTag(tag.id)}
            />
          ))
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            タグが選択されていません
          </span>
        )}
      </div>

      {/* 新しいタグ作成フォーム */}
      {onCreateTag && (
        <div className="mt-2">
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="新しいタグを作成..."
                className="w-full text-sm rounded-md border border-gray-300 dark:border-gray-600 px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-gray-700 dark:text-white"
                disabled={isCreating}
              />
              
              {/* カラーピッカーボタン */}
              <button
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
                aria-label="タグの色を選択"
              >
                <div
                  className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-500"
                  style={{ backgroundColor: newTagColor }}
                ></div>
              </button>
            </div>
            
            <button
              type="button"
              onClick={handleCreateTag}
              disabled={isCreating || !newTagName.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating ? '作成中...' : '追加'}
            </button>
          </div>
          
          {/* カラーピッカー */}
          {showColorPicker && (
            <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm flex flex-wrap gap-2">
              {Object.entries(TAG_COLORS).map(([name, color]) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    setNewTagColor(color);
                    setShowColorPicker(false);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    newTagColor === color
                      ? 'border-black dark:border-white'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: color }}
                  title={TAG_COLOR_NAMES[color] || name}
                >
                  {newTagColor === color && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={color === TAG_COLORS.gray ? '#FFFFFF' : '#FFFFFF'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
          
          {/* エラーメッセージ */}
          {error && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
        </div>
      )}

      {/* 利用可能なタグ */}
      {unselectedTags.length > 0 && (
        <div className="mt-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            利用可能なタグ:
          </p>
          <div className="flex flex-wrap gap-2">
            {unselectedTags.map(tag => (
              <TagBadge
                key={tag.id}
                tag={tag}
                onClick={() => toggleTag(tag.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

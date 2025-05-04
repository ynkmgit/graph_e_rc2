'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useTags } from '@/hooks/useTags';
import TagBadge from '@/components/tags/TagBadge';
import { TAG_COLORS, isValidTagName } from '@/types/tag';

export default function TagsManagementPage() {
  const router = useRouter();
  const { tags, loading, error, createTag, deleteTag, fetchNotesByTagId } = useTags();
  
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS.gray);
  const [isCreating, setIsCreating] = useState(false);
  const [tagError, setTagError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 新しいタグの作成
  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      setTagError('タグ名を入力してください');
      return;
    }

    if (!isValidTagName(newTagName)) {
      setTagError('タグ名は1〜30文字で入力してください');
      return;
    }

    if (tags.some(tag => tag.name.toLowerCase() === newTagName.toLowerCase())) {
      setTagError('同じ名前のタグが既に存在します');
      return;
    }

    setIsCreating(true);
    setTagError(null);

    try {
      const newTag = await createTag({
        name: newTagName,
        color: newTagColor
      });
      
      if (newTag) {
        setNewTagName('');
        setNewTagColor(TAG_COLORS.gray);
        setShowColorPicker(false);
      }
    } catch (err: any) {
      setTagError(err.message || 'タグの作成に失敗しました');
    } finally {
      setIsCreating(false);
    }
  };

  // タグの削除
  const handleDeleteTag = async (id: string) => {
    if (!confirm('このタグを削除してもよろしいですか？\n(メモからタグが削除されますが、メモ自体は削除されません)')) return;
    
    setDeletingId(id);
    try {
      const { success, error } = await deleteTag(id);
      if (!success) {
        alert(`削除に失敗しました: ${error}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // タグをクリックしたときの処理
  const handleTagClick = (tagId: string) => {
    router.push(`/notes/tags/${tagId}`);
  };

  return (
    <ProtectedRoute>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">タグ管理</h1>
          <Button
            onClick={() => router.push('/notes')}
            variant="outline"
          >
            メモ一覧に戻る
          </Button>
        </div>

        {(error || tagError) && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 mb-6">
            {error || tagError}
          </div>
        )}

        {/* 新しいタグ作成フォーム */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-lg font-semibold mb-4">新しいタグを作成</h2>
          <div className="flex space-x-2">
            <div className="relative flex-grow">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="新しいタグ名を入力..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-400"
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
                  className="w-6 h-6 rounded-full border border-gray-300 dark:border-gray-500"
                  style={{ backgroundColor: newTagColor }}
                ></div>
              </button>
            </div>
            
            <Button
              onClick={handleCreateTag}
              disabled={isCreating || !newTagName.trim()}
              variant="primary"
            >
              {isCreating ? '作成中...' : '作成する'}
            </Button>
          </div>
          
          {/* カラーピッカー */}
          {showColorPicker && (
            <div className="mt-4 p-3 bg-white dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm">
              <div className="flex flex-wrap gap-3">
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
                    title={name}
                  >
                    {newTagColor === color && (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={color === TAG_COLORS.gray ? '#FFFFFF' : '#000000'}
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
            </div>
          )}
        </div>

        {/* タグ一覧 */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold mb-4">タグ一覧</h2>
          
          {loading ? (
            <div className="flex justify-center my-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
            </div>
          ) : tags.length === 0 ? (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 text-center">
              <p className="text-gray-600 dark:text-gray-300">タグがありません</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tags.map(tag => (
                <div
                  key={tag.id}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <TagBadge
                    tag={tag}
                    onClick={() => handleTagClick(tag.id)}
                    className="cursor-pointer mr-2"
                  />
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => handleTagClick(tag.id)}
                      variant="outline"
                      size="sm"
                    >
                      表示
                    </Button>
                    <Button
                      onClick={() => handleDeleteTag(tag.id)}
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === tag.id}
                    >
                      {deletingId === tag.id ? '削除中...' : '削除'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Container>
    </ProtectedRoute>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import NoteCard from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { useTags } from '@/hooks/useTags';
import TagBadge from '@/components/tags/TagBadge';

export default function NotesPage() {
  const router = useRouter();
  const { notes, loading, error, deleteNote } = useNotes();
  const { tags, loading: tagsLoading } = useTags();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // 選択されたタグで絞り込まれたメモ
  const filteredNotes = activeTag
    ? notes.filter(note => note.tags?.some(tag => tag.id === activeTag))
    : notes;

  const handleDelete = async (id: string) => {
    if (!confirm('このメモを削除してもよろしいですか？')) return;
    
    setDeletingId(id);
    try {
      const { success, error } = await deleteNote(id);
      if (!success) {
        alert(`削除に失敗しました: ${error}`);
      }
    } finally {
      setDeletingId(null);
    }
  };

  // タグをクリックしたときの処理
  const handleTagClick = (tagId: string) => {
    if (activeTag === tagId) {
      // 同じタグをもう一度クリックした場合はフィルタを解除
      setActiveTag(null);
    } else {
      // タグでフィルタリング
      setActiveTag(tagId);
    }
  };

  return (
    <ProtectedRoute>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">メモ一覧</h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push('/tags')}
              variant="outline"
            >
              タグ管理
            </Button>
            <Button
              onClick={() => router.push('/notes/new')}
              variant="primary"
            >
              新規メモ作成
            </Button>
          </div>
        </div>

        {/* タグフィルター */}
        {!tagsLoading && tags.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              タグでフィルタリング:
            </h2>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <TagBadge
                  key={tag.id}
                  tag={tag}
                  onClick={() => handleTagClick(tag.id)}
                  className={`cursor-pointer ${activeTag === tag.id ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-indigo-400' : ''}`}
                />
              ))}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 ml-2 underline"
                >
                  フィルターをクリア
                </button>
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            {activeTag ? (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-4">選択したタグのメモがありません</p>
                <Button
                  onClick={() => setActiveTag(null)}
                  variant="outline"
                  className="mr-2"
                >
                  フィルターをクリア
                </Button>
                <Button
                  onClick={() => router.push('/notes/new')}
                  variant="primary"
                >
                  新規メモを作成
                </Button>
              </>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-4">メモがありません</p>
                <Button
                  onClick={() => router.push('/notes/new')}
                  variant="primary"
                >
                  最初のメモを作成する
                </Button>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                onDelete={handleDelete}
                isDeleting={deletingId === note.id}
              />
            ))}
          </div>
        )}
      </Container>
    </ProtectedRoute>
  );
}

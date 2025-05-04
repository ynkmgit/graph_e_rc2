'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import NoteCard from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { useTags } from '@/hooks/useTags';
import { Tag } from '@/types/tag';

// Cloudflare Pages用のEdge Runtime設定
export const runtime = 'edge';

export default function NotesByTagPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { notes, loading, error, fetchNotesByTagId, deleteNote } = useNotes();
  const { tags, loading: tagsLoading } = useTags();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentTag, setCurrentTag] = useState<Tag | null>(null);

  // タグIDに基づいてメモを取得
  useEffect(() => {
    fetchNotesByTagId(params.id);
    
    // タグ情報を設定
    if (tags.length > 0) {
      const tag = tags.find(t => t.id === params.id);
      if (tag) setCurrentTag(tag);
    }
  }, [params.id, tags]);

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

  return (
    <ProtectedRoute>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">タグ:</h1>
            {currentTag && (
              <div 
                className="px-3 py-1 rounded-full text-md"
                style={{ 
                  backgroundColor: currentTag.color,
                  color: currentTag.color === '#6B7280' ? 'white' : 'black'
                }}
              >
                {currentTag.name}
              </div>
            )}
            {!currentTag && !tagsLoading && <span className="text-xl">（不明なタグ）</span>}
          </div>
          <Button
            onClick={() => router.push('/notes')}
            variant="outline"
          >
            メモ一覧に戻る
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">このタグが付いたメモはありません</p>
            <Button
              onClick={() => router.push('/notes/new')}
              variant="primary"
            >
              新しいメモを作成する
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
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

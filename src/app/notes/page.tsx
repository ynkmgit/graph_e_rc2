'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import NoteCard from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';

export default function NotesPage() {
  const router = useRouter();
  const { notes, loading, error, deleteNote } = useNotes();
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
          <h1 className="text-2xl font-bold">メモ一覧</h1>
          <Button
            onClick={() => router.push('/notes/new')}
            variant="primary"
          >
            新規メモ作成
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
            <p className="text-gray-600 dark:text-gray-300 mb-4">メモがありません</p>
            <Button
              onClick={() => router.push('/notes/new')}
              variant="primary"
            >
              最初のメモを作成する
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

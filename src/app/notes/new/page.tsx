'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import NoteForm from '@/components/notes/NoteForm';
import { useNotes } from '@/hooks/useNotes';
import { NoteFormInput } from '@/types/note';

export default function NewNotePage() {
  const router = useRouter();
  const { createNote } = useNotes();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 初期データ
  const initialData = {
    title: '',
    content: '',
    is_public: false
  };

  const handleSubmit = async (data: NoteFormInput) => {
    setLoading(true);
    setError(null);
    
    try {
      const { success, error, data: newNote } = await createNote(data);
      
      if (success && newNote) {
        // 作成成功したらメモ一覧に戻る
        router.push('/notes');
      } else {
        setError(error || 'メモの作成に失敗しました');
      }
    } catch (err: any) {
      setError(err.message || 'メモの作成中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">新規メモ作成</h1>
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

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <NoteForm 
            initialData={initialData}
            onSubmit={handleSubmit}
            loading={loading}
            mode="create"
          />
        </div>
      </Container>
    </ProtectedRoute>
  );
}

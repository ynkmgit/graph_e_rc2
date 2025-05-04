'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import NoteForm from '@/components/notes/NoteForm';
import { useNotes } from '@/hooks/useNotes';
import { NoteFormInput } from '@/types/note';
import { useAuth } from '@/components/auth/AuthProvider';

export default function EditNotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { note, loading: noteLoading, error: noteError, updateNote } = useNotes(params.id);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // 権限チェック
  useEffect(() => {
    if (note && user && note.user_id !== user.id) {
      setUnauthorized(true);
    }
  }, [note, user]);

  // 初期データ
  const initialData = {
    title: note?.title || '',
    content: note?.content || '',
    is_public: note?.is_public || false,
    tagIds: note?.tags?.map(tag => tag.id) || []
  };

  const handleSubmit = async (data: NoteFormInput) => {
    if (!note) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const { success, error } = await updateNote(params.id, data);
      
      if (success) {
        // 更新成功したらメモ詳細に戻る
        router.push(`/notes/${params.id}`);
      } else {
        setError(error || 'メモの更新に失敗しました');
      }
    } catch (err: any) {
      setError(err.message || 'メモの更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">メモ編集</h1>
          <Button
            onClick={() => router.push(`/notes/${params.id}`)}
            variant="outline"
          >
            メモ詳細に戻る
          </Button>
        </div>

        {(error || noteError) && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 mb-6">
            {error || noteError}
          </div>
        )}

        {unauthorized && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 mb-6">
            このメモを編集する権限がありません。
          </div>
        )}

        {noteLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : !note ? (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-300">メモが見つかりませんでした。</p>
          </div>
        ) : unauthorized ? (
          <div className="bg-red-50 dark:bg-red-900/30 p-6 rounded-lg">
            <p className="text-red-700 dark:text-red-300">このメモを編集する権限がありません。</p>
            <Button 
              onClick={() => router.push('/notes')}
              variant="outline"
              className="mt-4"
            >
              メモ一覧に戻る
            </Button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <NoteForm 
              initialData={initialData}
              onSubmit={handleSubmit}
              loading={loading}
              mode="edit"
              noteId={params.id}
            />
          </div>
        )}
      </Container>
    </ProtectedRoute>
  );
}

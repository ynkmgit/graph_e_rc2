'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { useNotes } from '@/hooks/useNotes';
import { useAuth } from '@/components/auth/AuthProvider';
import TagBadge from '@/components/tags/TagBadge';
import MarkdownRenderer from '@/components/markdown/MarkdownRenderer';

// Cloudflare Pages用のEdge Runtime設定
export const runtime = 'edge';

export default function NotePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { note, loading, error, fetchNote, deleteNote } = useNotes(params.id);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // リフレッシュボタン用
  const handleRefresh = () => {
    fetchNote(params.id);
  };

  // 削除ボタン用
  const handleDelete = async () => {
    if (!confirm('このメモを削除してもよろしいですか？')) return;
    
    setIsDeleting(true);
    setDeleteError(null);
    
    try {
      const { success, error } = await deleteNote(params.id);
      
      if (success) {
        router.push('/notes');
      } else {
        setDeleteError(error || 'メモの削除に失敗しました');
      }
    } catch (err: any) {
      setDeleteError(err.message || 'メモの削除中にエラーが発生しました');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <Container>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">メモ詳細</h1>
          <Button
            onClick={() => router.push('/notes')}
            variant="outline"
          >
            メモ一覧に戻る
          </Button>
        </div>

        {(error || deleteError) && (
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-md text-red-600 dark:text-red-400 mb-6">
            {error || deleteError}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        ) : note ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold">{note.title}</h2>
                {note.is_public && (
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
                    公開
                  </span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                <div>
                  <span>作成: {new Date(note.created_at).toLocaleString('ja-JP')}</span>
                  <span className="mx-3">|</span>
                  <span>更新: {new Date(note.updated_at).toLocaleString('ja-JP')}</span>
                </div>
                <Button 
                  onClick={handleRefresh}
                  variant="ghost"
                  size="sm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  更新
                </Button>
              </div>
              
              {/* タグの表示 */}
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {note.tags.map(tag => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </div>
              )}
              
              <div className="prose prose-sm dark:prose-invert max-w-none pb-6 border-b dark:border-gray-700">
                {/* マークダウンレンダラーを使用 */}
                <MarkdownRenderer content={note.content || ''} />
              </div>
              
              {user && note.user_id === user.id && (
                <div className="flex justify-end space-x-4 mt-6">
                  <Button 
                    href={`/notes/${note.id}/edit`}
                    variant="outline"
                  >
                    編集
                  </Button>
                  <Button 
                    onClick={handleDelete}
                    variant="destructive"
                    disabled={isDeleting}
                  >
                    {isDeleting ? '削除中...' : '削除'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-300">メモが見つかりませんでした。</p>
          </div>
        )}
      </Container>
    </ProtectedRoute>
  );
}

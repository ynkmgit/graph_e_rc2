'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import NoteCard from '@/components/notes/NoteCard';
import { useNotes } from '@/hooks/useNotes';
import { useTags } from '@/hooks/useTags';
import TagBadge from '@/components/tags/TagBadge';
import SearchBar from '@/components/search/SearchBar';
import SortSelector, { SortOption } from '@/components/search/SortSelector';
import { Note } from '@/types/note';

export default function NotesPage() {
  const router = useRouter();
  const { notes, loading, error, deleteNote, searchNotes } = useNotes();
  const { tags, loading: tagsLoading } = useTags();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('updated_desc');
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  // ソートオプション
  const sortOptions: SortOption[] = [
    { value: 'updated_desc', label: '更新日（新しい順）' },
    { value: 'updated_asc', label: '更新日（古い順）' },
    { value: 'created_desc', label: '作成日（新しい順）' },
    { value: 'created_asc', label: '作成日（古い順）' },
    { value: 'title_asc', label: 'タイトル（A→Z）' },
    { value: 'title_desc', label: 'タイトル（Z→A）' },
  ];

  // 検索とタグのフィルタリングを両方適用
  const filteredNotes = useMemo(() => {
    // 検索が行われていない場合は全メモを表示
    if (!searchPerformed && !activeTag) {
      return notes;
    }

    // 選択されたタグでフィルタリング
    const tagFiltered = activeTag 
      ? notes.filter(note => note.tags?.some(tag => tag.id === activeTag))
      : notes;

    // 検索クエリがない場合はタグフィルタリングのみを適用
    if (!searchQuery.trim()) {
      return tagFiltered;
    }

    // 検索クエリでさらにフィルタリング（バックエンドですでに検索済みの場合はこの処理はスキップされる）
    const query = searchQuery.toLowerCase();
    return tagFiltered.filter(note => 
      note.title.toLowerCase().includes(query) || 
      (note.content && note.content.toLowerCase().includes(query)) ||
      note.tags?.some(tag => tag.name.toLowerCase().includes(query))
    );
  }, [notes, activeTag, searchQuery, searchPerformed]);

  // ソート処理
  const sortedNotes = useMemo(() => {
    return [...filteredNotes].sort((a, b) => {
      switch (sortOption) {
        case 'updated_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'updated_asc':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title, 'ja');
        case 'title_desc':
          return b.title.localeCompare(a.title, 'ja');
        default:
          return 0;
      }
    });
  }, [filteredNotes, sortOption]);

  // 検索処理のハンドラー
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    // 検索クエリが空でない場合はAPIで検索を実行
    if (query.trim()) {
      const { notes } = await searchNotes(query);
      setSearchPerformed(true);
    } else {
      // 検索クエリが空の場合はフィルターをリセット
      setSearchPerformed(false);
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

  // フィルターをすべてクリア
  const clearAllFilters = () => {
    setActiveTag(null);
    setSearchQuery('');
    setSearchPerformed(false);
  };

  // メモの削除
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">メモ一覧</h1>
          <div className="flex flex-wrap gap-2">
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

        {/* 検索バー */}
        <div className="mb-6">
          <SearchBar
            onSearch={handleSearch}
            initialQuery={searchQuery}
            placeholder="タイトル、内容、タグで検索..."
            className="mb-4"
          />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            {/* タグフィルター */}
            {!tagsLoading && tags.length > 0 && (
              <div>
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
                </div>
              </div>
            )}
            
            {/* ソートセレクター */}
            <SortSelector
              options={sortOptions}
              value={sortOption}
              onChange={setSortOption}
              className="ml-auto mt-4 sm:mt-0"
            />
          </div>

          {/* アクティブなフィルター表示 */}
          {(activeTag || searchQuery) && (
            <div className="flex items-center mt-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
              <span className="text-sm text-gray-700 dark:text-gray-300 mr-3">
                アクティブなフィルター:
              </span>
              {activeTag && (
                <div className="flex items-center mr-3">
                  <span className="text-sm bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded mr-1">
                    {tags.find(tag => tag.id === activeTag)?.name || 'タグ'}
                  </span>
                </div>
              )}
              {searchQuery && (
                <div className="flex items-center mr-3">
                  <span className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-1">
                    「{searchQuery}」で検索
                  </span>
                </div>
              )}
              <button
                onClick={clearAllFilters}
                className="text-xs text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 underline ml-auto"
              >
                フィルターをクリア
              </button>
            </div>
          )}
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
        ) : sortedNotes.length === 0 ? (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 text-center">
            {activeTag || searchQuery ? (
              <>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchQuery 
                    ? `「${searchQuery}」に一致するメモが見つかりませんでした` 
                    : '選択したタグのメモがありません'}
                </p>
                <Button
                  onClick={clearAllFilters}
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
          <>
            {/* 検索・フィルター結果のカウント表示 */}
            {(searchPerformed || activeTag) && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {sortedNotes.length}件のメモが見つかりました
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedNotes.map(note => (
                <NoteCard 
                  key={note.id} 
                  note={note} 
                  onDelete={handleDelete}
                  isDeleting={deletingId === note.id}
                />
              ))}
            </div>
          </>
        )}
      </Container>
    </ProtectedRoute>
  );
}

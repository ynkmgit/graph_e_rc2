'use client';

import Link from 'next/link';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Note } from '@/types/note';
import TagBadge from '@/components/tags/TagBadge';

interface NoteCardProps {
  note: Note;
  onDelete?: (id: string) => Promise<void>;
  showActions?: boolean;
  isDeleting?: boolean;
  showAuthor?: boolean;
  authorName?: string;
}

export default function NoteCard({
  note,
  onDelete,
  showActions = true,
  isDeleting = false,
  showAuthor = false,
  authorName
}: NoteCardProps) {
  // 内容のプレビュー用に短縮する（最大100文字）
  const contentPreview = note.content 
    ? note.content.length > 100 
      ? `${note.content.substring(0, 100)}...` 
      : note.content
    : '';

  // 日付のフォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader>
        <Link href={`/notes/${note.id}`} className="hover:underline">
          <h2 className="font-semibold text-lg truncate">{note.title}</h2>
        </Link>
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDate(note.updated_at)}
          </p>
          {note.is_public && (
            <span className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 text-xs px-2 py-1 rounded">
              公開
            </span>
          )}
        </div>
        {showAuthor && authorName && (
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">
            作成者: {authorName}
          </p>
        )}
        
        {/* タグ表示 */}
        {note.tags && note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {note.tags.map(tag => (
              <TagBadge key={tag.id} tag={tag} />
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="h-24 overflow-hidden text-sm text-gray-600 dark:text-gray-300">
          {contentPreview || <span className="text-gray-400 dark:text-gray-500 italic">内容なし</span>}
        </div>
      </CardContent>
      {showActions && (
        <CardFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button
              href={`/notes/${note.id}/edit`}
              variant="outline"
              size="sm"
            >
              編集
            </Button>
            {onDelete && (
              <Button
                onClick={() => onDelete(note.id)}
                variant="destructive"
                size="sm"
                disabled={isDeleting}
              >
                {isDeleting ? '削除中...' : '削除'}
              </Button>
            )}
          </div>
          <Button
            href={`/notes/${note.id}`}
            variant="link"
            size="sm"
          >
            詳細 →
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { NoteFormInput, isValidTitle, isValidContent } from '@/types/note';
import { useTags } from '@/hooks/useTags';
import TagSelector from '@/components/tags/TagSelector';
import { Tag } from '@/types/tag';

interface NoteFormProps {
  initialData: {
    title: string;
    content: string;
    is_public: boolean;
    tagIds?: string[];
  };
  onSubmit: (data: NoteFormInput) => Promise<void>;
  loading: boolean;
  mode?: 'create' | 'edit';
  noteId?: string;
}

export default function NoteForm({ 
  initialData, 
  onSubmit, 
  loading, 
  mode = 'create',
  noteId
}: NoteFormProps) {
  const [formData, setFormData] = useState({
    title: initialData.title,
    content: initialData.content,
    is_public: initialData.is_public,
    tagIds: initialData.tagIds || []
  });
  
  const [errors, setErrors] = useState({
    title: '',
    content: ''
  });
  
  const [showMarkdownHelp, setShowMarkdownHelp] = useState(false);

  // タグ関連のカスタムフック
  const { 
    tags, 
    noteTags, 
    loading: tagsLoading, 
    createTag 
  } = useTags(noteId);

  // 編集モードで、noteIdが存在し、noteTagsが読み込まれたらtagIdsを更新
  useEffect(() => {
    if (mode === 'edit' && noteId && noteTags.length > 0) {
      setFormData(prev => ({
        ...prev,
        tagIds: noteTags.map(tag => tag.id)
      }));
    }
  }, [mode, noteId, noteTags]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const target = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // エラーをクリア
    if (name === 'title' || name === 'content') {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // タグ選択の変更を処理
  const handleTagsChange = (tagIds: string[]) => {
    setFormData(prev => ({ ...prev, tagIds }));
  };

  const validate = () => {
    const newErrors = {
      title: '',
      content: ''
    };
    
    if (!isValidTitle(formData.title)) {
      newErrors.title = 'タイトルは1〜100文字で入力してください';
    }
    
    if (!isValidContent(formData.content)) {
      newErrors.content = '内容は10000文字以内で入力してください';
    }
    
    setErrors(newErrors);
    return !newErrors.title && !newErrors.content;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      await onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label 
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          タイトル *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
          placeholder="メモのタイトルを入力"
          disabled={loading}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
        )}
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            内容 <span className="text-xs text-blue-600 dark:text-blue-400">(マークダウン対応)</span>
          </label>
          <button
            type="button"
            onClick={() => setShowMarkdownHelp(!showMarkdownHelp)}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
          >
            {showMarkdownHelp ? 'ヘルプを閉じる' : 'マークダウンのヘルプを表示'}
          </button>
        </div>
        
        {showMarkdownHelp && (
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 text-sm">
            <h4 className="font-medium mb-2">基本的なマークダウン書式</h4>
            <ul className="space-y-1 list-disc pl-5">
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded"># 見出し1</code> - 見出しレベル1（最大）</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">## 見出し2</code> - 見出しレベル2</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">**太字**</code> - <strong>太字</strong></li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">*斜体*</code> - <em>斜体</em></li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">[リンクテキスト](https://example.com)</code> - リンク</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">- 項目</code> - 箇条書きリスト</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">1. 項目</code> - 番号付きリスト</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">```<br/>コードブロック<br/>```</code> - コードブロック</li>
              <li><code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">`インラインコード`</code> - インラインコード</li>
            </ul>
          </div>
        )}
        
        <textarea
          id="content"
          name="content"
          rows={10}
          value={formData.content}
          onChange={handleChange}
          className="block w-full rounded-md border border-gray-300 dark:border-gray-600 p-2 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500"
          placeholder="メモの内容を入力（マークダウン記法が使えます）"
          disabled={loading}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
        )}
      </div>
      
      {/* タグセレクター */}
      <div>
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          タグ
        </label>
        <TagSelector
          availableTags={tags}
          selectedTagIds={formData.tagIds}
          onChange={handleTagsChange}
          onCreateTag={createTag}
          className="mt-1"
        />
      </div>
      
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_public"
          name="is_public"
          checked={formData.is_public}
          onChange={e => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-400"
          disabled={loading}
        />
        <label
          htmlFor="is_public"
          className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
        >
          このメモを公開する
        </label>
      </div>
      
      <div className="pt-4">
        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? '保存中...' : mode === 'create' ? '保存する' : '更新する'}
        </Button>
      </div>
    </form>
  );
}

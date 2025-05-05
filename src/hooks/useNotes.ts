'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Note, NoteFormInput } from '@/types/note';
import { useTags } from '@/hooks/useTags';
import { Tag } from '@/types/tag';

export const useNotes = (noteId?: string) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // タグ操作用のフック
  const { setNoteTagIds } = useTags();

  // メモの一覧を取得（タグ情報付き）
  const fetchNotes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // メモの基本情報を取得
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;
      
      // 各メモのタグ情報を取得
      const notesWithTags = await Promise.all(
        notesData.map(async (noteItem) => {
          const { data: tagData, error: tagError } = await supabase
            .from('note_tags')
            .select('tags:tag_id(*)')
            .eq('note_id', noteItem.id);
          
          if (tagError) {
            console.error('タグ取得エラー:', tagError);
            return { ...noteItem, tags: [] };
          }
          
          return {
            ...noteItem,
            tags: tagData.map(item => item.tags as unknown as Tag)
          };
        })
      );
      
      setNotes(notesWithTags as Note[]);
    } catch (err: any) {
      console.error('メモ取得エラー:', err);
      setError(err.message || 'メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 特定のメモを取得（タグ情報付き）
  const fetchNote = async (id: string) => {
    try {
      setLoading(true);
      
      // メモの基本情報を取得
      const { data: noteData, error: noteError } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (noteError) throw noteError;
      
      // タグ情報を取得
      const { data: tagData, error: tagError } = await supabase
        .from('note_tags')
        .select('tags:tag_id(*)')
        .eq('note_id', id);
      
      if (tagError) throw tagError;
      
      // タグ情報を付与
      const noteWithTags = {
        ...noteData,
        tags: tagData.map(item => item.tags as unknown as Tag)
      };
      
      setNote(noteWithTags as Note);
    } catch (err: any) {
      console.error('メモ取得エラー:', err);
      setError(err.message || 'メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 公開メモの取得（タグ情報付き）
  const fetchPublicNotes = async () => {
    try {
      setLoading(true);
      
      // 公開メモの基本情報とユーザー情報を取得
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*, user_profiles(display_name, username)')
        .eq('is_public', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;
      
      // 各メモのタグ情報を取得
      const notesWithTags = await Promise.all(
        notesData.map(async (noteItem) => {
          const { data: tagData, error: tagError } = await supabase
            .from('note_tags')
            .select('tags:tag_id(*)')
            .eq('note_id', noteItem.id);
          
          if (tagError) {
            console.error('タグ取得エラー:', tagError);
            return { ...noteItem, tags: [] };
          }
          
          return {
            ...noteItem,
            tags: tagData.map(item => item.tags as unknown as Tag)
          };
        })
      );
      
      setNotes(notesWithTags as Note[]);
    } catch (err: any) {
      console.error('公開メモ取得エラー:', err);
      setError(err.message || '公開メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // メモの作成（タグ付け対応）
  const createNote = async (formData: NoteFormInput) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      // メモを作成
      const { data, error } = await supabase
        .from('notes')
        .insert({
          user_id: user.id,
          title: formData.title,
          content: formData.content,
          is_public: formData.is_public
        })
        .select()
        .single();

      if (error) throw error;
      
      const newNote = data as Note;
      
      // タグを関連付け（存在する場合）
      if (formData.tagIds && formData.tagIds.length > 0) {
        const { success, error: tagError } = await setNoteTagIds(newNote.id, formData.tagIds);
        if (!success) {
          console.error('タグ付けエラー:', tagError);
        }
      }
      
      // タグ情報を付与してstateを更新
      let tagsData = [];
      if (formData.tagIds && formData.tagIds.length > 0) {
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', formData.tagIds);
        
        tagsData = tagData || [];
      }
      
      const noteWithTags = {
        ...newNote,
        tags: tagsData
      };
      
      // 成功したら状態を更新
      setNotes(prev => [noteWithTags as Note, ...prev]);
      
      return { success: true, data: noteWithTags, error: null };
    } catch (err: any) {
      console.error('メモ作成エラー:', err);
      return { success: false, data: null, error: err.message || 'メモの作成に失敗しました' };
    }
  };

  // メモの更新（タグ付け対応）
  const updateNote = async (id: string, formData: NoteFormInput) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      // メモを更新
      const { data, error } = await supabase
        .from('notes')
        .update({
          title: formData.title,
          content: formData.content,
          is_public: formData.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const updatedNote = data as Note;
      
      // タグを関連付け（データが存在する場合）
      if (formData.tagIds !== undefined) {
        const { success, error: tagError } = await setNoteTagIds(id, formData.tagIds);
        if (!success) {
          console.error('タグ付けエラー:', tagError);
        }
      }
      
      // タグ情報を取得
      let tagsData = [];
      if (formData.tagIds && formData.tagIds.length > 0) {
        const { data: tagData } = await supabase
          .from('tags')
          .select('*')
          .in('id', formData.tagIds);
        
        tagsData = tagData || [];
      }
      
      const noteWithTags = {
        ...updatedNote,
        tags: tagsData
      };
      
      // 成功したら状態を更新
      setNote(noteWithTags as Note);
      setNotes(prev => prev.map(item => 
        item.id === id ? (noteWithTags as Note) : item
      ));
      
      return { success: true, data: noteWithTags, error: null };
    } catch (err: any) {
      console.error('メモ更新エラー:', err);
      return { success: false, data: null, error: err.message || 'メモの更新に失敗しました' };
    }
  };

  // メモの削除（論理削除）
  const deleteNote = async (id: string) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      const { error } = await supabase
        .from('notes')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // 成功したら状態を更新
      setNotes(prev => prev.filter(item => item.id !== id));
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('メモ削除エラー:', err);
      return { success: false, error: err.message || 'メモの削除に失敗しました' };
    }
  };

  // 特定のタグが付いたメモを取得
  const fetchNotesByTagId = async (tagId: string) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // タグIDに関連するメモIDを取得
      const { data: noteTagsData, error: noteTagsError } = await supabase
        .from('note_tags')
        .select('note_id')
        .eq('tag_id', tagId);

      if (noteTagsError) throw noteTagsError;
      
      if (noteTagsData.length === 0) {
        setNotes([]);
        setLoading(false);
        return;
      }

      // 取得したメモIDでメモ情報を取得
      const noteIds = noteTagsData.map(item => item.note_id);
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .in('id', noteIds)
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;
      
      // 各メモのタグ情報を取得
      const notesWithTags = await Promise.all(
        notesData.map(async (noteItem) => {
          const { data: tagData, error: tagError } = await supabase
            .from('note_tags')
            .select('tags:tag_id(*)')
            .eq('note_id', noteItem.id);
          
          if (tagError) {
            console.error('タグ取得エラー:', tagError);
            return { ...noteItem, tags: [] };
          }
          
          return {
            ...noteItem,
            tags: tagData.map(item => item.tags as unknown as Tag)
          };
        })
      );
      
      setNotes(notesWithTags as Note[]);
    } catch (err: any) {
      console.error('タグによるメモ取得エラー:', err);
      setError(err.message || 'タグによるメモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // メモを検索する機能（タイトル、内容、タグで検索）
  const searchNotes = async (query: string) => {
    if (!user) {
      return { notes: [], error: 'ログインしていません' };
    }

    try {
      setLoading(true);
      
      // 検索文字列が空の場合は全件取得
      if (!query.trim()) {
        await fetchNotes();
        return { notes, error: null };
      }
      
      // タイトルか内容にキーワードが含まれるメモを検索
      const { data: notesData, error: notesError } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
        .order('updated_at', { ascending: false });

      if (notesError) throw notesError;
      
      // タグ名に基づくメモIDの検索
      const { data: tagNotesData, error: tagNotesError } = await supabase
        .from('tags')
        .select('note_tags!inner(note_id)')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .ilike('name', `%${query}%`);

      if (tagNotesError) throw tagNotesError;
      
      // タグ検索でヒットしたメモIDの配列を作成
      const tagNoteIds = tagNotesData
        .flatMap(tag => tag.note_tags)
        .map(noteTag => noteTag.note_id);
      
      // タグ検索でヒットしたメモを取得（内容検索と重複しないよう注意）
      let additionalNotes: any[] = [];
      if (tagNoteIds.length > 0) {
        const existingIds = notesData.map(note => note.id);
        const uniqueTagNoteIds = tagNoteIds.filter(id => !existingIds.includes(id));
        
        if (uniqueTagNoteIds.length > 0) {
          const { data: additionalNotesData, error: additionalNotesError } = await supabase
            .from('notes')
            .select('*')
            .in('id', uniqueTagNoteIds)
            .eq('user_id', user.id)
            .is('deleted_at', null);
          
          if (additionalNotesError) throw additionalNotesError;
          additionalNotes = additionalNotesData;
        }
      }
      
      // 全ての検索結果を結合
      const combinedNotesData = [...notesData, ...additionalNotes];
      
      // 各メモのタグ情報を取得
      const notesWithTags = await Promise.all(
        combinedNotesData.map(async (noteItem) => {
          const { data: tagData, error: tagError } = await supabase
            .from('note_tags')
            .select('tags:tag_id(*)')
            .eq('note_id', noteItem.id);
          
          if (tagError) {
            console.error('タグ取得エラー:', tagError);
            return { ...noteItem, tags: [] };
          }
          
          return {
            ...noteItem,
            tags: tagData.map(item => item.tags as unknown as Tag)
          };
        })
      );
      
      // 検索結果をstateに保存
      setNotes(notesWithTags as Note[]);
      return { notes: notesWithTags as Note[], error: null };
    } catch (err: any) {
      console.error('メモ検索エラー:', err);
      setError(err.message || 'メモの検索に失敗しました');
      return { notes: [], error: err.message || 'メモの検索に失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // 特定のIDが指定されている場合は、そのメモを取得
  useEffect(() => {
    if (noteId) {
      fetchNote(noteId);
    } else {
      fetchNotes();
    }
  }, [user, noteId]);

  return {
    notes,
    note,
    loading,
    error,
    fetchNotes,
    fetchNote,
    fetchPublicNotes,
    fetchNotesByTagId,
    createNote,
    updateNote,
    deleteNote,
    searchNotes // 追加: 検索機能
  };
};

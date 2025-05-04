'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Note, NoteFormInput } from '@/types/note';

export const useNotes = (noteId?: string) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // メモの一覧を取得
  const fetchNotes = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data as Note[]);
    } catch (err: any) {
      console.error('メモ取得エラー:', err);
      setError(err.message || 'メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 特定のメモを取得
  const fetchNote = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      setNote(data as Note);
    } catch (err: any) {
      console.error('メモ取得エラー:', err);
      setError(err.message || 'メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 公開メモの取得
  const fetchPublicNotes = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notes')
        .select('*, user_profiles(display_name, username)')
        .eq('is_public', true)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setNotes(data as Note[]);
    } catch (err: any) {
      console.error('公開メモ取得エラー:', err);
      setError(err.message || '公開メモの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // メモの作成
  const createNote = async (formData: NoteFormInput) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
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
      
      // 成功したら状態を更新
      setNotes(prev => [data as Note, ...prev]);
      
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error('メモ作成エラー:', err);
      return { success: false, data: null, error: err.message || 'メモの作成に失敗しました' };
    }
  };

  // メモの更新
  const updateNote = async (id: string, formData: NoteFormInput) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
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
      
      // 成功したら状態を更新
      setNote(data as Note);
      setNotes(prev => prev.map(item => 
        item.id === id ? (data as Note) : item
      ));
      
      return { success: true, data, error: null };
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
    createNote,
    updateNote,
    deleteNote
  };
};

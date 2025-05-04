'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { Tag, TagFormInput } from '@/types/tag';
import { Note } from '@/types/note';

export const useTags = (noteId?: string) => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [noteTags, setNoteTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ユーザーのタグ一覧を取得
  const fetchTags = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('name');

      if (error) throw error;
      setTags(data as Tag[]);
    } catch (err: any) {
      console.error('タグ取得エラー:', err);
      setError(err.message || 'タグの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 特定のメモに関連付けられたタグを取得
  const fetchNoteTags = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('note_tags')
        .select('tags:tag_id(*)')
        .eq('note_id', id);

      if (error) throw error;
      
      // tags.tag_idの形式で返されるので、整形する
      // 型エラー修正: 明示的にitemごとに型を変換する
      const formattedTags = data.map(item => item.tags as unknown as Tag);
      setNoteTags(formattedTags);
    } catch (err: any) {
      console.error('メモのタグ取得エラー:', err);
      setError(err.message || 'メモのタグ取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // タグを作成（オブジェクト形式またはパラメータ形式の両方に対応）
  const createTag = async (nameOrFormData: string | TagFormInput, color?: string): Promise<Tag | null> => {
    if (!user) {
      setError('ログインしていません');
      return null;
    }

    let tagName: string;
    let tagColor: string;

    // 引数の形式をチェック
    if (typeof nameOrFormData === 'string') {
      // 個別のパラメータとして渡された場合
      tagName = nameOrFormData;
      tagColor = color || '#6B7280'; // デフォルトのグレー
    } else {
      // オブジェクトとして渡された場合
      tagName = nameOrFormData.name;
      tagColor = nameOrFormData.color;
    }

    // 名前が空でないことを確認
    if (!tagName || !tagName.trim()) {
      setError('タグ名は必須です');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .insert({
          user_id: user.id,
          name: tagName.trim(),
          color: tagColor
        })
        .select()
        .single();

      if (error) throw error;
      
      // 成功したら状態を更新
      const newTag = data as Tag;
      setTags(prev => [...prev, newTag]);
      
      return newTag;
    } catch (err: any) {
      console.error('タグ作成エラー:', err);
      setError(err.message || 'タグの作成に失敗しました');
      return null;
    }
  };

  // タグを更新
  const updateTag = async (id: string, formData: TagFormInput) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      const { data, error } = await supabase
        .from('tags')
        .update({
          name: formData.name,
          color: formData.color,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      // 成功したら状態を更新
      setTags(prev => prev.map(tag => 
        tag.id === id ? (data as Tag) : tag
      ));
      
      return { success: true, data, error: null };
    } catch (err: any) {
      console.error('タグ更新エラー:', err);
      return { success: false, data: null, error: err.message || 'タグの更新に失敗しました' };
    }
  };

  // タグを削除（論理削除）
  const deleteTag = async (id: string) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      const { error } = await supabase
        .from('tags')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      // 成功したら状態を更新
      setTags(prev => prev.filter(tag => tag.id !== id));
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('タグ削除エラー:', err);
      return { success: false, error: err.message || 'タグの削除に失敗しました' };
    }
  };

  // メモにタグを関連付ける
  const setNoteTagIds = async (noteId: string, tagIds: string[]) => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      // 一旦そのメモの既存のタグ関連をすべて削除
      const { error: deleteError } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId);

      if (deleteError) throw deleteError;

      // タグIDがない場合は削除だけで終了
      if (tagIds.length === 0) {
        return { success: true, error: null };
      }

      // 新しいタグ関連を追加
      const noteTagsToInsert = tagIds.map(tagId => ({
        note_id: noteId,
        tag_id: tagId
      }));

      const { error: insertError } = await supabase
        .from('note_tags')
        .insert(noteTagsToInsert);

      if (insertError) throw insertError;
      
      return { success: true, error: null };
    } catch (err: any) {
      console.error('メモのタグ設定エラー:', err);
      return { success: false, error: err.message || 'メモへのタグ設定に失敗しました' };
    }
  };

  // 特定のタグが付いたメモ一覧を取得
  const fetchNotesByTagId = async (tagId: string) => {
    if (!user) {
      setLoading(false);
      return { notes: [], error: 'ログインしていません' };
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('note_tags')
        .select('notes:note_id(*)')
        .eq('tag_id', tagId);

      if (error) throw error;
      
      // notes.note_idの形式で返されるので、整形する
      // 型エラー修正: 明示的にitemごとに型を変換する
      const formattedNotes = data.map(item => item.notes as unknown as Note);
      
      // 削除されていないメモのみフィルタリング
      const activeNotes = formattedNotes.filter(note => !note.deleted_at);
      
      return { notes: activeNotes, error: null };
    } catch (err: any) {
      console.error('タグに関連するメモ取得エラー:', err);
      setLoading(false);
      return { notes: [], error: err.message || 'タグに関連するメモの取得に失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // 初期読み込み
  useEffect(() => {
    fetchTags();
    if (noteId) {
      fetchNoteTags(noteId);
    }
  }, [user, noteId]);

  return {
    tags,
    noteTags,
    loading,
    error,
    fetchTags,
    fetchNoteTags,
    createTag,
    updateTag,
    deleteTag,
    setNoteTagIds,
    fetchNotesByTagId
  };
};

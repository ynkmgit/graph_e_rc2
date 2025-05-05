'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  NoteImage, 
  ImageUploadResult, 
  ImagesListResult, 
  ImageUrlResult, 
  ImageDeleteResult, 
  getImageMetadata 
} from '@/types/noteImage';

// バケット名を修正（小文字、数字、ドット、ハイフンのみ）
const STORAGE_BUCKET = 'noteimages';

export const useNoteImages = (noteId?: string) => {
  const { user } = useAuth();
  const [images, setImages] = useState<NoteImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);

  // 特定のメモに関連する画像を取得
  const fetchImages = async (id?: string) => {
    const targetNoteId = id || noteId;
    if (!user || !targetNoteId) {
      setLoading(false);
      return { images: [], error: 'ユーザーまたはメモIDが指定されていません' };
    }

    try {
      setLoading(true);
      setError(null);
      
      // メモに関連する画像メタデータを取得
      const { data, error: fetchError } = await supabase
        .from('note_images')
        .select('*')
        .eq('note_id', targetNoteId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setImages(data as NoteImage[]);
      return { images: data as NoteImage[], error: null };
    } catch (err: any) {
      console.error('画像取得エラー:', err);
      setError(err.message || '画像の取得に失敗しました');
      return { images: [], error: err.message || '画像の取得に失敗しました' };
    } finally {
      setLoading(false);
    }
  };

  // 画像をアップロード
  const uploadImage = async (file: File, id?: string): Promise<ImageUploadResult> => {
    const targetNoteId = id || noteId;
    if (!user || !targetNoteId) {
      return { success: false, error: 'ユーザーまたはメモIDが指定されていません' };
    }

    try {
      setUploading(true);
      setError(null);
      
      // ファイルパスを設定（ユーザーID/メモID/ファイル名）
      const filePath = `${user.id}/${targetNoteId}/${Date.now()}_${file.name}`;
      
      // 画像メタデータを取得（非同期）
      const metadata = await getImageMetadata(file);
      
      // Supabaseのストレージにファイルをアップロード
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      // メタデータをデータベースに保存
      const { data: imageData, error: insertError } = await supabase
        .from('note_images')
        .insert({
          note_id: targetNoteId,
          user_id: user.id,
          storage_path: uploadData.path,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          width: metadata.width,
          height: metadata.height
        })
        .select()
        .single();

      if (insertError) {
        // メタデータの保存に失敗した場合、ストレージからファイルを削除
        await supabase.storage
          .from(STORAGE_BUCKET)
          .remove([uploadData.path]);
        
        throw insertError;
      }
      
      // アップロードしたファイルのURLを取得
      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(uploadData.path);
      
      const newImage = imageData as NoteImage;
      
      // 成功したら状態を更新
      setImages(prev => [newImage, ...prev]);
      
      return {
        success: true,
        data: newImage,
        url: urlData.publicUrl
      };
    } catch (err: any) {
      console.error('画像アップロードエラー:', err);
      setError(err.message || '画像のアップロードに失敗しました');
      return { success: false, error: err.message || '画像のアップロードに失敗しました' };
    } finally {
      setUploading(false);
    }
  };

  // 複数の画像をアップロード
  const uploadMultipleImages = async (files: File[], id?: string): Promise<ImageUploadResult[]> => {
    const targetNoteId = id || noteId;
    if (!user || !targetNoteId) {
      return [{ success: false, error: 'ユーザーまたはメモIDが指定されていません' }];
    }

    try {
      const results = [];
      for (const file of files) {
        const result = await uploadImage(file, targetNoteId);
        results.push(result);
      }
      return results;
    } catch (err: any) {
      console.error('複数画像アップロードエラー:', err);
      return [{ success: false, error: err.message || '画像のアップロードに失敗しました' }];
    }
  };

  // 画像のURLを取得
  const getImageUrl = async (imageId: string): Promise<ImageUrlResult> => {
    try {
      // 画像メタデータを取得
      const { data: imageData, error: fetchError } = await supabase
        .from('note_images')
        .select('storage_path')
        .eq('id', imageId)
        .single();

      if (fetchError) throw fetchError;
      
      // 画像のURLを取得
      const { data: urlData } = await supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(imageData.storage_path);
      
      return { url: urlData.publicUrl };
    } catch (err: any) {
      console.error('画像URL取得エラー:', err);
      return { url: '', error: err.message || '画像URLの取得に失敗しました' };
    }
  };

  // 画像を削除（論理削除 + ストレージから実際に削除）
  const deleteImage = async (imageId: string): Promise<ImageDeleteResult> => {
    if (!user) {
      return { success: false, error: 'ログインしていません' };
    }

    try {
      // 画像メタデータを取得
      const { data: imageData, error: fetchError } = await supabase
        .from('note_images')
        .select('*')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;
      
      // 論理削除を実行
      const { error: deleteError } = await supabase
        .from('note_images')
        .update({
          deleted_at: new Date().toISOString()
        })
        .eq('id', imageId)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;
      
      // ストレージからファイルを削除
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([imageData.storage_path]);

      if (storageError) {
        console.error('ストレージからの削除に失敗しましたが、論理削除は成功しました:', storageError);
      }
      
      // 成功したら状態を更新
      setImages(prev => prev.filter(image => image.id !== imageId));
      
      return { success: true };
    } catch (err: any) {
      console.error('画像削除エラー:', err);
      return { success: false, error: err.message || '画像の削除に失敗しました' };
    }
  };

  // メモIDが指定されている場合、関連画像を取得
  useEffect(() => {
    if (noteId) {
      fetchImages(noteId);
    }
  }, [user, noteId]);

  return {
    images,
    loading,
    error,
    uploading,
    fetchImages,
    uploadImage,
    uploadMultipleImages,
    getImageUrl,
    deleteImage
  };
};

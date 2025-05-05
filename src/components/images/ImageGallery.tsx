'use client';

import React, { useState } from 'react';
import { NoteImage, formatFileSize, getFileIcon } from '@/types/noteImage';
import { Button } from '@/components/ui/Button';

// バケット名を修正（小文字、数字、ドット、ハイフンのみ）
const STORAGE_BUCKET = 'noteimages';

interface ImageGalleryProps {
  images: NoteImage[];
  onDelete?: (imageId: string) => Promise<void>;
  onInsert?: (imageUrl: string, image: NoteImage) => void;
  readonly?: boolean;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onDelete,
  onInsert,
  readonly = false,
  className = '',
}) => {
  const [selectedImage, setSelectedImage] = useState<NoteImage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 画像プレビューを開く
  const openPreview = (image: NoteImage, url: string) => {
    setSelectedImage(image);
    setPreviewUrl(url);
  };

  // 画像プレビューを閉じる
  const closePreview = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // 画像を削除
  const handleDelete = async (imageId: string) => {
    if (!onDelete) return;
    
    if (!confirm('この画像を削除してもよろしいですか？')) return;
    
    setDeletingId(imageId);
    try {
      await onDelete(imageId);
      // プレビューを表示中に削除した場合は、プレビューを閉じる
      if (selectedImage?.id === imageId) {
        closePreview();
      }
    } finally {
      setDeletingId(null);
    }
  };

  // 画像をエディタに挿入
  const handleInsert = (image: NoteImage, url: string) => {
    if (onInsert) {
      onInsert(url, image);
      closePreview(); // 挿入後にプレビューを閉じる
    }
  };

  // 画像URLを取得（サーバーからのURL取得が完了していない場合は一時URL）
  const getImageSrc = (image: NoteImage): string => {
    // Supabaseのストレージパスから公開URLを構築
    // 注: 実際の環境では、より複雑なURLの構築や署名付きURLの取得が必要かもしれません
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${image.storage_path}`;
  };

  if (images.length === 0) {
    return (
      <div className={`text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg ${className}`}>
        <p className="text-gray-500 dark:text-gray-400">画像はまだアップロードされていません</p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* 画像グリッド */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((image) => {
          const imageSrc = getImageSrc(image);
          return (
            <div 
              key={image.id} 
              className="relative group bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700 aspect-square"
            >
              {/* 画像プレビュー */}
              <div 
                className="w-full h-full flex items-center justify-center cursor-pointer"
                onClick={() => openPreview(image, imageSrc)}
              >
                {image.mime_type.startsWith('image/') ? (
                  <img
                    src={imageSrc}
                    alt={image.file_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-4xl">{getFileIcon(image.mime_type)}</div>
                    <p className="text-xs mt-2 text-gray-600 dark:text-gray-300 truncate px-2">
                      {image.file_name}
                    </p>
                  </div>
                )}
              </div>

              {/* ホバー時のオーバーレイ + アクションボタン */}
              {!readonly && (
                <div className="absolute inset-0 bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {onInsert && (
                    <button
                      onClick={() => handleInsert(image, imageSrc)}
                      className="p-2 bg-white dark:bg-gray-700 rounded-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      title="メモに挿入"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"></path>
                      </svg>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-2 bg-white dark:bg-gray-700 rounded-full text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      title="削除"
                      disabled={deletingId === image.id}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 画像プレビューモーダル */}
      {selectedImage && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* モーダルヘッダー */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate flex-1">
                {selectedImage.file_name}
              </h3>
              <button
                onClick={closePreview}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* モーダル本文 */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
              {selectedImage.mime_type.startsWith('image/') ? (
                <img
                  src={previewUrl}
                  alt={selectedImage.file_name}
                  className="max-w-full max-h-[calc(90vh-12rem)] object-contain"
                />
              ) : (
                <div className="text-center p-8">
                  <div className="text-6xl mb-4">{getFileIcon(selectedImage.mime_type)}</div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {selectedImage.file_name}
                  </p>
                </div>
              )}
            </div>

            {/* モーダルフッター */}
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p>サイズ: {formatFileSize(selectedImage.file_size)}</p>
                {selectedImage.width && selectedImage.height && (
                  <p>解像度: {selectedImage.width} x {selectedImage.height}</p>
                )}
              </div>
              <div className="flex gap-2">
                {!readonly && onInsert && (
                  <Button
                    onClick={() => handleInsert(selectedImage, previewUrl)}
                    variant="primary"
                  >
                    メモに挿入
                  </Button>
                )}
                {!readonly && onDelete && (
                  <Button
                    onClick={() => handleDelete(selectedImage.id)}
                    variant="destructive"
                    disabled={deletingId === selectedImage.id}
                  >
                    {deletingId === selectedImage.id ? '削除中...' : '削除'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;

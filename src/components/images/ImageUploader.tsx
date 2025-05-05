'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  ACCEPTED_IMAGE_TYPES, 
  MAX_IMAGE_SIZE, 
  MAX_IMAGES_PER_NOTE, 
  formatFileSize 
} from '@/types/noteImage';

interface ImageUploaderProps {
  onUpload: (files: File[]) => Promise<void>;
  onCancel?: () => void;
  uploading?: boolean;
  currentImageCount?: number;
  multiple?: boolean;
  className?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  onCancel,
  uploading = false,
  currentImageCount = 0,
  multiple = true,
  className = '',
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ファイル選択ダイアログを開く
  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ファイル選択時の処理
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      validateAndSetFiles(Array.from(files));
    }
  };

  // ドラッグ&ドロップ関連のイベントハンドラー
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // ドロップ時の処理
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      validateAndSetFiles(Array.from(e.dataTransfer.files));
    }
  };

  // ファイルのバリデーションと状態更新
  const validateAndSetFiles = (files: File[]) => {
    setError(null);
    
    // 画像ファイルだけをフィルタリング
    const imageFiles = files.filter(file => 
      ACCEPTED_IMAGE_TYPES.includes(file.type)
    );
    
    if (imageFiles.length === 0) {
      setError('選択されたファイルは画像ではありません。JPEG、PNG、GIF、WebP、SVG形式の画像を選択してください。');
      return;
    }
    
    // サイズチェック
    const oversizedFiles = imageFiles.filter(file => file.size > MAX_IMAGE_SIZE);
    if (oversizedFiles.length > 0) {
      setError(`画像サイズが大きすぎます（最大 ${formatFileSize(MAX_IMAGE_SIZE)}）: ${oversizedFiles.map(f => f.name).join(', ')}`);
      return;
    }
    
    // 最大アップロード可能数チェック
    const totalImages = currentImageCount + imageFiles.length;
    if (totalImages > MAX_IMAGES_PER_NOTE) {
      setError(`画像の数が多すぎます。1つのメモにつき最大${MAX_IMAGES_PER_NOTE}枚までアップロードできます。`);
      return;
    }
    
    // 複数選択が許可されていない場合は1つだけ選択
    const filesToAdd = multiple ? imageFiles : [imageFiles[0]];
    setSelectedFiles(filesToAdd);
  };

  // アップロード実行
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      await onUpload(selectedFiles);
      // アップロード成功時は選択ファイルをクリア
      setSelectedFiles([]);
      // ファイル入力も初期化
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'アップロードに失敗しました');
    }
  };

  // キャンセル
  const handleCancel = () => {
    setSelectedFiles([]);
    setError(null);
    // ファイル入力を初期化
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    // 外部キャンセルハンドラーがあれば呼び出し
    if (onCancel) {
      onCancel();
    }
  };

  // ファイルの削除（選択リストから）
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className={`${className}`}>
      {/* ファイル選択エリア */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 ${
          dragActive ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700'
        } ${selectedFiles.length > 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <div className="text-center">
          {selectedFiles.length === 0 ? (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                画像をドラッグ&ドロップするか、
                <button
                  type="button"
                  className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium focus:outline-none focus:underline"
                  onClick={handleBrowseClick}
                >
                  ブラウズ
                </button>
                してください
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, GIF, WebP, SVG（最大 {formatFileSize(MAX_IMAGE_SIZE)}）
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                選択された画像 ({selectedFiles.length})
              </h3>
              <ul className="max-h-48 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
                {selectedFiles.map((file, index) => (
                  <li key={index} className="py-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="ml-2 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <svg
                        className="h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="pt-2">
                <button
                  type="button"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium focus:outline-none focus:underline"
                  onClick={handleBrowseClick}
                >
                  別の画像を追加
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* 非表示のファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        multiple={multiple}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* アクションボタン */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 flex space-x-2 justify-end">
          <Button
            onClick={handleCancel}
            variant="outline"
            disabled={uploading}
          >
            キャンセル
          </Button>
          <Button
            onClick={handleUpload}
            variant="primary"
            disabled={uploading}
          >
            {uploading ? 'アップロード中...' : 'アップロード'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;

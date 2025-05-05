/**
 * メモ画像関連の型定義
 */

export interface NoteImage {
  id: string;
  note_id: string;
  user_id: string;
  storage_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

// 画像アップロード用の入力型
export interface NoteImageUpload {
  noteId: string;
  file: File;
}

// 画像のメタデータ型
export interface ImageMetadata {
  width?: number;
  height?: number;
  size: number;
  type: string;
}

// 画像アップロード結果の型
export interface ImageUploadResult {
  success: boolean;
  data?: NoteImage;
  error?: string;
  url?: string;
}

// 画像一覧取得結果の型
export interface ImagesListResult {
  images: NoteImage[];
  error?: string;
}

// 画像のURL取得に使用する型
export interface ImageUrlResult {
  url: string;
  error?: string;
}

// 画像削除結果の型
export interface ImageDeleteResult {
  success: boolean;
  error?: string;
}

// 画像のマークダウン挿入用データ型
export interface MarkdownImageData {
  id: string;
  url: string;
  file_name: string;
  width?: number;
  height?: number;
}

/**
 * 画像のマークダウン挿入用文字列を生成
 */
export const getMarkdownImageString = (image: MarkdownImageData): string => {
  // width/heightが両方存在する場合は、サイズ指定を追加（マークダウン拡張形式）
  const sizeAttrs = image.width && image.height
    ? ` width="${image.width}" height="${image.height}"`
    : '';
  
  return `![${image.file_name}](${image.url}${sizeAttrs})`;
};

/**
 * ファイルサイズをフォーマットして表示用の文字列に変換
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else if (bytes < 1024 * 1024 * 1024) {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  } else {
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  }
};

/**
 * 画像ファイルのメタデータを取得
 */
export const getImageMetadata = (file: File): Promise<ImageMetadata> => {
  return new Promise((resolve) => {
    const metadata: ImageMetadata = {
      size: file.size,
      type: file.type
    };
    
    // 画像ファイルのみwidth/heightを取得
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        metadata.width = img.width;
        metadata.height = img.height;
        URL.revokeObjectURL(img.src); // メモリ解放
        resolve(metadata);
      };
      img.onerror = () => {
        // エラー時はwidth/heightなしで解決
        resolve(metadata);
      };
      img.src = URL.createObjectURL(file);
    } else {
      // 画像ファイル以外はそのまま解決
      resolve(metadata);
    }
  });
};

/**
 * ファイル名から拡張子を取得
 */
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2) || '';
};

/**
 * ファイルタイプに基づいて適切なアイコンを返す
 */
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  } else if (mimeType.startsWith('video/')) {
    return '🎬';
  } else if (mimeType.startsWith('audio/')) {
    return '🎵';
  } else if (mimeType.includes('pdf')) {
    return '📄';
  } else if (
    mimeType.includes('document') ||
    mimeType.includes('msword') ||
    mimeType.includes('officedocument.wordprocessing')
  ) {
    return '📝';
  } else if (
    mimeType.includes('spreadsheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('officedocument.spreadsheet')
  ) {
    return '📊';
  } else if (
    mimeType.includes('presentation') ||
    mimeType.includes('powerpoint') ||
    mimeType.includes('officedocument.presentation')
  ) {
    return '📽️';
  } else if (mimeType.includes('zip') || mimeType.includes('x-tar') || mimeType.includes('x-rar')) {
    return '🗜️';
  } else {
    return '📎';
  }
};

/**
 * 受け入れ可能な画像MIME型リスト
 */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

/**
 * 画像ファイルのサイズ上限（5MB）
 */
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

/**
 * 一度にアップロード可能な画像数の上限
 */
export const MAX_IMAGES_PER_NOTE = 10;

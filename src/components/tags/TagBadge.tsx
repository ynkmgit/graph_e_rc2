'use client';

import React from 'react';
import { Tag } from '@/types/tag';

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  onDelete?: () => void;
  className?: string;
  showDelete?: boolean;
}

export default function TagBadge({
  tag,
  onClick,
  onDelete,
  className = '',
  showDelete = false,
}: TagBadgeProps) {
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) onDelete();
  };

  // タグ色をテキスト色に反映（暗めの背景色、明るめのテキスト色）
  const getTextColor = (bgColor: string) => {
    // 簡易的な明るさ判定（RGBの値から計算）
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    
    // 明るければ暗いテキスト、暗ければ明るいテキスト
    return brightness > 128 ? '#1F2937' : '#FFFFFF';
  };

  const bgColor = tag.color;
  const textColor = getTextColor(bgColor);
  
  return (
    <span
      className={`inline-flex items-center text-xs px-2.5 py-0.5 rounded-full transition-colors ${
        onClick ? 'cursor-pointer hover:opacity-80' : ''
      } ${className}`}
      style={{ backgroundColor: bgColor, color: textColor }}
      onClick={onClick}
    >
      {tag.name}
      {showDelete && (
        <button
          type="button"
          className="ml-1.5 hover:opacity-70"
          onClick={handleDeleteClick}
          aria-label={`${tag.name}タグを削除`}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      )}
    </span>
  );
}

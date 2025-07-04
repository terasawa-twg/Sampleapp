// src/features/file-list/components/FileItem.tsx
// ファイル一覧のアイテムコンポーネント

import type { FileListItem } from '../types';
import { FileActions } from './FileActions';
import { useState, useEffect } from 'react';

interface FileItemProps {
  file: FileListItem;
  onDownload: (photoId: number, filePath: string) => void;
  onDelete: (photoId: number) => void;
  isDeleting?: boolean;
}

export function FileItem({ file, onDownload, onDelete, isDeleting }: FileItemProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  // ファイル名をパスから抽出
  const getFileName = (filePath: string) => {
    return filePath.split('/').pop() || filePath;
  };

  // 日付をフォーマット
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(date));
  };

  // ファイル拡張子から種類を判定
  const getFileType = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'docx':
      case 'doc':
        return 'Word文書';
      case 'xlsx':
      case 'xls':
        return 'Excel文書';
      case 'pptx':
      case 'ppt':
        return 'PowerPoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return '画像ファイル';
      default:
        return 'ドキュメント';
    }
  };

  // ファイルアイコンを表示（画像の場合はサムネイル風に）
  const renderFileIcon = (filePath: string) => {
    const ext = filePath.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
    
    if (isImage) {
      if (imageError) {
        return (
          <div className="w-12 h-12 bg-gray-200 rounded border flex items-center justify-center">
            <div className="text-xs text-gray-500">画像</div>
          </div>
        );
      }

      return (
        <div className="w-12 h-12 bg-gray-100 rounded border overflow-hidden">
          <img 
            src={filePath} 
            alt="サムネイル" 
            className="w-full h-full object-cover"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            style={{ display: imageError ? 'none' : 'block' }}
          />
        </div>
      );
    }

    return (
      <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
        <div className="text-xs text-gray-600 font-medium">
          {ext?.toUpperCase() || 'FILE'}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-4">
        {/* ファイルアイコン/サムネイル */}
        {renderFileIcon(file.file_path)}

        {/* ファイル情報 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {getFileName(file.file_path)}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                メモ: {file.description || 'なし'}
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                <span>{formatDate(file.visits.visit_date)}</span>
                <span>{file.visits.locations.name}</span>
                <span>{getFileType(file.file_path)}</span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="ml-4 flex-shrink-0">
              <FileActions
                photoId={file.photo_id}
                fileName={getFileName(file.file_path)}
                filePath={file.file_path}
                onDownload={onDownload}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
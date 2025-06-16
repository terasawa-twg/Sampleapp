import { useState } from 'react';
import type { UploadedFile } from '@/features/visit-history/types/index';

export const useFileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // ファイル削除処理
  const handleFileRemove = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  // ファイルアップロード処理
  const handleFileUpload = (files: FileList) => {
    const newFiles = Array.from(files).map((file, index) => ({
      id: `new_${Date.now()}_${index}`,
      name: file.name,
      size: file.size,
      file: file,
    }));
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  // ファイル選択ボタンでのアップロード処理
  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
  };

  // ドラッグ&ドロップ関連のイベントハンドラ
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files);
    }
  };

  // ファイルをリセット
  const resetFiles = () => {
    setUploadedFiles([]);
  };

  return {
    // 状態
    uploadedFiles,
    isDragOver,
    // メソッド
    handleFileRemove,
    handleFileUpload,
    handleFileInputChange,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    resetFiles,
  };
};
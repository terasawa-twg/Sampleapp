// src/features/file-list/components/FileList.tsx
// ファイル一覧コンポーネント

'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useFileList } from '../hooks/useFileList';
import { FilterSidebar } from './FilterSidebar';
import { FileListContent } from './FileListContent';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export function FileList() {
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  
  const {
    files,
    filters,
    pagination,
    loading,
    error,
    updateFilters,
    handlePageChange,
    refetch,
  } = useFileList();

  // ファイル削除のmutation
  const deleteFileMutation = api.visitPhotos.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeletingFileId(null);
    },
    onError: (error) => {
      console.error('ファイル削除エラー:', error);
      setDeletingFileId(null);
    },
  });

  // ダウンロード処理
  const handleDownload = async (photoId: number, filePath: string) => {
    try {
      // ファイルが存在するかチェック
      const response = await fetch(filePath, { method: 'HEAD' });
      
      if (!response.ok) {
        console.warn(`ファイルが見つかりません: ${filePath}`);
        alert('ファイルが見つかりません。管理者にお問い合わせください。');
        return;
      }
      
      // ファイルが存在する場合のダウンロード処理
      const link = document.createElement('a');
      link.href = filePath;
      link.download = filePath.split('/').pop() || 'file';
      link.target = '_blank'; 
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('ダウンロードエラー:', error);
      alert('ダウンロードに失敗しました。管理者にお問い合わせください。');
    }
  };

  // 削除処理
  const handleDelete = async (photoId: number) => {
    setDeletingFileId(photoId);
    deleteFileMutation.mutate({ id: photoId });
  };

  // アクティブフィルターの数を計算
  const activeFilterCount = 
    (filters.searchTerm ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">エラーが発生しました: {error}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            再試行
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* メインコンテンツ */}
      <FileListContent
        files={files}
        pagination={pagination}
        activeFilterCount={activeFilterCount}
        onDownload={handleDownload}
        onDelete={handleDelete}
        onPageChange={handlePageChange}
        deletingFileId={deletingFileId}
      />


      {/* フィルターサイドバー */}
      <FilterSidebar
        filters={filters}
        updateFilters={updateFilters}
      />
    </div>
  );
}
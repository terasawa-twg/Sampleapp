// src/features/file-list/components/FileList.tsx
// ファイル一覧コンポーネント

'use client';

import { useState } from 'react';
import { api } from '@/trpc/react';
import { useFileList } from '../hooks/useFileList';
import { FileItem } from './FileItem';
import { Pagination } from './Pagination';
import { CityFilter, DateRangeFilter } from './VisitLocationFilter';
import { LocationSearch } from '@/features/shared/components/LocationSearch';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, X } from 'lucide-react';

export function FileList() {
  const [deletingFileId, setDeletingFileId] = useState<number | null>(null);
  
  const {
    files,
    filters,
    pagination,
    availableCities,
    loading,
    error,
    updateFilters,
    handlePageChange,
    resetFilters,
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
  const handleDownload = (photoId: number, filePath: string) => {
    // 実際の実装では、セキュアなダウンロードURLを生成する必要があります
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filePath.split('/').pop() || 'file';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 削除処理
  const handleDelete = async (photoId: number) => {
    setDeletingFileId(photoId);
    deleteFileMutation.mutate({ id: photoId });
  };

  // アクティブフィルターの数を計算
  const activeFilterCount = 
    (filters.searchTerm ? 1 : 0) +
    filters.selectedCities.length +
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
      <div className="flex-1 flex flex-col">
        {/* 検索バーとステータス */}
        <div className="p-6 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-medium text-gray-900">
                訪問履歴に紐づくファイル
              </h2>
              <span className="text-sm text-gray-500">
                {pagination.totalItems}件 / {Math.ceil(pagination.totalItems / pagination.itemsPerPage)}ページ
              </span>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                フィルターをクリア ({activeFilterCount})
              </Button>
            )}
          </div>
          
          <LocationSearch
            searchTerm={filters.searchTerm}
            onSearchChange={(term) => updateFilters({ searchTerm: term })}
          />
        </div>

        {/* ファイル一覧 */}
        <div className="flex-1 overflow-y-auto p-6">
          {files.length > 0 ? (
            <div className="space-y-4">
              {files.map((file) => (
                <FileItem
                  key={file.photo_id}
                  file={file}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                  isDeleting={deletingFileId === file.photo_id}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {activeFilterCount > 0 
                  ? 'フィルター条件に一致するファイルが見つかりません'
                  : 'ファイルがありません'
                }
              </p>
            </div>
          )}
        </div>

        {/* ページネーション */}
        {pagination.totalPages > 1 && (
          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        )}
      </div>

      {/* フィルターサイドバー */}
      <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
        <h3 className="text-lg font-medium text-gray-900 mb-6">フィルター</h3>
        
        <div className="space-y-6">
          {/* 市区町村フィルター */}
          <CityFilter
            selectedCities={filters.selectedCities}
            availableCities={availableCities}
            onCityChange={(cities: string[]) => updateFilters({ selectedCities: cities })}
          />

          {/* 日付範囲フィルター */}
          <DateRangeFilter
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            onDateFromChange={(date?: Date) => updateFilters({ dateFrom: date })}
            onDateToChange={(date?: Date) => updateFilters({ dateTo: date })}
          />
        </div>
      </div>
    </div>
  );
}
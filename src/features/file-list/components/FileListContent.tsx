// src/features/file-list/components/FileListContent.tsx
// ファイル一覧のコンテンツ部分コンポーネント

import { FileItem } from "./FileItem";
import { Pagination } from "./Pagination";
import type { FileListItem, PaginationInfo } from "../types";

interface FileListContentProps {
  files: FileListItem[];
  pagination: PaginationInfo;
  activeFilterCount: number;
  onDownload: (photoId: number, filePath: string) => void;
  onDelete: (photoId: number) => void;
  onPageChange: (page: number) => void;
  deletingFileId: number | null;
}

export function FileListContent({
  files,
  pagination,
  activeFilterCount,
  onDownload,
  onDelete,
  onPageChange,
  deletingFileId,
}: FileListContentProps) {
  // 現在表示中のアイテム範囲を計算
  const getDisplayRange = () => {
    if (pagination.totalItems === 0) {
      return { start: 0, end: 0 };
    }
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(
      pagination.currentPage * pagination.itemsPerPage,
      pagination.totalItems,
    );
    return { start, end };
  };

  const { start, end } = getDisplayRange();

  return (
    <div className="flex flex-1 flex-col">
      {/* ヘッダー */}
      <div className="border-b border-gray-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">
              訪問履歴に紐づくファイル
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {pagination.totalItems > 0
                ? `${start}～${end}件／${pagination.totalItems}件`
                : "0件"}
            </span>
          </div>
        </div>
      </div>

      {/* ファイル一覧 */}
      <div className="flex-1 overflow-y-auto p-6">
        {files.length > 0 ? (
          <div className="space-y-4">
            {files.map((file) => (
              <FileItem
                key={file.photo_id}
                file={file}
                onDownload={onDownload}
                onDelete={onDelete}
                isDeleting={deletingFileId === file.photo_id}
              />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">
              {activeFilterCount > 0
                ? "フィルター条件に一致するファイルが見つかりません"
                : "ファイルがありません"}
            </p>
          </div>
        )}
      </div>

      {/* ページネーション */}
      {pagination.totalPages > 1 && (
        <Pagination pagination={pagination} onPageChange={onPageChange} />
      )}
    </div>
  );
}

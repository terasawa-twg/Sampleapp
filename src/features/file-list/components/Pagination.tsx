// src/features/file-list/components/Pagination.tsx
// ページネーションコンポーネント

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PaginationInfo } from '../types';

interface PaginationProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export function Pagination({ pagination, onPageChange }: PaginationProps) {
  const { currentPage, totalPages, totalItems, itemsPerPage } = pagination;

  // 表示するページ番号の範囲を計算
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // 総ページ数が少ない場合は全て表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 現在のページを中心に表示
      const half = Math.floor(maxVisiblePages / 2);
      let start = Math.max(1, currentPage - half);
      const end = Math.min(totalPages, start + maxVisiblePages - 1);
      
      // 末尾調整
      if (end - start + 1 < maxVisiblePages) {
        start = Math.max(1, end - maxVisiblePages + 1);
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  // 現在表示中のアイテム範囲を計算
  const getItemRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(currentPage * itemsPerPage, totalItems);
    return { start, end };
  };

  const { start, end } = getItemRange();
  const pageNumbers = getPageNumbers();

  if (totalPages <= 1) {
    return null; // ページが1つ以下の場合は表示しない
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
      {/* アイテム数表示 */}
      <div className="text-sm text-gray-700">
        {totalItems}件中 {start}〜{end}件を表示
      </div>

      {/* ページネーション */}
      <div className="flex items-center gap-2">
        {/* 前のページボタン */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          前へ
        </Button>

        {/* ページ番号 */}
        <div className="flex items-center gap-1">
          {/* 最初のページが表示されていない場合 */}
          {pageNumbers.length > 0 && pageNumbers[0]! > 1 && (
            <>
              <Button
                variant={1 === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(1)}
                className="w-8 h-8 p-0"
              >
                1
              </Button>
              {pageNumbers[0]! > 2 && (
                <span className="text-gray-400 px-1">...</span>
              )}
            </>
          )}

          {/* メインのページ番号 */}
          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(page)}
              className={`w-8 h-8 p-0 ${
                page === currentPage 
                  ? "bg-red-500 hover:bg-red-600 text-white" 
                  : ""
              }`}
            >
              {page}
            </Button>
          ))}

          {/* 最後のページが表示されていない場合 */}
          {pageNumbers.length > 0 && pageNumbers[pageNumbers.length - 1]! < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1]! < totalPages - 1 && (
                <span className="text-gray-400 px-1">...</span>
              )}
              <Button
                variant={totalPages === currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="w-8 h-8 p-0"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>

        {/* 次のページボタン */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1"
        >
          次へ
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
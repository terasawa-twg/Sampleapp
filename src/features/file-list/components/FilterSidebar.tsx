// src/features/file-list/components/FilterSidebar.tsx
// ファイル一覧のフィルターサイドバーコンポーネント

import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateRangeFilter } from '@/app/_components/Filters';
import type { FileListFilters } from '../types';

interface FilterSidebarProps {
  filters: FileListFilters;
  updateFilters: (newFilters: Partial<FileListFilters>) => void;
}

export function FilterSidebar({ filters, updateFilters }: FilterSidebarProps) {
  // アクティブフィルターの数を計算
  const activeFilterCount = 
    (filters.searchTerm ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-6">フィルター</h3>
      
      {/* アクティブフィルター表示 */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-900 mb-3">適用中のフィルター</h4>
          <div className="space-y-2">
            {/* 訪問先名フィルター */}
            {filters.searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ searchTerm: '' })}
                className="flex items-center gap-2 h-auto px-3 py-2 text-left"
              >
                <X className="h-3 w-3" />
                <span className="text-sm">{filters.searchTerm}</span>
              </Button>
            )}
            
            {/* 日付範囲フィルター */}
            {(filters.dateFrom ?? filters.dateTo) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ dateFrom: undefined, dateTo: undefined })}
                className="flex items-center gap-2 h-auto px-3 py-2 text-left"
              >
                <X className="h-3 w-3" />
                <span className="text-sm">
                  {filters.dateFrom ? filters.dateFrom.toLocaleDateString('ja-JP') : ''}
                  {filters.dateFrom && filters.dateTo ? '～' : ''}
                  {filters.dateTo ? filters.dateTo.toLocaleDateString('ja-JP') : ''}
                </span>
              </Button>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-6">
        {/* 訪問先名で検索 */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">訪問先名で検索</h4>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="訪問先名で検索"
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="pl-10 w-full"
            />
          </div>
        </div>

        {/* 日付範囲フィルター */}
        <DateRangeFilter
          dateFrom={filters.dateFrom}
          dateTo={filters.dateTo}
          onDateFromChange={(date?: Date) => updateFilters({ dateFrom: date })}
          onDateToChange={(date?: Date) => updateFilters({ dateTo: date })}
        />
      </div>
    </div>
  );
}
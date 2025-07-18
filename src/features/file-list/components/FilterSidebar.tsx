// src/features/file-list/components/FilterSidebar.tsx
// ファイル一覧のフィルターサイドバーコンポーネント

import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangeFilter } from "@/app/_components/Filters";
import type { FileListFilters } from "../types";

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
    <div className="w-80 overflow-y-auto border-l border-gray-200 bg-gray-50 p-6">
      <h3 className="mb-6 text-lg font-medium text-gray-900">フィルター</h3>

      {/* アクティブフィルター表示 */}
      {activeFilterCount > 0 && (
        <div className="mb-6">
          <h4 className="mb-3 text-sm font-medium text-gray-900">
            適用中のフィルター
          </h4>
          <div className="space-y-2">
            {/* 訪問先名フィルター */}
            {filters.searchTerm && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateFilters({ searchTerm: "" })}
                className="flex h-auto items-center gap-2 px-3 py-2 text-left"
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
                onClick={() =>
                  updateFilters({ dateFrom: undefined, dateTo: undefined })
                }
                className="flex h-auto items-center gap-2 px-3 py-2 text-left"
              >
                <X className="h-3 w-3" />
                <span className="text-sm">
                  {filters.dateFrom
                    ? filters.dateFrom.toLocaleDateString("ja-JP")
                    : ""}
                  {filters.dateFrom && filters.dateTo ? "～" : ""}
                  {filters.dateTo
                    ? filters.dateTo.toLocaleDateString("ja-JP")
                    : ""}
                </span>
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* 訪問先名で検索 */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-gray-900">
            訪問先名で検索
          </h4>
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              type="text"
              placeholder="訪問先名で検索"
              value={filters.searchTerm}
              onChange={(e) => updateFilters({ searchTerm: e.target.value })}
              className="w-full pl-10"
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

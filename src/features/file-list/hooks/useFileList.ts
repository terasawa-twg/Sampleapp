// src/features/file-list/hooks/useFileList.ts
// ファイル一覧を取得し、フィルタリングやページネーションを行うカスタムフック

import { useState, useMemo } from "react";
import { api } from "@/trpc/react";
import type { FileListFilters, PaginationInfo } from "../types";

const ITEMS_PER_PAGE = 10;

export function useFileList() {
  const [filters, setFilters] = useState<FileListFilters>({
    searchTerm: "",
    dateFrom: undefined,
    dateTo: undefined,
  });

  const [currentPage, setCurrentPage] = useState(1);

  // tRPCを使ってファイル一覧を取得
  const {
    data: allFiles,
    isLoading,
    error,
    refetch,
  } = api.visitPhotos.getAll.useQuery();

  // フィルタリング処理
  const filteredFiles = useMemo(() => {
    if (!allFiles) return [];

    return allFiles.filter((file) => {
      // 検索語でのフィルタリング（訪問先名）
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const locationName = file.visits.locations.name;

        if (!locationName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // 日付範囲でのフィルタリング
      const visitDate = new Date(file.visits.visit_date);
      if (filters.dateFrom && visitDate < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && visitDate > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [allFiles, filters]);

  // ページネーション処理
  const paginatedFiles = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredFiles.slice(startIndex, endIndex);
  }, [filteredFiles, currentPage]);

  // ページネーション情報
  const pagination: PaginationInfo = useMemo(
    () => ({
      currentPage,
      totalPages: Math.ceil(filteredFiles.length / ITEMS_PER_PAGE),
      totalItems: filteredFiles.length,
      itemsPerPage: ITEMS_PER_PAGE,
    }),
    [filteredFiles.length, currentPage],
  );

  // フィルター更新関数
  const updateFilters = (newFilters: Partial<FileListFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // フィルター変更時は最初のページに戻る
  };

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // フィルターリセット
  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      dateFrom: undefined,
      dateTo: undefined,
    });
    setCurrentPage(1);
  };

  return {
    files: paginatedFiles,
    filters,
    pagination,
    loading: isLoading,
    error: error?.message ?? null,
    updateFilters,
    handlePageChange,
    resetFilters,
    refetch,
  };
}

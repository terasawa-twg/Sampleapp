// src/features/file-list/hooks/useFileList.tsx
// ファイル一覧を取得し、フィルタリングやページネーションを行うカスタムフック

import { useState, useEffect, useMemo } from 'react';
import { api } from '@/trpc/react';
import type { FileListItem, FileListFilters, PaginationInfo } from '../types';

const ITEMS_PER_PAGE = 10;

export function useFileList() {
  const [filters, setFilters] = useState<FileListFilters>({
    searchTerm: '',
    selectedCities: [],
    dateFrom: undefined,
    dateTo: undefined,
  });
  
  const [currentPage, setCurrentPage] = useState(1);

  // tRPCを使ってファイル一覧を取得
  const { 
    data: allFiles, 
    isLoading, 
    error,
    refetch 
  } = api.visitPhotos.getAll.useQuery();

  // フィルタリング処理
  const filteredFiles = useMemo(() => {
    if (!allFiles) return [];

    return allFiles.filter((file) => {
      // 検索語でのフィルタリング（訪問先名とファイル名）
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const fileName = file.file_path.split('/').pop() || '';
        const locationName = file.visits.locations.name;
        
        if (!fileName.toLowerCase().includes(searchLower) && 
            !locationName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // 市区町村でのフィルタリング
      if (filters.selectedCities.length > 0) {
        // 住所から市区町村を抽出（簡易的な実装）
        const address = file.visits.locations.address || '';
        const hasSelectedCity = filters.selectedCities.some(city => 
          address.includes(city)
        );
        if (!hasSelectedCity) {
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
  const pagination: PaginationInfo = useMemo(() => ({
    currentPage,
    totalPages: Math.ceil(filteredFiles.length / ITEMS_PER_PAGE),
    totalItems: filteredFiles.length,
    itemsPerPage: ITEMS_PER_PAGE,
  }), [filteredFiles.length, currentPage]);

  // 利用可能な市区町村のリストを生成
  const availableCities = useMemo(() => {
    if (!allFiles) return [];
    
    const cities = new Set<string>();
    allFiles.forEach(file => {
      const address = file.visits.locations.address || '';
      // 住所から都道府県と市区町村を抽出（簡易的な実装）
      const matches = address.match(/[都道府県][市区町村]/g);
      if (matches) {
        matches.forEach(match => cities.add(match));
      }
    });
    
    return Array.from(cities).sort();
  }, [allFiles]);

  // フィルター更新関数
  const updateFilters = (newFilters: Partial<FileListFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // フィルター変更時は最初のページに戻る
  };

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // フィルターリセット
  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      selectedCities: [],
      dateFrom: undefined,
      dateTo: undefined,
    });
    setCurrentPage(1);
  };

  return {
    files: paginatedFiles,
    filters,
    pagination,
    availableCities,
    loading: isLoading,
    error: error?.message || null,
    updateFilters,
    handlePageChange,
    resetFilters,
    refetch,
  };
}
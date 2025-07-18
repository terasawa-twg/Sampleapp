// src/features/file-list/types/index.ts
// ファイル一覧で使用する型定義

export interface FileListItem {
  photo_id: number;
  visit_id: number;
  file_path: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  visits: {
    visit_date: Date;
    locations: {
      name: string;
      address: string;
    };
  };
  users_visit_photos_created_byTousers: {
    username: string;
  };
}

export interface FileListFilters {
  searchTerm: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface FileListState {
  files: FileListItem[];
  filters: FileListFilters;
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;
}

// 検索・フィルター用の型
export interface LocationSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

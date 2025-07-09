// ===========================================
// 基本型定義
// ===========================================

export interface Visit {
  id: number;
  visitDate: Date;
  memo?: string;
  rating?: number;
  locationId: number;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Location {
  id: number;
  name: string;
  address: string;
  phoneNumber?: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface VisitPhoto {
  id: number;
  visitId: number;
  fileName: string;
  filePath: string;
  uploadDate: Date;
}

// ===========================================
// 表示用の結合型（一覧・詳細画面用）
// ===========================================

export interface VisitWithDetails {
  id: number;
  visitDate: Date;
  memo?: string;
  rating?: number;
  location: Location;
  user: User;
  photoCount: number;
}

export interface VisitWithPhotos extends VisitWithDetails {
  photos: VisitPhoto[];
}

// ===========================================
// フィルター・検索用
// ===========================================

export interface VisitFilters {
  locationName?: string;
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  minRating?: number; // 追加
}
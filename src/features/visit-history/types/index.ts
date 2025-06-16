// 訪問先データの型定義
export interface VisitLocation {
  location_id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  description: string;
}

// アップロードファイルの型定義
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  file: File;
  description: string; // ファイルごとの説明
}

// 訪問履歴フォームデータの型定義
export interface VisitFormData {
  visitLocation: string;
  visitDate: string;
  visitTime: string;
  rating: string;
  memo: string;
  uploadedFiles: UploadedFile[];
}

// 送信用データの型定義
export interface CreateVisitData {
  location_id: number;
  location_name: string;
  visit_date: Date;
  visit_time: string;
  notes: string;
  rating: number;
  created_by: number;
  files: UploadedFile[];
}

// API レスポンスの型定義
export interface CreateVisitResponse {
  success: boolean;
  data: {
    visit_id: number;
    location_id: number;
    location_name: string;
    visit_date: string;
    notes: string;
    rating: number;
    created_by: number;
    created_at: string;
    photos_count: number;
  };
  message: string;
}

// ファイルアップロード結果の型定義
export interface FileUploadResult {
  fileName: string;
  filePath: string;
  originalName: string;
  size: number;
  mimeType: string;
}
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
}

// 訪問履歴フォームデータの型定義
export interface VisitFormData {
  visitLocation: string;
  visitDate: string;
  visitTime: string;
  rating: string;
  memo: string;
  uploadedFiles: UploadedFile[];
  fileDescription: string;
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
  file_description: string;
}
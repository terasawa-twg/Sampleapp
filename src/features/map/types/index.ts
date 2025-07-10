// src/features/map/types/index.ts
// =============================================================================
// マップ機能専用の型定義
// =============================================================================

// 訪問先データの型定義（DB構造に合わせて調整）
export interface VisitLocation {
  readonly id: string; // location_idをstringとして扱う
  readonly name: string;
  readonly lat: number; // DB: latitude
  readonly lng: number; // DB: longitude
  readonly category: string; // addressから推定または固定値
  readonly isActive?: boolean; // 訪問履歴の有無で判定
  readonly address?: string; // DBのaddressフィールド
  readonly description?: string; // DBのdescriptionフィールド
}

// 訪問履歴データの型定義
export interface VisitHistory {
  readonly id: string;
  readonly date: string;
  readonly location: string;
  readonly files: number;
  readonly description: string;
}

// 地図の状態管理
export interface MapState {
  readonly selectedLocationId: string | null;
  readonly isMapInitialized: boolean;
  readonly mapError: string | null;
}

// GeoloniaMap コンポーネントのプロパティ型
export interface GeoloniaMapProps {
  readonly locations: VisitLocation[];
  readonly selectedLocationId?: string | null;
  readonly isLoading?: boolean;
  readonly error?: string | null;
  readonly onLocationClick?: (locationId: string) => void;
  readonly onMapError?: (error: Error) => void;
  readonly onMapInitialized?: () => void;
  readonly disableNewMarker?: boolean; // 新規マーカー作成を無効化するオプション
}

// 訪問履歴パネルのプロパティ型
export interface VisitHistoryPanelProps {
  readonly selectedLocation: VisitLocation | null;
  readonly history: VisitHistory[];
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly onClose: () => void;
}

// マップコントロールのプロパティ型
export interface MapControlsProps {
  readonly onAddLocation: () => void;
  readonly onRefresh: () => void;
  readonly isLoading: boolean;
  readonly hasError: boolean;
}

// API レスポンス型
export interface LocationApiResponse {
  readonly data: VisitLocation[];
  readonly total: number;
}

export interface HistoryApiResponse {
  readonly data: VisitHistory[];
  readonly total: number;
}

// API エラー型
export interface ApiError {
  readonly message: string;
  readonly code: string;
  readonly details?: Record<string, unknown>;
}
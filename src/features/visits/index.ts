// ===========================================
// コンポーネントのエクスポート
// ===========================================

// あなたが作成したコンポーネント
export { VisitCard } from './components/VisitCard';
export { VisitsList } from './components/VisitsList';
export { VisitDetails } from './components/VisitDetails';
export { VisitFiltersComponent } from './components/VisitFilters';

// 他の開発者が作成予定のコンポーネント
// export { VisitForm } from './components/VisitForm';
// export { VisitEditForm } from './components/VisitEditForm';
// export { VisitFormFields } from './components/VisitFormFields';

// ===========================================
// フックのエクスポート
// ===========================================

// あなたが作成したフック
export { useVisits, useDeleteVisit } from './hooks/useVisits';
export { useVisitDetails, useVisitsByLocation } from './hooks/useVisitDetails';

// 他の開発者が作成予定のフック
// export { useCreateVisit } from './hooks/useCreateVisit';
// export { useUpdateVisit } from './hooks/useUpdateVisit';

// ===========================================
// 型のエクスポート
// ===========================================

export type {
  Visit,
  Location,
  User,
  VisitPhoto,
  VisitWithDetails,
  VisitWithPhotos,
  VisitFilters,
} from './types';

// 他の開発者が作成予定の型
// export type {
//   CreateVisitInput,
//   UpdateVisitInput,
//   VisitListResponse,
// } from './types';

// ===========================================
// ユーティリティのエクスポート（将来追加予定）
// ===========================================

// export { validateVisitInput } from './utils/visitValidation';
// export { formatVisitDate, calculateVisitDuration } from './utils/visitHelpers';
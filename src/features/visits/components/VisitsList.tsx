'use client';

import { useState, useMemo } from 'react';
import { VisitCard } from '@/features/visits/components/VisitCard';
import { VisitFiltersComponent } from '@/features/visits/components/VisitFilters';
import { useVisits } from '@/features/visits/hooks/useVisits';
import type { VisitFilters, VisitWithDetails } from '@/features/visits/types';

/**
 * 訪問履歴一覧ページのメインコンポーネント
 */
export const VisitsList = () => {
  const [filters, setFilters] = useState<VisitFilters>({});
  const { data: visitsData, isLoading, error } = useVisits(filters);

  // APIから返されたデータをVisitWithDetails形式に変換
  const visits = useMemo(() => {
    if (!visitsData) return [];
    
    console.log('Raw Visits Data:', visitsData); // デバッグ用
    
    // APIデータをVisitWithDetails型に適合させる
    return visitsData.map((visit: any): VisitWithDetails => ({
      id: visit.visit_id, // DBの主キーは visit_id
      visitDate: new Date(visit.visit_date), // DBフィールドは visit_date
      memo: visit.notes, // DBフィールドは notes
      rating: visit.rating,
      location: {
        id: visit.location_id,
        name: visit.locations?.name || '不明な場所',
        address: visit.locations?.address || '',
        phoneNumber: undefined, // DBにphone_numberフィールドがない
        description: visit.locations?.description,
        latitude: visit.locations?.latitude,
        longitude: visit.locations?.longitude,
      },
      user: {
        id: visit.created_by,
        name: visit.users_visits_created_byTousers?.username || '不明なユーザー',
        email: '', // DBにemailフィールドがない
      },
      photoCount: visit.visit_photos?.length || 0,
    }));
  }, [visitsData]);

  // locationNameでのクライアントサイドフィルタリング
  const filteredVisits = useMemo(() => {
    if (!visits) return [];
    
    if (filters.locationName) {
      return visits.filter(visit => 
        visit.location.name.toLowerCase().includes(filters.locationName!.toLowerCase())
      );
    }
    
    return visits;
  }, [visits, filters.locationName]);

  const handleFiltersChange = (newFilters: VisitFilters) => {
    setFilters(newFilters);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <h3 className="font-bold mb-2">エラーが発生しました</h3>
        <p>{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">訪問履歴一覧</h1>
        <div className="text-sm text-gray-600">
          {filteredVisits ? `${filteredVisits.length}件の訪問履歴` : ''}
        </div>
      </div>

      {/* 検索・フィルター */}
      <VisitFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* 訪問履歴カード一覧 */}
      {filteredVisits && filteredVisits.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-2">訪問履歴がありません</p>
          <p className="text-gray-400 text-sm">
            {filters.locationName || filters.startDate || filters.endDate
              ? '検索条件に一致する訪問履歴が見つかりません'
              : '最初の訪問履歴を登録してみましょう'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisits?.map((visit, index) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              index={index + 1}
            />
          ))}
        </div>
      )}

      {/* フッター情報 */}
      {filteredVisits && filteredVisits.length > 0 && (
        <div className="mt-8 text-center text-sm text-gray-500">
          合計 {filteredVisits.length} 件の訪問履歴を表示中
        </div>
      )}
    </div>
  );
};
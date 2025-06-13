'use client';

import { useState, useMemo } from 'react';
import { FileText, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import { VisitCard } from '@/features/visits/components/VisitCard';
import { VisitFiltersComponent } from '@/features/visits/components/VisitFilters';
import { useVisits } from '@/features/visits/hooks/useVisits';
import type { VisitFilters, VisitWithDetails } from '@/features/visits/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

/**
 * 訪問履歴一覧ページのメインコンポーネント (shadcn/ui版)
 */
export const VisitsList = () => {
  const [filters, setFilters] = useState<VisitFilters>({});
  const { data: visitsData, isLoading, error, refetch } = useVisits(filters);

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

  // ローディング状態
  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">訪問履歴を読み込み中...</p>
        </div>
      </div>
    );
  }

  // エラー状態
  if (error) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>エラーが発生しました</strong>
              <p className="mt-1">{error.message}</p>
            </div>
            <Button 
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              再読み込み
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">訪問履歴一覧</h1>
          <p className="text-muted-foreground">
            これまでの訪問記録を確認・管理できます
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            {filteredVisits ? filteredVisits.length : 0} 件
          </Badge>
        </div>
      </div>

      {/* 検索・フィルター */}
      <VisitFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
      />

      {/* 訪問履歴一覧 */}
      {filteredVisits && filteredVisits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="text-6xl mb-6 opacity-50">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {filters.locationName || filters.startDate || filters.endDate
                ? '検索条件に一致する訪問履歴がありません'
                : '訪問履歴がありません'
              }
            </h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {filters.locationName || filters.startDate || filters.endDate
                ? '検索条件を変更するか、フィルターをクリアして再度お試しください。'
                : '最初の訪問履歴を登録して、記録を開始しましょう。'
              }
            </p>
            {(filters.locationName || filters.startDate || filters.endDate) ? (
              <Button 
                onClick={() => setFilters({})}
                variant="outline"
              >
                フィルターをクリア
              </Button>
            ) : (
              <Button asChild>
                <a href="/visits/new">
                  <Plus className="h-4 w-4 mr-2" />
                  最初の訪問履歴を登録する
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 訪問履歴カード一覧 */}
          <div className="grid gap-4">
            {filteredVisits?.map((visit, index) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                index={index + 1}
              />
            ))}
          </div>

          {/* フッター統計 */}
          {filteredVisits && filteredVisits.length > 0 && (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  合計 <strong>{filteredVisits.length}</strong> 件の訪問履歴
                  {filters.locationName || filters.startDate || filters.endDate 
                    ? ' (フィルター適用中)' 
                    : ''
                  }
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
'use client';

import { useState, useMemo, useEffect } from 'react';
import { FileText, AlertCircle, RefreshCw, ArrowUp, ArrowDown } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { VisitFiltersComponent } from '@/features/visits/components/VisitFilters';
import { VisitCard } from '@/features/visits/components/VisitCard';
import { useVisits } from '@/features/visits/hooks/useVisits';
import type { VisitFilters, VisitWithDetails } from '@/features/visits/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// 型定義統合
interface RawVisitData {
  visit_id: number;
  visit_date: string | Date;
  notes?: string;
  rating?: number;
  location_id: number;
  created_by: number;
  locations?: {
    name: string;
    address?: string;
    description?: string;
    latitude?: number;
    longitude?: number;
  };
  users_visits_created_byTousers?: {
    username: string;
  };
  visit_photos?: Array<unknown>;
}

interface ExtendedVisitFilters extends VisitFilters {
  minRating?: number;
}

type SortOrder = 'asc' | 'desc';

export const VisitsList = () => {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ExtendedVisitFilters>({});
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  const { data: visitsData, isLoading, error, refetch } = useVisits({});
  
  // デバウンス処理でエラー軽減
  useEffect(() => {
    const timer = setTimeout(() => {
      // 何もしない（キャッシュ効果を期待）
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // URLパラメータ取得
  const locationName = searchParams.get('location');
  const locationId = searchParams.get('locationId');
  const isFilteredByLocation = !!(locationName ?? locationId);

  // URLパラメータから初期フィルター設定
  useEffect(() => {
    if (locationName && !filters.locationName) {
      setFilters(prev => ({ ...prev, locationName }));
    }
  }, [locationName, filters.locationName]);

  // データ変換
  const visits = useMemo(() => {
    if (!visitsData) return [];
    
    return (visitsData as RawVisitData[]).map((visit): VisitWithDetails => ({
      id: visit.visit_id,
      visitDate: new Date(visit.visit_date),
      memo: visit.notes,
      rating: visit.rating,
      location: {
        id: visit.location_id,
        name: visit.locations?.name ?? '不明な場所',
        address: visit.locations?.address ?? '',
        phoneNumber: undefined,
        description: visit.locations?.description,
        latitude: visit.locations?.latitude,
        longitude: visit.locations?.longitude,
      },
      user: {
        id: visit.created_by,
        name: visit.users_visits_created_byTousers?.username ?? '不明なユーザー',
        email: '',
      },
      photoCount: visit.visit_photos?.length ?? 0,
    }));
  }, [visitsData]);

  // フィルタリング・ソート処理
  const filteredAndSortedVisits = useMemo(() => {
    if (!visits) return [];
    
    let result = visits;
    
    if (filters.locationName) {
      result = result.filter(visit => 
        visit.location.name.toLowerCase().includes(filters.locationName!.toLowerCase())
      );
    }
    
    if (filters.minRating) {
      result = result.filter(visit => {
        if (!visit.rating) return false;
        const normalizedRating = visit.rating <= 5 ? visit.rating : Math.ceil(visit.rating / 2);
        return normalizedRating >= filters.minRating!;
      });
    }
    
    if (filters.startDate) {
      result = result.filter(visit => new Date(visit.visitDate) >= filters.startDate!);
    }
    
    if (filters.endDate) {
      result = result.filter(visit => new Date(visit.visitDate) <= filters.endDate!);
    }
    
    return [...result].sort((a, b) => 
      sortOrder === 'asc' ? a.id - b.id : b.id - a.id
    );
  }, [visits, filters.locationName, filters.minRating, filters.startDate, filters.endDate, sortOrder]);

  // ソートボタン内容
  const sortButtonContent = sortOrder === 'desc' 
    ? { icon: <ArrowDown className="h-4 w-4" />, text: 'ID降順' }
    : { icon: <ArrowUp className="h-4 w-4" />, text: 'ID昇順' };

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
            <Button onClick={() => refetch()} variant="outline" size="sm" className="ml-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              再読み込み
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const hasActiveFilters = filters.minRating || filters.startDate || filters.endDate;
  const visitCount = filteredAndSortedVisits?.length ?? 0;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">
            {isFilteredByLocation ? (
              <>
                検索: {locationName ?? `場所ID ${locationId}`}
                <span className="text-base font-normal text-muted-foreground ml-2">の訪問履歴</span>
              </>
            ) : (
              '訪問履歴一覧'
            )}
          </h1>
          <p className="text-muted-foreground">
            {isFilteredByLocation 
              ? `${locationName ?? '選択された場所'}への訪問記録を確認できます`
              : '訪問記録を確認できます'
            }
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">{visitCount}件</Badge>
      </div>

      {/* フィルター */}
      <VisitFiltersComponent filters={filters} onFiltersChange={setFilters} />

      {/* ソートコントロール */}
      {visitCount > 0 && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">
            {sortOrder === 'desc' 
              ? 'ID番号 降順 (新しい履歴から表示)' 
              : 'ID番号 昇順 (古い履歴から表示)'
            }
          </span>
          <Button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            variant="default"
            size="sm"
            className="flex items-center gap-2"
          >
            {sortButtonContent.icon}
            {sortButtonContent.text}
          </Button>
        </div>
      )}

      {/* メインコンテンツ */}
      {visitCount === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-6 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {isFilteredByLocation
                ? `${locationName}への訪問履歴がありません`
                : hasActiveFilters
                  ? 'フィルター条件に一致する訪問履歴がありません'
                  : '訪問履歴がありません'
              }
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {isFilteredByLocation
                ? 'この場所への訪問履歴が登録されていません。'
                : hasActiveFilters
                  ? 'フィルター条件を変更して再度お試しください。'
                  : '訪問履歴が登録されていません。'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* 訪問履歴リスト */}
          <div className="space-y-3">
            {filteredAndSortedVisits?.map((visit, index) => (
              <VisitCard
                key={visit.id}
                visit={visit}
                index={index + 1}
                variant="compact"
                showDelete={false}
              />
            ))}
          </div>

          {/* フッター統計 */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                合計 <strong>{visitCount}</strong> 件の訪問履歴
                {isFilteredByLocation && (
                  <span className="ml-2 text-primary">• {locationName}の履歴のみ表示</span>
                )}
                <span className="ml-2 text-primary">
                  • {sortOrder === 'asc' ? 'ID昇順' : 'ID降順'}で表示
                </span>
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
'use client';

import { useState } from 'react';
import { Search, Filter, X, ChevronDown, ChevronRight, Star } from 'lucide-react';
import type { VisitFilters } from '@/features/visits/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

// 拡張されたフィルター型（評価フィルター追加）
interface ExtendedVisitFilters extends VisitFilters {
  minRating?: number;
}

interface VisitFiltersProps {
  onFiltersChange: (filters: ExtendedVisitFilters) => void;
  filters: ExtendedVisitFilters;
}

/**
 * 訪問履歴の検索・フィルターコンポーネント (改善版)
 * - 新規登録ボタンを削除（親コンポーネントに移動）
 * - 使用しないフィルターを非表示
 * - 評価フィルター（1-5星）を実装
 */
export const VisitFiltersComponent = ({ onFiltersChange, filters }: VisitFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLocationNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      locationName: e.target.value || undefined,
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      startDate: e.target.value ? new Date(e.target.value) : undefined,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      endDate: e.target.value ? new Date(e.target.value) : undefined,
    });
  };

  const handleRatingChange = (value: string) => {
    onFiltersChange({
      ...filters,
      minRating: value === 'all' ? undefined : parseInt(value),
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // 星評価の表示コンポーネント
  const RatingStars = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3 w-3",
            i < rating 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-muted-foreground"
          )}
        />
      ))}
    </div>
  );

  // アクティブなフィルター数を計算
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* メイン検索バー（新規登録ボタンを削除） */}
        <div className="flex gap-3 items-center mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="訪問先名で検索..."
              value={filters.locationName || ''}
              onChange={handleLocationNameChange}
              className="pl-10"
            />
            {filters.locationName && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => onFiltersChange({ ...filters, locationName: undefined })}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* フィルター展開ボタン */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <div className="w-full flex justify-between items-center p-0 h-auto cursor-pointer">
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">詳細フィルター</span>
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <span
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                >
                  クリア
                </span>
              )}
            </div>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <div className="space-y-4 pt-4 border-t">
              {/* 評価フィルターのみ表示（市区町村・カテゴリーは非表示） */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 評価フィルター */}
                <div className="space-y-2">
                  <Label htmlFor="rating-filter" className="text-sm font-medium">
                    評価
                  </Label>
                  <Select 
                    value={filters.minRating?.toString() || 'all'} 
                    onValueChange={handleRatingChange}
                  >
                    <SelectTrigger id="rating-filter">
                      <SelectValue placeholder="すべての評価" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">すべての評価</SelectItem>
                      <SelectItem value="5">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={5} />
                          <span className="text-xs text-muted-foreground">のみ</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="4">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={4} />
                          <span className="text-xs text-muted-foreground">以上</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="3">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={3} />
                          <span className="text-xs text-muted-foreground">以上</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="2">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={2} />
                          <span className="text-xs text-muted-foreground">以上</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="1">
                        <div className="flex items-center gap-2">
                          <RatingStars rating={1} />
                          <span className="text-xs text-muted-foreground">以上</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 日付フィルター */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date" className="text-sm font-medium">
                    開始日
                  </Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formatDateForInput(filters.startDate)}
                    onChange={handleStartDateChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date" className="text-sm font-medium">
                    終了日
                  </Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={formatDateForInput(filters.endDate)}
                    onChange={handleEndDateChange}
                  />
                </div>
              </div>

              {/* アクティブフィルター表示 */}
              {activeFiltersCount > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="text-sm text-muted-foreground">適用中:</span>
                  {filters.locationName && (
                    <Badge variant="secondary" className="gap-1">
                      検索: {filters.locationName}
                      <span
                        className="ml-1 cursor-pointer hover:bg-secondary-foreground/10 rounded-full w-3 h-3 flex items-center justify-center"
                        onClick={() => onFiltersChange({ ...filters, locationName: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  )}
                  {filters.minRating && (
                    <Badge variant="secondary" className="gap-1">
                      <RatingStars rating={filters.minRating} />
                      <span className="text-xs">以上</span>
                      <span
                        className="ml-1 cursor-pointer hover:bg-secondary-foreground/10 rounded-full w-3 h-3 flex items-center justify-center"
                        onClick={() => onFiltersChange({ ...filters, minRating: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  )}
                  {filters.startDate && (
                    <Badge variant="secondary" className="gap-1">
                      開始: {formatDateForInput(filters.startDate)}
                      <span
                        className="ml-1 cursor-pointer hover:bg-secondary-foreground/10 rounded-full w-3 h-3 flex items-center justify-center"
                        onClick={() => onFiltersChange({ ...filters, startDate: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  )}
                  {filters.endDate && (
                    <Badge variant="secondary" className="gap-1">
                      終了: {formatDateForInput(filters.endDate)}
                      <span
                        className="ml-1 cursor-pointer hover:bg-secondary-foreground/10 rounded-full w-3 h-3 flex items-center justify-center"
                        onClick={() => onFiltersChange({ ...filters, endDate: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </span>
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};
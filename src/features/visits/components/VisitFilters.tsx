'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Filter, Plus, X, ChevronDown, ChevronRight } from 'lucide-react';
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

interface VisitFiltersProps {
  onFiltersChange: (filters: VisitFilters) => void;
  filters: VisitFilters;
}

/**
 * 訪問履歴の検索・フィルターコンポーネント (shadcn/ui版)
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

  const clearFilters = () => {
    onFiltersChange({});
  };

  const formatDateForInput = (date?: Date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  // アクティブなフィルター数を計算
  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* メイン検索バー */}
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
          
          <Button asChild className="flex-shrink-0">
            <Link href="/visits/new">
              <Plus className="h-4 w-4 mr-2" />
              新規登録
            </Link>
          </Button>
        </div>

        {/* フィルター展開ボタン */}
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    clearFilters();
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  クリア
                </Button>
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-4">
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 市区町村フィルター（将来実装） */}
                <div className="space-y-2">
                  <Label htmlFor="city-filter" className="text-sm font-medium">
                    市区町村
                  </Label>
                  <Select disabled>
                    <SelectTrigger id="city-filter">
                      <SelectValue placeholder="全て（実装予定）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全て（実装予定）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 自由項目（将来実装） */}
                <div className="space-y-2">
                  <Label htmlFor="category-filter" className="text-sm font-medium">
                    カテゴリー
                  </Label>
                  <Select disabled>
                    <SelectTrigger id="category-filter">
                      <SelectValue placeholder="選択してください（実装予定）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">選択してください（実装予定）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 評価フィルター（将来実装） */}
                <div className="space-y-2">
                  <Label htmlFor="rating-filter" className="text-sm font-medium">
                    評価
                  </Label>
                  <Select disabled>
                    <SelectTrigger id="rating-filter">
                      <SelectValue placeholder="全て（実装予定）" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全て（実装予定）</SelectItem>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 ml-1"
                        onClick={() => onFiltersChange({ ...filters, locationName: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.startDate && (
                    <Badge variant="secondary" className="gap-1">
                      開始: {formatDateForInput(filters.startDate)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 ml-1"
                        onClick={() => onFiltersChange({ ...filters, startDate: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )}
                  {filters.endDate && (
                    <Badge variant="secondary" className="gap-1">
                      終了: {formatDateForInput(filters.endDate)}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 ml-1"
                        onClick={() => onFiltersChange({ ...filters, endDate: undefined })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
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
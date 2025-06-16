'use client';

import Link from 'next/link';
import { Calendar, MapPin, User, Trash2, Eye, Star } from 'lucide-react';
import type { VisitWithDetails } from '@/features/visits/types';
import { useDeleteVisit } from '@/features/visits/hooks/useVisits';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface VisitCardProps {
  visit: VisitWithDetails;
  index: number;
}

/**
 * 訪問履歴カードコンポーネント (表示専用版)
 * - 詳細表示・削除ボタン
 * - 編集ボタンは削除（管理画面で操作）
 * - DB上の実際のvisit_idを#番号として表示
 */
export const VisitCard = ({ visit, index }: VisitCardProps) => {
  const deleteVisit = useDeleteVisit();

  const handleDelete = async () => {
    if (window.confirm(`${visit.location.name}への訪問履歴を削除しますか？`)) {
      try {
        await deleteVisit.mutateAsync({ id: visit.id });
      } catch (error) {
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const getRatingStars = (rating?: number) => {
    if (!rating) return null;
    // データが既に1-5の範囲の場合はそのまま使用、10段階の場合は変換
    const normalizedRating = rating <= 5 ? rating : Math.ceil(rating / 2);
    const stars = Math.floor(normalizedRating);
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3 w-3",
                i < stars 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground ml-1">
          {normalizedRating}/5
        </span>
      </div>
    );
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* DB上の実際のvisit_idを表示 */}
            <Badge variant="secondary" className="text-xs font-mono">
              #{visit.id}
            </Badge>
            <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
              {visit.location.name}
            </h3>
          </div>
          {visit.photoCount > 0 && (
            <Badge variant="outline" className="text-xs">
              📷 {visit.photoCount}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 訪問日時 */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(visit.visitDate)}</span>
        </div>

        {/* 場所情報 */}
        {visit.location.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{visit.location.address}</span>
          </div>
        )}

        {/* 訪問者情報 */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {visit.user?.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {visit.user?.name || 'ユーザー不明'}
            </span>
          </div>
        </div>

        {/* 評価 */}
        {visit.rating && (
          <div className="flex items-center gap-2">
            {getRatingStars(visit.rating)}
          </div>
        )}

        {/* メモ（最初の80文字のみ表示） */}
        {visit.memo && (
          <div className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-md">
            <p className="line-clamp-2">
              {visit.memo.length > 80 
                ? `${visit.memo.substring(0, 80)}...` 
                : visit.memo
              }
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex justify-between items-center w-full">
          <Button asChild variant="default" size="sm" className="bg-amber-600 hover:bg-amber-700">
            <Link href={`/visits/${visit.id}`}>
              <Eye className="h-4 w-4 mr-1" />
              詳細を見る
            </Link>
          </Button>
          
          <Button
            onClick={handleDelete}
            disabled={deleteVisit.isPending}
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {deleteVisit.isPending ? '削除中...' : '削除'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
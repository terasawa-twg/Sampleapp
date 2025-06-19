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
  variant?: 'compact' | 'full';
  showDelete?: boolean;
}

/**
 * 訪問履歴カードコンポーネント (コンパクト/フル対応版)
 * - variant="compact": 1行レイアウト（VisitsList用）
 * - variant="full": フルカードレイアウト（グリッド用）
 * - showDelete: 削除ボタンの表示制御
 */
export const VisitCard = ({ 
  visit, 
  index, 
  variant = 'full',
  showDelete = true 
}: VisitCardProps) => {
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
    const normalizedRating = rating <= 5 ? rating : Math.ceil(rating / 2);
    const stars = Math.floor(normalizedRating);
    const iconSize = variant === 'compact' ? 'h-3 w-3' : 'h-3 w-3';
    
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {Array.from({length: 5}, (_, i) => (
            <Star
              key={i}
              className={cn(
                iconSize,
                i < stars 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        {variant === 'full' && (
          <span className="text-xs text-muted-foreground ml-1">
            {normalizedRating}/5
          </span>
        )}
      </div>
    );
  };

  // 🆕 コンパクトバージョン（現在のCompactVisitCardと同じデザイン）
  if (variant === 'compact') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* 左側：番号、場所名、基本情報 */}
            <div className="flex items-center gap-4 flex-1">
              {/* 番号 */}
              <div className="flex-shrink-0">
                <Badge variant="outline" className="font-mono text-sm w-8 h-8 rounded-full flex items-center justify-center">
                  {index}
                </Badge>
              </div>
              
              {/* 基本情報 */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-base text-foreground mb-1 truncate">
                  {visit.location.name}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(visit.visitDate)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{visit.user?.name ?? 'ユーザー不明'}</span>
                  </div>
                  {visit.rating && (
                    <div className="flex items-center gap-1">
                      {getRatingStars(visit.rating)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右側：アバター、詳細ボタン、削除ボタン */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* ユーザーアバター */}
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {visit.user?.name?.charAt(0) ?? 'U'}
                </AvatarFallback>
              </Avatar>

              {/* 詳細ボタン */}
              <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-1 text-xs">
                <Link href={`/visits/${visit.id}`}>
                  詳細
                </Link>
              </Button>

              {/* 削除ボタン（オプション） */}
              {showDelete && (
                <Button
                  onClick={handleDelete}
                  disabled={deleteVisit.isPending}
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 🔄 フルバージョン（既存のフルカードデザイン）
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 hover:scale-[1.01]">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(visit.visitDate)}</span>
        </div>

        {visit.location.address && (
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{visit.location.address}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {visit.user?.name?.charAt(0) ?? 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {visit.user?.name ?? 'ユーザー不明'}
            </span>
          </div>
        </div>

        {visit.rating && (
          <div className="flex items-center gap-2">
            {getRatingStars(visit.rating)}
          </div>
        )}

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
          
          {showDelete && (
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
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { 
  ArrowLeft, 
  Trash2,
  MapPin, 
  Calendar, 
  User, 
  Star, 
  Phone, 
  Mail, 
  FileText,
  Camera,
  Clock,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useVisitDetails } from '@/features/visits/hooks/useVisitDetails';
import { useDeleteVisit } from '@/features/visits/hooks/useVisits';
import { SimpleMap } from './VisitDetails/SimpleMap';
import { MediaSection } from './VisitDetails/MediaSection';
import { LocationInfo } from './VisitDetails/LocationInfo';
import { VisitHistory } from './VisitDetails/VisitHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/custom/separator';
import { cn } from '@/lib/utils';

interface VisitDetailsProps {
  visitId: number;
}

export const VisitDetails = ({ visitId }: VisitDetailsProps) => {
  const router = useRouter();
  const { visit, photos, locationVisits, isLoading, error } = useVisitDetails(visitId);
  const deleteVisit = useDeleteVisit();

  // デバウンス処理でtRPC重複実行エラーを軽減
  useEffect(() => {
    const timer = setTimeout(() => {
      // 何もしない（キャッシュ効果を期待）
    }, 100);
    return () => clearTimeout(timer);
  }, [visitId]);

  const handleDelete = async () => {
    if (window.confirm(`${visit?.locations?.name}への訪問履歴を削除しますか？`)) {
      try {
        await deleteVisit.mutateAsync({ id: visitId });
        router.push('/visits');
      } catch (error) {
        alert('削除に失敗しました。もう一度お試しください。');
      }
    }
  };

  const formatDate = (date: Date | string) => {
    return new Intl.DateTimeFormat('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
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
          {Array.from({length: 5}, (_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < stars 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-muted-foreground"
              )}
            />
          ))}
        </div>
        <span className="text-sm text-muted-foreground ml-2">
          {normalizedRating}/5
        </span>
      </div>
    );
  };

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

  //論理条件のため||(論理OR)を使用
  if (error || !visit) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Alert variant="destructive">
          <FileText className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>訪問履歴が見つかりません</strong>
                <p className="mt-1">指定された訪問履歴の詳細を取得できませんでした。</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/visits">
                  一覧に戻る
                </Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const locationData = visit.locations;
  const userData = visit.users_visits_created_byTousers;
  const visitDate = visit.visit_date;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/visits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              {/* IDと＃番号を一致させて表示 */}
              <span className="text-2xl text-muted-foreground font-mono">#{visitId}</span>
              {locationData?.name ?? '店舗名不明'}
            </h1>
            <p className="text-muted-foreground">訪問履歴詳細</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleDelete}
            disabled={deleteVisit.isPending}
            variant="destructive"
            size="sm"
          >
            {deleteVisit.isPending ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            {deleteVisit.isPending ? '削除中...' : '削除'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LocationInfo 
            locationData={{
              name: locationData?.name ?? '店舗名不明',
              address: locationData?.address,
              description: locationData?.description,
              latitude: locationData?.latitude ? Number(locationData.latitude) : undefined,
              longitude: locationData?.longitude ? Number(locationData.longitude) : undefined,
            }} 
            visitId={visitId} 
          />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                訪問詳細
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="font-medium text-sm">訪問日時</span>
                    <p className="text-muted-foreground text-sm">
                      {visitDate ? formatDate(visitDate) : '日時不明'}
                    </p>
                  </div>
                </div>
                
                {visit.rating && (
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="font-medium text-sm">評価</span>
                      <div className="mt-1">
                        {getRatingStars(visit.rating)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {visit.notes && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium text-sm">メモ</span>
                    <p className="text-muted-foreground text-sm mt-1 leading-relaxed">
                      {visit.notes}
                    </p>
                  </div>
                </>
              )}

              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {userData?.username?.charAt(0) ?? 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">訪問者</span>
                    <p className="text-muted-foreground text-sm">
                      {userData?.username ?? 'ユーザー不明'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <MediaSection photos={photos} />
        </div>

        <VisitHistory 
          locationVisits={locationVisits}
          currentVisitId={visitId}
          currentVisitDate={visitDate}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};
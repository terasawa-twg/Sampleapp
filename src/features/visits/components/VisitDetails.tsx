'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
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
  RefreshCw
} from 'lucide-react';
import { useVisitDetails } from '@/features/visits/hooks/useVisitDetails';
import { useDeleteVisit } from '@/features/visits/hooks/useVisits';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface VisitDetailsProps {
  visitId: number;
}

/**
 * 訪問履歴詳細ページのメインコンポーネント (shadcn/ui版)
 */
export const VisitDetails = ({ visitId }: VisitDetailsProps) => {
  const router = useRouter();
  const { visit, photos, locationVisits, isLoading, error } = useVisitDetails(visitId);
  const deleteVisit = useDeleteVisit();

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
    const stars = Math.floor(rating / 2);
    return (
      <div className="flex items-center gap-1">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
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
          {rating}/10
        </span>
      </div>
    );
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

  // APIデータ構造に対応するための安全なアクセス
  const locationData = visit.locations;
  const userData = visit.users_visits_created_byTousers;
  const visitDate = visit.visit_date;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/visits">
              <ArrowLeft className="h-4 w-4 mr-2" />
              一覧に戻る
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {locationData?.name || '店舗名不明'}
            </h1>
            <p className="text-muted-foreground">訪問履歴詳細</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/visits/${visitId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              編集
            </Link>
          </Button>
          <Button 
            onClick={handleDelete}
            disabled={deleteVisit.isPending}
            variant="destructive"
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
        {/* メイン情報 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 店舗情報 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                店舗情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="font-medium">電話番号</span>
                      <p className="text-muted-foreground">未登録</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <span className="font-medium">郵便番号</span>
                      <p className="text-muted-foreground">100-0001</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-medium">所在地</span>
                      <p className="text-muted-foreground">
                        {locationData?.address || '住所未登録'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {locationData?.description && (
                <>
                  <Separator />
                  <div>
                    <span className="font-medium text-sm">概要</span>
                    <p className="text-muted-foreground text-sm mt-1">
                      {locationData.description}
                    </p>
                  </div>
                </>
              )}

              {/* 地図エリア */}
              <Separator />
              <div>
                <span className="font-medium text-sm mb-3 block">地図</span>
                <div className="w-full h-48 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                  <div className="text-center">
                    <MapPin className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground font-medium">地図表示エリア</p>
                    <p className="text-muted-foreground/70 text-xs mt-1">
                      Geolonia Maps連携予定
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 訪問詳細 */}
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

              {/* ユーザー情報 */}
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {userData?.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="font-medium text-sm">訪問者</span>
                    <p className="text-muted-foreground text-sm">
                      {userData?.username || 'ユーザー不明'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* メディア */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                アップロードされたメディア
                {photos && photos.length > 0 && (
                  <Badge variant="secondary">{photos.length}枚</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!photos || photos.length === 0 ? (
                <div className="text-center py-8">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">アップロードされたメディアはありません</p>
                  <p className="text-muted-foreground/70 text-sm mt-1">
                    写真や動画をアップロードして訪問記録を充実させましょう
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.photo_id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden">
                        <img
                          src={photo.file_path}
                          alt={`訪問時の写真 ${photo.description || ''}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{photos.length}枚のファイルがアップロードされています</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* サイドバー（動的な訪問履歴） */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                訪問履歴
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 過去の訪問履歴（DBから取得） */}
                {locationVisits.map((pastVisit) => (
                  <div key={pastVisit.visit_id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="font-medium text-sm text-muted-foreground">
                      {formatDate(pastVisit.visit_date).split(' ')[0]}
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                      {formatDate(pastVisit.visit_date).split(' ').slice(1).join(' ')}
                    </div>
                    {pastVisit.notes && (
                      <div className="text-xs text-muted-foreground/70 mt-1 line-clamp-1">
                        {pastVisit.notes}
                      </div>
                    )}
                  </div>
                ))}
                
                {/* 現在の訪問 */}
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="font-medium text-sm">
                    {visitDate ? formatDate(visitDate).split(' ')[0] : '日時不明'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {visitDate ? formatDate(visitDate).split(' ').slice(1).join(' ') : ''}
                  </div>
                  <Badge variant="secondary" className="mt-1">
                    現在の訪問
                  </Badge>
                </div>
                
                {/* 訪問履歴が1件もない場合 */}
                {locationVisits.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    この場所への過去の訪問履歴はありません
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
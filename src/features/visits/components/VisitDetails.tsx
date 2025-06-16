'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useEffect, useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// 🗺️ ピン表示対応の地図コンポーネント
const SimpleMap = ({ 
  latitude, 
  longitude, 
  visitId 
}: { 
  latitude?: number; 
  longitude?: number; 
  visitId?: number;
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState('読み込み中...');

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((window as any).geolonia && (window as any).geolonia.Map && mapRef.current) {
        try {
          // 環境変数からAPIキーを取得
          const apiKey = process.env.NEXT_PUBLIC_GEOLONIA_API_KEY;
          
          if (!apiKey) {
            console.error('❌ NEXT_PUBLIC_GEOLONIA_API_KEY が設定されていません');
            setMapStatus('APIキー未設定エラー');
            return;
          }
          
          console.log('🔑 APIキー読み込み完了');
          console.log('🌐 現在のURL:', window.location.href);
          
          const centerLng = longitude || 139.7671;
          const centerLat = latitude || 35.6812;
          
          const map = new (window as any).geolonia.Map({
            container: mapRef.current,
            center: [centerLng, centerLat],
            zoom: 16,
            apiKey: apiKey,
            // 地図の操作を制限してピンが動かないようにする
            dragPan: true,      // パンは許可
            scrollZoom: true,   // ズームは許可
            boxZoom: false,     // ボックスズームは無効
            doubleClickZoom: true, // ダブルクリックズームは許可
            keyboard: true,     // キーボード操作は許可
            touchZoomRotate: true // タッチズームは許可
          });
          
          map.on('load', () => {
            setMapStatus('地図表示成功');
            
            // ピンを追加（固定マーカー）
            if (latitude && longitude) {
              // カスタムマーカー要素を作成
              const markerElement = document.createElement('div');
              markerElement.className = 'custom-marker';
              markerElement.innerHTML = `
                <div style="
                  background-color: #ef4444;
                  color: white;
                  border-radius: 50% 50% 50% 0;
                  width: 24px;
                  height: 24px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 12px;
                  font-weight: bold;
                  border: 2px solid white;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                  transform: rotate(-45deg);
                  cursor: pointer;
                ">
                  <span style="transform: rotate(45deg);">#${visitId || '?'}</span>
                </div>
              `;
              
              // マーカーを地図に追加
              new (window as any).geolonia.Marker({
                element: markerElement,
                draggable: false, // ドラッグ無効でピンを固定
              })
              .setLngLat([longitude, latitude])
              .addTo(map);
              
              console.log(`📍 ピン追加完了: #${visitId} at [${longitude}, ${latitude}]`);
            }
          });
          
          map.on('error', (e: any) => {
            console.error('地図エラー:', e);
            setMapStatus('地図表示エラー');
          });
          
        } catch (error) {
          console.error('地図初期化エラー:', error);
          setMapStatus('地図初期化エラー');
        }
      } else {
        setMapStatus('Geoloniaライブラリ未読み込み');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [latitude, longitude, visitId]);

  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '240px' }}
        className="rounded-lg border shadow-sm bg-gray-100"
      />
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-muted-foreground">
          状態: {mapStatus}
        </p>
        {latitude && longitude && visitId && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
            <span>#{visitId} のピン表示中</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface VisitDetailsProps {
  visitId: number;
}

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
              {locationData?.name || '店舗名不明'}
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

              <Separator />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium text-sm flex items-center gap-2">
                    地図
                    {locationData?.latitude && locationData?.longitude && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        #{visitId} ピン表示
                      </Badge>
                    )}
                  </span>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    {locationData?.latitude && locationData?.longitude ? (
                      <>
                        <Badge variant="outline" className="text-xs">
                          緯度: {Number(locationData.latitude).toFixed(6)}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          経度: {Number(locationData.longitude).toFixed(6)}
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        デフォルト位置（東京駅）
                      </Badge>
                    )}
                  </div>
                </div>
                
                <SimpleMap
                  latitude={locationData?.latitude ? Number(locationData.latitude) : undefined}
                  longitude={locationData?.longitude ? Number(locationData.longitude) : undefined}
                  visitId={visitId}
                />
              </div>
            </CardContent>
          </Card>

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
                    メディアが登録されていません
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

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                訪問履歴
                {locationVisits.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    {locationVisits.length + 1}件
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* 🔗 過去の訪問履歴をクリック可能なリンクに変更 */}
                {locationVisits.map((pastVisit) => (
                  <Link 
                    key={pastVisit.visit_id} 
                    href={`/visits/${pastVisit.visit_id}`}
                    className="block p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors group cursor-pointer border hover:border-muted-foreground/20"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-muted-foreground font-mono">
                            #{pastVisit.visit_id}
                          </span>
                          <div className="font-medium text-sm text-muted-foreground">
                            {formatDate(pastVisit.visit_date).split(' ')[0]}
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-0.5">
                          {formatDate(pastVisit.visit_date).split(' ').slice(1).join(' ')}
                        </div>
                        {pastVisit.notes && (
                          <div className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 leading-relaxed">
                            {pastVisit.notes}
                          </div>
                        )}
                      </div>
                      {/* ホバー時に外部リンクアイコンを表示 */}
                      <ExternalLink className="h-3 w-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1 ml-2" />
                    </div>
                  </Link>
                ))}
                
                {/* 現在の訪問（リンクなし） */}
                <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm font-mono">#{visitId}</span>
                    <div className="font-medium text-sm">
                      {visitDate ? formatDate(visitDate).split(' ')[0] : '日時不明'}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {visitDate ? formatDate(visitDate).split(' ').slice(1).join(' ') : ''}
                  </div>
                  <Badge variant="secondary" className="mt-2 text-xs">
                    現在の訪問
                  </Badge>
                </div>
                
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
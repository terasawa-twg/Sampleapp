'use client';

import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/custom/separator';
import { SimpleMap } from './SimpleMap';

interface LocationData {
  name: string;
  address?: string;
  description?: string;
  latitude?: number | string | any; // Decimal型対応
  longitude?: number | string | any; // Decimal型対応
}

interface LocationInfoProps {
  locationData?: LocationData;
  visitId: number;
}

/**
 * 🏪 店舗情報コンポーネント
 * 店舗の基本情報と地図を表示
 */
export const LocationInfo = ({ locationData, visitId }: LocationInfoProps) => {
  return (
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
                  {locationData?.address ?? '住所未登録'}
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
  );
};
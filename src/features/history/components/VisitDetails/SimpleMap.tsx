'use client';

import { useRef, useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

interface SimpleMapProps {
  latitude?: number;
  longitude?: number;
  visitId?: number;
}

/**
 * 🗺️ ピン表示対応の地図コンポーネント
 * Geolonia Maps APIを使用して訪問場所にピンを表示
 */
export const SimpleMap = ({ latitude, longitude, visitId }: SimpleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapStatus, setMapStatus] = useState('読み込み中...');

  useEffect(() => {
    const timer = setTimeout(() => {
      // ESLint対応：windowオブジェクトのgeoloniaプロパティにアクセス
      const geoloniaWindow = window as unknown as { 
        geolonia?: { 
          Map: new (options: Record<string, unknown>) => {
            on: (event: string, callback: (error?: Error) => void) => void;
          };
          Marker: new (options: Record<string, unknown>) => {
            setLngLat: (coords: [number, number]) => {
              addTo: (map: unknown) => void;
            };
          };
        }; 
      };
      
      if (geoloniaWindow.geolonia?.Map && mapRef.current) {
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
          
          const centerLng = longitude ?? 139.7671;
          const centerLat = latitude ?? 35.6812;
          
          const map = new geoloniaWindow.geolonia.Map({
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
            if (latitude && longitude && geoloniaWindow.geolonia?.Marker) {
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
                  <span style="transform: rotate(45deg);">#${visitId ?? '?'}</span>
                </div>
              `;
              
              // マーカーを地図に追加
              const marker = new geoloniaWindow.geolonia.Marker({
                element: markerElement,
                draggable: false, // ドラッグ無効でピンを固定
              });
              marker.setLngLat([longitude, latitude]).addTo(map);
              
              console.log(`📍 ピン追加完了: #${visitId} at [${longitude}, ${latitude}]`);
            }
          });
          
          map.on('error', (error?: Error) => {
            console.error('地図エラー:', error);
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
// src/features/map/hooks/useMapInitialization.ts

import { useRef, useEffect, useState, useCallback } from 'react';
import type { GeoloniaMap, GeoloniaMapEvent, HeartRailsGeoAPIResponse, GeoloniaMarker } from '../types/geolonia.types';

interface UseMapInitializationProps {
  disableNewMarker?: boolean;
  onMapError?: (error: Error) => void;
}

// Window オブジェクトの型拡張
declare global {
  interface Window {
    geoloniamap?: unknown;
    Geolonia?: unknown;
    geoloniaEmbed?: {
      Map?: unknown;
      Marker?: unknown;
      SimpleStyle?: unknown;
      embedVersion?: unknown;
      geolonia?: unknown;
    };
  }
}

export const useMapInitialization = ({
  disableNewMarker = false,
  onMapError
}: UseMapInitializationProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GeoloniaMap | null>(null);
  const markerRef = useRef<GeoloniaMarker | null>(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isDomReady, setIsDomReady] = useState(false);

  // 地図クリックイベントハンドラー
  const handleMapClick = useCallback((e: GeoloniaMapEvent) => {
    console.log('地図がクリックされました:', e.lngLat);
    const processClick = async () => {
      try {
        const { lng, lat } = e.lngLat;
        
        // 既存のマーカーを削除
        if (markerRef.current) {
          markerRef.current.remove();
        }
        
        // mapRef.currentがnullでないことを確認
        if (!mapRef.current) {
          console.warn('地図が初期化されていません');
          return;
        }
        
        // 新しいマーカーを追加
        if (!window.geolonia?.Marker) {
          console.error('window.geolonia.Marker が利用できません');
          return;
        }

        markerRef.current = new window.geolonia.Marker()
          .setLngLat([lng, lat])
          .addTo(mapRef.current);

        console.log('新規マーカーを作成しました:', { lng, lat });

        // 逆ジオコーディング（既存機能を維持）
        const res = await fetch(
          `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`
        );
        
        if (!res.ok) {
          throw new Error('逆ジオコーディングAPIのリクエストに失敗しました');
        }
        
        const data = (await res.json()) as HeartRailsGeoAPIResponse;
        const loc = data.response.location[0];
        
        if (loc) {
          console.log(`住所: ${loc.prefecture}${loc.city}${loc.town} (${loc.postal})`);
        } else {
          console.log('該当住所が見つかりませんでした');
        }
      } catch (error) {
        console.warn('逆ジオコーディング処理でエラーが発生しました:', error);
      }
    };

    void processClick();
  }, []);

  // DOM要素の準備を待つ
  useEffect(() => {
    console.log('DOM準備チェック開始');
    const checkDomReady = () => {
      if (mapContainerRef.current) {
        console.log('DOM要素が準備できました');
        setIsDomReady(true);
      } else {
        console.log('DOM要素未準備、再チェック中...');
        setTimeout(checkDomReady, 50);
      }
    };
    
    // 初回チェック
    checkDomReady();
  }, []);

  // 地図初期化（DOM準備完了後）
  useEffect(() => {
    if (!isDomReady) {
      console.log('DOM未準備のため地図初期化をスキップ');
      return;
    }
    
    console.log('GeoloniaMap: 地図初期化開始', {
      mapContainer: !!mapContainerRef.current,
      disableNewMarker,
      isDomReady
    });

    if (!mapContainerRef.current) {
      console.error('DOM準備完了後もmapContainerRef.currentが存在しません');
      return;
    }

    let retryCount = 0;
    const maxRetries = 20;

    const initializeMap = () => {
      console.log('地図初期化試行:', retryCount + 1);
      console.log('利用可能なGeolonia関連:', Object.keys(window).filter(key => key.toLowerCase().includes('geolonia')));
      console.log('window.geolonia:', !!window.geolonia);
      console.log('window.geoloniamap:', !!window.geoloniamap);
      console.log('window.Geolonia:', !!window.Geolonia);
      
      // 実際の構造を確認
      if (window.geolonia) {
        console.log('window.geolonia の構造:', Object.keys(window.geolonia));
        console.log('window.geolonia.Map:', window.geolonia.Map);
        console.log('window.geolonia.Marker:', window.geolonia.Marker);
        console.log('window.geolonia 全体:', window.geolonia);
      }
      
      // geoloniaEmbed も確認
      if (window.geoloniaEmbed) {
        console.log('window.geoloniaEmbed の構造:', Object.keys(window.geoloniaEmbed));
        console.log('window.geoloniaEmbed:', window.geoloniaEmbed);
      }

      try {
        if (!window.geolonia) {
          if (retryCount < maxRetries) {
            retryCount++;
            console.log('Geolonia API未読み込み。再試行中...', retryCount);
            setTimeout(initializeMap, 200);
            return;
          }
          throw new Error('Geolonia Maps APIの読み込みに失敗しました');
        }

        console.log('Geolonia API読み込み完了。地図を作成中...');

        if (mapRef.current) {
          console.log('既存の地図を削除中...');
          mapRef.current.remove();
        }

        // mapContainerRef.currentがnullでないことを確認
        if (!mapContainerRef.current) {
          throw new Error('地図コンテナが見つかりません');
        }

        console.log('新しい地図を作成中...', {
          center: [139.6917, 35.6895],
          zoom: 12,
          disableNewMarker,
          apiKey: !!process.env.NEXT_PUBLIC_GEOLONIA_API_KEY
        });

        mapRef.current = new window.geolonia.Map({
          container: mapContainerRef.current,
          center: [139.6917, 35.6895], // 東京エリア
          zoom: 12,
          marker: false,
          apiKey: process.env.NEXT_PUBLIC_GEOLONIA_API_KEY,
        });

        console.log('地図作成完了:', mapRef.current);

        // 地図のスタイルを設定（必要に応じて）
        if (!disableNewMarker) {
          console.log('地図クリックイベントを登録（新規マーカー作成有効）');
          mapRef.current.on('click', handleMapClick);
        } else {
          console.log('地図クリックイベントをスキップ（新規マーカー作成無効）');
        }

        // 地図の初期化完了を通知
        setTimeout(() => {
          setMapInitialized(true);
          setMapError(null);
          console.log('地図初期化完了');
        }, 1000);

      } catch (err) {
        console.error('地図初期化エラー:', err);
        const errorMessage = err instanceof Error ? err.message : '地図の初期化に失敗しました';
        setMapError(errorMessage);
        onMapError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    initializeMap();

    return () => {
      console.log('GeoloniaMap: クリーンアップ開始');
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      setMapInitialized(false);
      console.log('GeoloniaMap: クリーンアップ完了');
    };
  }, [isDomReady, onMapError, disableNewMarker, handleMapClick]);

  return {
    mapContainerRef,
    mapRef,
    mapInitialized,
    mapError,
    isDomReady
  };
};
'use client';

import { useRef, useEffect } from 'react';
// import { openReverseGeocoder } from '@geolonia/open-reverse-geocoder';

// Geoloniaのグローバル型定義
declare global {
    // window.geoloniaは、GeoloniaのUMDスクリプトで提供されるグローバル変数
    interface Window {
        geolonia: {        
        Map: new (options: any) => any;
        Marker: new () => any;
        }
    }
}

export default function GeoloniaMapVanilla() {
    // useRef： https://ja.react.dev/reference/react/useRef
    // 地図を描画するDOM要素
    // mapContainerRef=HTMLのdiv要素（もしくは最初はnull）を保持する箱として使う
    const mapContainerRef = useRef<HTMLDivElement | null>(null);
    // クリックで作成されたマーカーを保持（再利用や削除に使用）
    const markerRef = useRef<any>(null);

    // useEffect: https://ja.react.dev/reference/react/useEffect
    useEffect(() => {
        let map: any = null;

        // 初期化関数を定義
        function initialize() {
        if (!window.geolonia || !mapContainerRef.current) {
            // geolonia未ロードなら再試行。window.geoloniaがロードされるのを待つ
            // 地図が読み込まれなければ、地図要素の指定やイベントリスナーを登録できないため
            setTimeout(initialize, 100);
            return;
        }

        // 地図の要素・・・mapContainerRef.currentが参照している<div>要素の中に、Geoloniaの地図を描画させる
        map = new window.geolonia.Map({
            container: mapContainerRef.current,
            center: [140.88118916, 38.26062846],
            zoom: 16,
            marker: false,
            apiKey: process.env.NEXT_PUBLIC_GEOLONIA_API_KEY,
        });

        // クリックイベント
        map.on('click', async (e: any) => {
            const { lng, lat } = e.lngLat;
            // マーカーがすでにあるときは消す
            if (markerRef.current) {
            markerRef.current.remove();
            }
            // マーカーをクリックした緯度経度にセットし、mapに加える
            markerRef.current = new window.geolonia.Marker()
            .setLngLat([lng, lat])
            .addTo(map);

            // 逆ジオコーダー（市区町村まで）
            // const result = await openReverseGeocoder([lng, lat]);
            // console.log(result);

            // HeartRails Geo APIで逆ジオコーディング（丁目まで。番地情報は有料APIのGoogle Maps Geocoding APIとか・・・）
            const res = await fetch(
                `https://geoapi.heartrails.com/api/json?method=searchByGeoLocation&x=${lng}&y=${lat}`
            );
            const data = await res.json();

            // 町域情報をコンソールに出す
            if (
                data.response &&
                Array.isArray(data.response.location) &&
                data.response.location.length > 0
            ){
                const loc = data.response.location[0];
                console.log(
                    `${loc.prefecture}${loc.city}${loc.town} (${loc.postal})`
                );
            } else {
                console.log('該当住所が見つかりませんでした');
            }
        });
        }

        initialize();

        // 副作用のクリーンアップのときに使う（コンポーネントのアンマウント時とか、再実行の直前とか）
        // 今ある地図を消去する（地図の重複を防ぐ）
        return () => {
            if (map) map.remove();
        };
        // 依存配列は今回は未指定
    }, []);

    return (
        <div
        ref={mapContainerRef}
        style={{ width: '100vw', height: '100vh' }}
        />
    );
}

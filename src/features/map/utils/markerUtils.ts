// src/features/map/utils/markerUtils.ts
// マーカーの見た目を更新するユーティリティ関数

import type { GeoloniaMarker } from "../types/geolonia.types";

// locationの型を定義
interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// マーカーの見た目だけを更新する関数
export const updateMarkerAppearance = (
  marker: GeoloniaMarker,
  location: LocationData,
  selectedLocationId?: string | null,
) => {
  try {
    let markerElement: HTMLElement | null = null;

    if (typeof marker.getElement === "function") {
      markerElement = marker.getElement();
    } else if (marker._element) {
      markerElement = marker._element;
    }

    if (!markerElement) {
      console.warn(`マーカー要素が取得できません: ${location.name}`);
      return;
    }

    const isSelected = selectedLocationId === location.id;
    console.log(
      `マーカー表示更新: ${location.name} - ${isSelected ? "選択" : "非選択"}`,
    );

    const svg = markerElement.querySelector("svg");
    if (svg) {
      const scale = isSelected ? 1.2 : 1;
      svg.style.transform = `scale(${scale})`;
      svg.style.transformOrigin = "center bottom";

      const paths = svg.querySelectorAll("path");
      paths.forEach((path, index) => {
        if (isSelected) {
          const redColors = ["#ef4444", "#dc2626", "#b91c1c"];
          const color = redColors[index] ?? "#ef4444";
          path.style.setProperty("fill", color, "important");
        } else {
          const blueColors = ["#3b82f6", "#2563eb", "#1d4ed8"];
          const color = blueColors[index] ?? "#3b82f6";
          path.style.setProperty("fill", color, "important");
        }
      });

      svg.style.setProperty(
        "fill",
        isSelected ? "#ef4444" : "#3b82f6",
        "important",
      );
    }
  } catch (err) {
    console.warn(`マーカー表示更新エラー (${location.name}):`, err);
  }
};

// マーカーのセットアップ
export const setupMarker = (
  marker: GeoloniaMarker,
  location: LocationData,
  onLocationClick?: (locationId: string) => void,
) => {
  console.log("マーカーセットアップ開始:", location.name);
  try {
    let markerElement: HTMLElement | null = null;

    // より確実な方法でマーカー要素を取得
    if (typeof marker.getElement === "function") {
      markerElement = marker.getElement();
      console.log("getElement()でマーカー要素を取得");
    } else if (marker._element) {
      markerElement = marker._element;
      console.log("_elementでマーカー要素を取得");
    }

    // DOM要素が取得できない場合は再試行
    if (!markerElement) {
      console.warn(
        `マーカー要素を取得できませんでした。再試行します: ${location.name}`,
      );
      setTimeout(() => setupMarker(marker, location, onLocationClick), 100);
      return;
    }

    // 初期設定は常に非選択状態（青色、通常サイズ）
    console.log(`マーカー初期設定: ${location.name} - 非選択状態`);

    // マーカーの色とサイズを設定
    const svg = markerElement.querySelector("svg");
    if (svg) {
      svg.style.transform = "scale(1)";
      svg.style.transformOrigin = "center bottom";

      const paths = svg.querySelectorAll("path");
      paths.forEach((path, index) => {
        const blueColors = ["#3b82f6", "#2563eb", "#1d4ed8"];
        const color = blueColors[index] ?? "#3b82f6";
        path.style.setProperty("fill", color, "important");
      });

      svg.style.setProperty("fill", "#3b82f6", "important");
      console.log(`マーカー設定完了: ${location.name} - 色:青, サイズ:1倍`);
    } else {
      console.log(`SVGが見つかりません。マーカー全体を設定: ${location.name}`);

      markerElement.style.color = "#3b82f6";
      markerElement.style.setProperty("color", "#3b82f6", "important");
      markerElement.style.transform = "scale(1)";
      markerElement.style.transformOrigin = "center bottom";

      // 子要素にも適用
      const childElements = markerElement.querySelectorAll("*");
      childElements.forEach((child) => {
        if (child instanceof HTMLElement) {
          child.style.setProperty("fill", "#3b82f6", "important");
          child.style.setProperty("color", "#3b82f6", "important");
        }
      });

      console.log(`マーカー全体設定: ${location.name} - 色:青, サイズ:1倍`);
    }

    // クリックイベントを設定（初回のみ）
    if (onLocationClick && !marker._clickHandlerSet) {
      const clickHandler = (e: Event) => {
        console.log("マーカーがクリックされました:", location.name);
        e.stopPropagation();
        onLocationClick(location.id);
      };

      markerElement.addEventListener("click", clickHandler);
      marker._clickHandler = clickHandler;
      marker._clickHandlerSet = true;

      markerElement.style.cursor = "pointer";
      markerElement.setAttribute("title", location.name);
      console.log("マーカーにクリックイベントを設定");
    }

    console.log("マーカーセットアップ完了:", location.name);
  } catch (err) {
    console.warn(
      `マーカーのセットアップでエラーが発生しました (${location.name}):`,
      err,
    );
  }
};

// マーカーのクリーンアップ
export const cleanupMarkers = (
  markers: GeoloniaMarker[],
  mapContainerRef: React.RefObject<HTMLDivElement | null>,
) => {
  // 既存のマーカーをクリーンアップ
  console.log("既存マーカーをクリーンアップ中...", markers.length, "個");
  markers.forEach((marker, index) => {
    try {
      marker.remove();
      console.log(`マーカー${index + 1}を削除しました`);
    } catch (err) {
      console.warn("マーカーの削除でエラーが発生しました:", err);
    }
  });

  // DOM上の残存マーカーも削除
  const existingMarkers =
    mapContainerRef.current?.querySelectorAll(".geolonia-marker");
  if (existingMarkers && existingMarkers.length > 0) {
    console.log("DOM上の残存マーカーを削除中...", existingMarkers.length, "個");
    existingMarkers.forEach((marker, index) => {
      try {
        marker.remove();
        console.log(`残存マーカー${index + 1}を削除しました`);
      } catch (err) {
        console.warn("残存マーカーの削除でエラーが発生しました:", err);
      }
    });
  }
};

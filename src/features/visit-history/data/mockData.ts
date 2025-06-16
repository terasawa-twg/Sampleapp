import { toast } from "sonner";
import type { VisitLocation, CreateVisitData } from '../types/index';
import { visitHistoryService } from '../services/visitHistoryService';

// ダミーデータの訪問先リスト
export const mockVisitLocations: VisitLocation[] = [
  {
    location_id: 1,
    name: 'ABCD商店',
    latitude: 35.6762,
    longitude: 139.6503,
    address: '東京都渋谷区渋谷1-1-1',
    description: '老舗の商店です'
  },
  {
    location_id: 2,
    name: '株式会社サンプル',
    latitude: 35.6896,
    longitude: 139.6917,
    address: '東京都新宿区新宿2-2-2',
    description: 'IT企業です'
  },
  {
    location_id: 3,
    name: 'いろはマート',
    latitude: 35.7286,
    longitude: 139.7185,
    address: '東京都豊島区南池袋3-3-3',
    description: 'スーパーマーケットです'
  },
  {
    location_id: 4,
    name: 'デパート田中',
    latitude: 35.6580,
    longitude: 139.7016,
    address: '東京都港区六本木4-4-4',
    description: '百貨店です'
  },
  {
    location_id: 5,
    name: '山田商店',
    latitude: 35.6938,
    longitude: 139.7036,
    address: '東京都新宿区歌舞伎町5-5-5',
    description: '雑貨店です'
  }
];

// 実際のAPI呼び出しサービス
export const createVisitService = {
  mutateAsync: async (data: CreateVisitData) => {
    try {
      console.log('送信データ:', data);
      
      // 実際のAPI呼び出し
      const result = await visitHistoryService.create(data);
      
      // 成功時のトースト
      toast.success("訪問履歴が登録されました！", {
        description: `${data.location_name} の訪問履歴を登録しました`,
        duration: 4000,
      });
      
      return result;
    } catch (error) {
      console.error('登録エラー:', error);
      // エラーを再スローしてフォーム側でキャッチ
      throw error;
    }
  },
  isPending: false // TODO: 実際のloading状態を管理
};
import type { VisitLocation, LocationApiResponse } from '../types';

// 訪問先API サービス
export const locationApi = {
  // 訪問先一覧を取得
  async getAll(): Promise<LocationApiResponse> {
    try {
      // 現在はモックデータを返す（シンプルな実装）
      await new Promise(resolve => setTimeout(resolve, 500)); // 0.5秒の遅延
      
      const mockLocations: VisitLocation[] = [
        {
          id: '1',
          name: 'ABC商店',
          lat: 35.6762,
          lng: 139.6503,
          category: '商店',
          isActive: false
        },
        {
          id: '2',
          name: 'XYZ商店',
          lat: 35.6812,
          lng: 139.6587,
          category: '商店',
          isActive: false
        },
        {
          id: '3',
          name: '株式会社サンプル',
          lat: 35.6895,
          lng: 139.6917,
          category: '企業',
          isActive: true
        }
      ];

      console.log('locationApi.getAll: 成功', mockLocations.length, '件');
      
      return {
        data: mockLocations,
        total: mockLocations.length,
      };
    } catch (error) {
      console.error('locationApi.getAll: エラー', error);
      throw new Error('訪問先データの取得に失敗しました');
    }
  },

  // 訪問先を作成
  async create(location: Omit<VisitLocation, 'id'>): Promise<VisitLocation> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Date.now().toString(),
      ...location,
    };
  },

  // 訪問先を更新
  async update(id: string, updates: Partial<VisitLocation>): Promise<VisitLocation> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const mockLocation: VisitLocation = {
      id,
      name: 'Updated Location',
      lat: 35.6762,
      lng: 139.6503,
      category: '商店',
      isActive: false,
      ...updates,
    };

    return mockLocation;
  },

  // 訪問先を削除
  async delete(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // 特定の訪問先を取得
  async getById(id: string): Promise<VisitLocation> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockLocation: VisitLocation = {
      id,
      name: 'Sample Location',
      lat: 35.6762,
      lng: 139.6503,
      category: '商店',
      isActive: false,
    };

    return mockLocation;
  },
};
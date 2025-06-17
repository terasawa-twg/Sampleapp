import type { VisitLocation, LocationApiResponse } from '@/features/map/types';

// 訪問先API サービス
export const locationApi = {
  // 訪問先一覧を取得
  async getAll(): Promise<LocationApiResponse> {
    // TODO: 実際のAPI呼び出しに置き換える
    // const response = await fetch('/api/locations');
    // if (!response.ok) throw new Error('Failed to fetch locations');
    // return response.json();

    // 現在はモックデータを返す
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

    return {
      data: mockLocations,
      total: mockLocations.length,
    };
  },

  // 訪問先を作成
  async create(location: Omit<VisitLocation, 'id'>): Promise<VisitLocation> {
    // TODO: 実際のAPI呼び出しに置き換える
    // const response = await fetch('/api/locations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(location),
    // });
    // if (!response.ok) throw new Error('Failed to create location');
    // return response.json();

    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      id: Date.now().toString(),
      ...location,
    };
  },

  // 訪問先を更新
  async update(id: string, updates: Partial<VisitLocation>): Promise<VisitLocation> {
    // TODO: 実際のAPI呼び出しに置き換える
    // const response = await fetch(`/api/locations/${id}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(updates),
    // });
    // if (!response.ok) throw new Error('Failed to update location');
    // return response.json();

    await new Promise(resolve => setTimeout(resolve, 500));
    
    // モックデータの場合は、更新されたデータを返す
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
    // TODO: 実際のAPI呼び出しに置き換える
    // const response = await fetch(`/api/locations/${id}`, {
    //   method: 'DELETE',
    // });
    // if (!response.ok) throw new Error('Failed to delete location');

    await new Promise(resolve => setTimeout(resolve, 500));
  },

  // 特定の訪問先を取得
  async getById(id: string): Promise<VisitLocation> {
    // TODO: 実際のAPI呼び出しに置き換える
    // const response = await fetch(`/api/locations/${id}`);
    // if (!response.ok) throw new Error('Failed to fetch location');
    // return response.json();

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
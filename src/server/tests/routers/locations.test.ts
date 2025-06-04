import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext, createLocationsCaller, createMockSession } from '../helpers/trpc';

// dbをモック
vi.mock('../../db', () => ({
  db: {
    locations: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import { db } from '../../db';


// 実際のルーターの戻り値に基づく型定義
type Location = {
  location_id: number;
  name: string;
  latitude: any; // Decimalは使わずanyで代替
  longitude: any; // Decimalは使わずanyで代替
  address: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  // include関係の型
  users_locations_created_byTousers?: any;
  users_locations_updated_byTousers?: any;
  _count?: any;
  visits?: any[];
};

describe('Locations Router', () => {
  let caller: ReturnType<typeof createLocationsCaller>;
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSession = createMockSession('1', 'test@example.com');
    const ctx = await createTestContext(mockSession);
    caller = createLocationsCaller(ctx);
  });

  describe('getAll', () => {
    it('should return all locations with includes', async () => {
      // Arrange
      const mockLocations: Location[] = [
        { 
          location_id: 1, 
          name: 'Tokyo Tower', 
          latitude: 35.65858270,
          longitude: 139.74542700,
          address: 'Tokyo Address 1',
          description: 'Famous tower in Tokyo',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          users_locations_created_byTousers: { username: 'testuser' },
          _count: { visits: 5 }
        }
      ];
      
      vi.mocked(db.locations.findMany).mockResolvedValue(mockLocations);

      // Act
      const result = await caller.getAll();

      // Assert
      expect(result).toEqual(mockLocations);
      expect(db.locations.findMany).toHaveBeenCalledWith({
        include: {
          users_locations_created_byTousers: {
            select: { username: true },
          },
          _count: {
            select: { visits: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return location by id with full includes', async () => {
      // Arrange
      const mockLocation: Location = { 
        location_id: 1, 
        name: 'Tokyo Tower', 
        latitude: 35.65858270,
        longitude: 139.74542700,
        address: 'Tokyo Address',
        description: 'Famous tower',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1,
        users_locations_created_byTousers: { username: 'creator' },
        users_locations_updated_byTousers: { username: 'updater' },
        visits: [
          {
            visit_id: 1,
            visit_date: new Date('2024-01-01'),
            users_visits_created_byTousers: { username: 'visitor' },
            visit_photos: []
          }
        ]
      };
      vi.mocked(db.locations.findUnique).mockResolvedValue(mockLocation);

      // Act
      const result = await caller.getById({ id: 1 });

      // Assert
      expect(result).toEqual(mockLocation);
      expect(db.locations.findUnique).toHaveBeenCalledWith({
        where: { location_id: 1 },
        include: {
          users_locations_created_byTousers: {
            select: { username: true },
          },
          users_locations_updated_byTousers: {
            select: { username: true },
          },
          visits: {
            include: {
              users_visits_created_byTousers: {
                select: { username: true },
              },
              visit_photos: true,
            },
            orderBy: { visit_date: 'desc' },
          },
        },
      });
    });

    it('should return null when location not found', async () => {
      // Arrange
      vi.mocked(db.locations.findUnique).mockResolvedValue(null);

      // Act
      const result = await caller.getById({ id: 999 });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new location', async () => {
      // Arrange - 実際のzodスキーマに合わせた必須フィールド
      const newLocationData = { 
        name: 'New Location', 
        latitude: 35.123456,
        longitude: 139.654321,
        address: 'New Address',
        description: 'New Description',
        created_by: 1
      };
      const createdLocation: Location = { 
        location_id: 1, 
        name: 'New Location', 
        latitude: 35.123456,
        longitude: 139.654321,
        address: 'New Address',
        description: 'New Description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1
      };
      
      vi.mocked(db.locations.create).mockResolvedValue(createdLocation);

      // Act
      const result = await caller.create(newLocationData);

      // Assert
      expect(result).toEqual(createdLocation);
      expect(db.locations.create).toHaveBeenCalledWith({
        data: {
          name: 'New Location',
          latitude: 35.123456,
          longitude: 139.654321,
          address: 'New Address',
          description: 'New Description',
          created_by: 1,
          updated_by: 1,
        },
      });
    });

    it('should throw error when name is empty', async () => {
      // Act & Assert
      await expect(caller.create({ 
        name: '', 
        latitude: 35.123456,
        longitude: 139.654321,
        address: 'Test Address',
        description: 'Test Description',
        created_by: 1
      })).rejects.toThrow('場所名は必須です');
    });

    it('should throw error when coordinates are out of range', async () => {
      // Act & Assert
      await expect(caller.create({ 
        name: 'Invalid Location', 
        latitude: 91, // Invalid latitude (> 90)
        longitude: 139.654321,
        address: 'Test Address',
        description: 'Test Description',
        created_by: 1
      })).rejects.toThrow('緯度は-90から90の間で入力してください');

      await expect(caller.create({ 
        name: 'Invalid Location', 
        latitude: 35.123456,
        longitude: 181, // Invalid longitude (> 180)
        address: 'Test Address',
        description: 'Test Description',
        created_by: 1
      })).rejects.toThrow('経度は-180から180の間で入力してください');
    });
  });

  describe('update', () => {
    it('should update existing location', async () => {
      // Arrange - 実際のzodスキーマに合わせた形式
      const updateData = { 
        id: 1, 
        name: 'Updated Location',
        latitude: 35.987654,
        longitude: 139.123456,
        address: 'Updated Address',
        description: 'Updated Description',
        updated_by: 1
      };
      const updatedLocation: Location = { 
        location_id: 1, 
        name: 'Updated Location', 
        latitude: 35.987654,
        longitude: 139.123456,
        address: 'Updated Address',
        description: 'Updated Description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
        created_by: 1,
        updated_by: 1
      };
      
      vi.mocked(db.locations.update).mockResolvedValue(updatedLocation);

      // Act
      const result = await caller.update(updateData);

      // Assert
      expect(result).toEqual(updatedLocation);
      expect(db.locations.update).toHaveBeenCalledWith({
        where: { location_id: 1 },
        data: { 
          name: 'Updated Location',
          latitude: 35.987654,
          longitude: 139.123456,
          address: 'Updated Address',
          description: 'Updated Description',
          updated_by: 1,
          updated_at: expect.any(Date),
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete location by id', async () => {
      // Arrange
      const deletedLocation: Location = { 
        location_id: 1, 
        name: 'Deleted Location', 
        latitude: 35.65858270,
        longitude: 139.74542700,
        address: 'Deleted Address',
        description: 'Deleted Description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1
      };
      vi.mocked(db.locations.delete).mockResolvedValue(deletedLocation);

      // Act
      const result = await caller.delete({ id: 1 });

      // Assert
      expect(result).toEqual(deletedLocation);
      expect(db.locations.delete).toHaveBeenCalledWith({
        where: { location_id: 1 },
      });
    });
  });

  describe('getNearby', () => {
    it('should return nearby locations within radius', async () => {
      // Arrange
      const centerLat = 35.658582;
      const centerLng = 139.745427;
      const radiusKm = 5.0;
      
      const mockLocations: Location[] = [
        { 
          location_id: 2, 
          name: 'Nearby Location', 
          latitude: 35.66000000,
          longitude: 139.74000000,
          address: 'Nearby Address',
          description: 'Close location',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          users_locations_created_byTousers: { username: 'testuser' },
          _count: { visits: 3 }
        },
      ];
      
      vi.mocked(db.locations.findMany).mockResolvedValue(mockLocations);

      // Act
      const result = await caller.getNearby({ 
        latitude: centerLat,
        longitude: centerLng,
        radiusKm 
      });

      // Assert
      expect(result).toEqual(mockLocations);
      expect(db.locations.findMany).toHaveBeenCalledWith({
        where: {
          latitude: {
            gte: expect.any(Number),
            lte: expect.any(Number),
          },
          longitude: {
            gte: expect.any(Number),
            lte: expect.any(Number),
          },
        },
        include: {
          users_locations_created_byTousers: {
            select: { username: true },
          },
          _count: {
            select: { visits: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('search', () => {
    it('should return locations matching search term', async () => {
      // Arrange
      const searchQuery = 'Tokyo';
      const mockLocations: Location[] = [
        { 
          location_id: 1, 
          name: 'Tokyo Tower', 
          latitude: 35.65858270,
          longitude: 139.74542700,
          address: 'Tokyo Address 1',
          description: 'Famous tower',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          users_locations_created_byTousers: { username: 'testuser' },
          _count: { visits: 5 }
        }
      ];
      
      vi.mocked(db.locations.findMany).mockResolvedValue(mockLocations);

      // Act
      const result = await caller.search({ query: searchQuery });

      // Assert
      expect(result).toEqual(mockLocations);
      expect(db.locations.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { name: { contains: searchQuery, mode: 'insensitive' } },
            { address: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } },
          ],
        },
        include: {
          users_locations_created_byTousers: {
            select: { username: true },
          },
          _count: {
            select: { visits: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array when no locations match', async () => {
      // Arrange
      vi.mocked(db.locations.findMany).mockResolvedValue([]);

      // Act
      const result = await caller.search({ query: 'NonExistent' });

      // Assert
      expect(result).toEqual([]);
    });
  });
});
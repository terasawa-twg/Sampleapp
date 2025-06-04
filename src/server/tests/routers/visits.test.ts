import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext, createVisitsCaller, createMockSession } from '../helpers/trpc';

// dbをモック
vi.mock('../../db', () => ({
  db: {
    visits: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      aggregate: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { db } from '../../db';

// 実際のルーターの戻り値に基づく型定義
type Visit = {
  visit_id: number;
  location_id: number;
  visit_date: Date;
  notes: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  // include関係の型
  locations?: any;
  users_visits_created_byTousers?: any;
  users_visits_updated_byTousers?: any;
  visit_photos?: any[];
};

describe('Visits Router', () => {
  let caller: ReturnType<typeof createVisitsCaller>;
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSession = createMockSession('1', 'test@example.com');
    const ctx = await createTestContext(mockSession);
    caller = createVisitsCaller(ctx);
  });

  describe('getAll', () => {
    it('should return all visits with includes', async () => {
      // Arrange
      const mockVisits: Visit[] = [
        { 
          visit_id: 1, 
          location_id: 1, 
          visit_date: new Date('2024-01-01T10:00:00Z'),
          notes: 'Test visit 1',
          rating: 5,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          locations: { name: 'Test Location', address: 'Test Address' },
          users_visits_created_byTousers: { username: 'testuser' },
          visit_photos: [{ photo_id: 1, file_path: '/uploads/photo1.jpg', description: 'Test photo' }]
        }
      ];
      
      vi.mocked(db.visits.findMany).mockResolvedValue(mockVisits);

      // Act
      const result = await caller.getAll();

      // Assert
      expect(result).toEqual(mockVisits);
      expect(db.visits.findMany).toHaveBeenCalledWith({
        include: {
          locations: {
            select: {
              name: true,
              address: true,
            },
          },
          users_visits_created_byTousers: {
            select: { username: true },
          },
          visit_photos: {
            select: {
              photo_id: true,
              file_path: true,
              description: true,
            },
          },
        },
        orderBy: { visit_date: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return visit by id with full includes', async () => {
      // Arrange
      const mockVisit: Visit = { 
        visit_id: 1, 
        location_id: 1, 
        visit_date: new Date('2024-01-01T10:00:00Z'),
        notes: 'Test visit',
        rating: 5,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1,
        locations: { name: 'Test Location' },
        users_visits_created_byTousers: { username: 'creator' },
        users_visits_updated_byTousers: { username: 'updater' },
        visit_photos: [{ photo_id: 1 }]
      };
      vi.mocked(db.visits.findUnique).mockResolvedValue(mockVisit);

      // Act
      const result = await caller.getById({ id: 1 });

      // Assert
      expect(result).toEqual(mockVisit);
      expect(db.visits.findUnique).toHaveBeenCalledWith({
        where: { visit_id: 1 },
        include: {
          locations: true,
          users_visits_created_byTousers: {
            select: { username: true },
          },
          users_visits_updated_byTousers: {
            select: { username: true },
          },
          visit_photos: true,
        },
      });
    });
  });

  describe('getByLocationId', () => {
    it('should return visits by location id', async () => {
      // Arrange
      const mockVisits: Visit[] = [
        { 
          visit_id: 1, 
          location_id: 1, 
          visit_date: new Date('2024-01-01T10:00:00Z'),
          notes: 'Test visit',
          rating: 5,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          users_visits_created_byTousers: { username: 'testuser' },
          visit_photos: []
        }
      ];
      
      vi.mocked(db.visits.findMany).mockResolvedValue(mockVisits);

      // Act
      const result = await caller.getByLocationId({ locationId: 1 });

      // Assert
      expect(result).toEqual(mockVisits);
      expect(db.visits.findMany).toHaveBeenCalledWith({
        where: { location_id: 1 },
        include: {
          users_visits_created_byTousers: {
            select: { username: true },
          },
          visit_photos: {
            select: {
              photo_id: true,
              file_path: true,
              description: true,
            },
          },
        },
        orderBy: { visit_date: 'desc' },
      });
    });
  });

  describe('getByUserId', () => {
    it('should return visits by user id', async () => {
      // Arrange
      const mockVisits: Visit[] = [
        { 
          visit_id: 1, 
          location_id: 1, 
          visit_date: new Date('2024-01-01T10:00:00Z'),
          notes: 'Test visit',
          rating: 5,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          locations: { name: 'Test Location', address: 'Test Address' },
          visit_photos: []
        }
      ];
      
      vi.mocked(db.visits.findMany).mockResolvedValue(mockVisits);

      // Act
      const result = await caller.getByUserId({ userId: 1 });

      // Assert
      expect(result).toEqual(mockVisits);
      expect(db.visits.findMany).toHaveBeenCalledWith({
        where: { created_by: 1 },
        include: {
          locations: {
            select: {
              name: true,
              address: true,
            },
          },
          visit_photos: {
            select: {
              photo_id: true,
              file_path: true,
              description: true,
            },
          },
        },
        orderBy: { visit_date: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new visit', async () => {
      // Arrange - 実際のzodスキーマに合わせた必須フィールド
      const newVisitData = { 
        location_id: 1, 
        visit_date: new Date('2024-01-01T10:00:00Z'),
        notes: 'New visit notes',
        rating: 5,
        created_by: 1
      };
      const createdVisit: Visit = { 
        visit_id: 1, 
        location_id: 1, 
        visit_date: new Date('2024-01-01T10:00:00Z'),
        notes: 'New visit notes',
        rating: 5,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1,
        locations: { name: 'Test Location' },
        users_visits_created_byTousers: { username: 'testuser' }
      };
      
      vi.mocked(db.visits.create).mockResolvedValue(createdVisit);

      // Act
      const result = await caller.create(newVisitData);

      // Assert
      expect(result).toEqual(createdVisit);
      expect(db.visits.create).toHaveBeenCalledWith({
        data: {
          location_id: 1,
          visit_date: new Date('2024-01-01T10:00:00Z'),
          notes: 'New visit notes',
          rating: 5,
          created_by: 1,
          updated_by: 1,
        },
        include: {
          locations: true,
          users_visits_created_byTousers: {
            select: { username: true },
          },
        },
      });
    });
  });

  describe('update', () => {
    it('should update existing visit', async () => {
      // Arrange - 実際のzodスキーマに合わせた形式
      const updateData = { 
        id: 1, 
        visit_date: new Date('2024-01-02T12:00:00Z'),
        notes: 'Updated visit notes',
        rating: 4,
        updated_by: 1
      };
      const updatedVisit: Visit = { 
        visit_id: 1, 
        location_id: 1, 
        visit_date: new Date('2024-01-02T12:00:00Z'),
        notes: 'Updated visit notes',
        rating: 4,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
        created_by: 1,
        updated_by: 1,
        locations: { name: 'Test Location' },
        users_visits_updated_byTousers: { username: 'testuser' }
      };
      
      vi.mocked(db.visits.update).mockResolvedValue(updatedVisit);

      // Act
      const result = await caller.update(updateData);

      // Assert
      expect(result).toEqual(updatedVisit);
      expect(db.visits.update).toHaveBeenCalledWith({
        where: { visit_id: 1 },
        data: {
          visit_date: new Date('2024-01-02T12:00:00Z'),
          notes: 'Updated visit notes',
          rating: 4,
          updated_by: 1,
          updated_at: expect.any(Date),
        },
        include: {
          locations: true,
          users_visits_updated_byTousers: {
            select: { username: true },
          },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete visit by id', async () => {
      // Arrange
      const deletedVisit: Visit = { 
        visit_id: 1, 
        location_id: 1, 
        visit_date: new Date('2024-01-01T10:00:00Z'),
        notes: 'Deleted visit',
        rating: 5,
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1
      };
      vi.mocked(db.visits.delete).mockResolvedValue(deletedVisit);

      // Act
      const result = await caller.delete({ id: 1 });

      // Assert
      expect(result).toEqual(deletedVisit);
      expect(db.visits.delete).toHaveBeenCalledWith({
        where: { visit_id: 1 },
      });
    });
  });

  describe('getByDateRange', () => {
    it('should return visits within date range', async () => {
      // Arrange
      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');
      const mockVisits: Visit[] = [
        { 
          visit_id: 1, 
          location_id: 1, 
          visit_date: new Date('2024-01-15T10:00:00Z'),
          notes: 'Visit in range',
          rating: 5,
          created_at: new Date('2024-01-15'),
          updated_at: new Date('2024-01-15'),
          created_by: 1,
          updated_by: 1,
          locations: { name: 'Test Location', address: 'Test Address' },
          users_visits_created_byTousers: { username: 'testuser' },
          visit_photos: []
        }
      ];
      
      vi.mocked(db.visits.findMany).mockResolvedValue(mockVisits);

      // Act
      const result = await caller.getByDateRange({ 
        startDate, 
        endDate,
        userId: 1
      });

      // Assert
      expect(result).toEqual(mockVisits);
      expect(db.visits.findMany).toHaveBeenCalledWith({
        where: {
          visit_date: {
            gte: startDate,
            lte: endDate,
          },
          created_by: 1,
        },
        include: {
          locations: {
            select: {
              name: true,
              address: true,
            },
          },
          users_visits_created_byTousers: {
            select: { username: true },
          },
          visit_photos: {
            select: {
              photo_id: true,
              file_path: true,
            },
          },
        },
        orderBy: { visit_date: 'desc' },
      });
    });
  });

  describe('getByRating', () => {
    it('should return visits by rating', async () => {
      // Arrange
      const mockVisits: Visit[] = [
        { 
          visit_id: 1, 
          location_id: 1, 
          visit_date: new Date('2024-01-01T10:00:00Z'),
          notes: 'Great visit',
          rating: 5,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          locations: { name: 'Test Location', address: 'Test Address' },
          users_visits_created_byTousers: { username: 'testuser' }
        }
      ];
      
      vi.mocked(db.visits.findMany).mockResolvedValue(mockVisits);

      // Act
      const result = await caller.getByRating({ rating: 5 });

      // Assert
      expect(result).toEqual(mockVisits);
      expect(db.visits.findMany).toHaveBeenCalledWith({
        where: { rating: 5 },
        include: {
          locations: {
            select: {
              name: true,
              address: true,
            },
          },
          users_visits_created_byTousers: {
            select: { username: true },
          },
        },
        orderBy: { visit_date: 'desc' },
      });
    });
  });

  describe('getUserStats', () => {
    it('should return user visit statistics', async () => {
      // Arrange
      const mockStats = {
        totalVisits: 10,
        averageRating: 4.2,
        visitsByRating: [
          { rating: 5, _count: { rating: 5 } },
          { rating: 4, _count: { rating: 3 } },
          { rating: 3, _count: { rating: 2 } }
        ]
      };
      
      vi.mocked(db.visits.count).mockResolvedValue(10);
      vi.mocked(db.visits.aggregate).mockResolvedValue({ _avg: { rating: 4.2 } } as any);
      vi.mocked(db.visits.groupBy).mockResolvedValue([
        { rating: 5, _count: { rating: 5 } },
        { rating: 4, _count: { rating: 3 } },
        { rating: 3, _count: { rating: 2 } }
      ] as any);

      // Act
      const result = await caller.getUserStats({ userId: 1 });

      // Assert
      expect(result).toEqual(mockStats);
      expect(db.visits.count).toHaveBeenCalledWith({
        where: { created_by: 1 },
      });
      expect(db.visits.aggregate).toHaveBeenCalledWith({
        where: { created_by: 1 },
        _avg: { rating: true },
      });
      expect(db.visits.groupBy).toHaveBeenCalledWith({
        by: ['rating'],
        where: { created_by: 1 },
        _count: { rating: true },
        orderBy: { rating: 'asc' },
      });
    });
  });
});
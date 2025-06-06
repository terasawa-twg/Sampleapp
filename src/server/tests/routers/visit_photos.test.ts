import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext, createVisitPhotosCaller, createMockSession } from '@/server/tests/helpers/trpc';

// dbをモック
vi.mock('../../db', () => ({
  db: {
    visit_photos: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import { db } from '../../db';

// 実際のルーターの戻り値に基づく型定義
type VisitPhoto = {
  photo_id: number;
  visit_id: number;
  file_path: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  // include関係の型
  visits?: any;
  users_visit_photos_created_byTousers?: any;
  users_visit_photos_updated_byTousers?: any;
};

describe('Visit Photos Router', () => {
  let caller: ReturnType<typeof createVisitPhotosCaller>;
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSession = createMockSession('1', 'test@example.com');
    const ctx = await createTestContext(mockSession);
    caller = createVisitPhotosCaller(ctx);
  });

  describe('getAll', () => {
    it('should return all visit photos with includes', async () => {
      // Arrange
      const mockPhotos: VisitPhoto[] = [
        { 
          photo_id: 1, 
          visit_id: 1,
          file_path: '/uploads/photo1.jpg',
          description: 'First photo',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          visits: {
            visit_id: 1,
            locations: { name: 'Test Location', address: 'Test Address' }
          },
          users_visit_photos_created_byTousers: { username: 'testuser' }
        }
      ];
      
      vi.mocked(db.visit_photos.findMany).mockResolvedValue(mockPhotos);

      // Act
      const result = await caller.getAll();

      // Assert
      expect(result).toEqual(mockPhotos);
      expect(db.visit_photos.findMany).toHaveBeenCalledWith({
        include: {
          visits: {
            include: {
              locations: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
          },
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return visit photo by id with full includes', async () => {
      // Arrange
      const mockPhoto: VisitPhoto = { 
        photo_id: 1, 
        visit_id: 1,
        file_path: '/uploads/photo1.jpg',
        description: 'Test photo',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1,
        visits: {
          visit_id: 1,
          locations: { name: 'Test Location' }
        },
        users_visit_photos_created_byTousers: { username: 'creator' },
        users_visit_photos_updated_byTousers: { username: 'updater' }
      };
      vi.mocked(db.visit_photos.findUnique).mockResolvedValue(mockPhoto);

      // Act
      const result = await caller.getById({ id: 1 });

      // Assert
      expect(result).toEqual(mockPhoto);
      expect(db.visit_photos.findUnique).toHaveBeenCalledWith({
        where: { photo_id: 1 },
        include: {
        visits: {
            include: {
              locations: true,
            },
          },
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
          users_visit_photos_updated_byTousers: {
            select: { username: true },
          },
        },
      });
    });

    it('should return null when photo not found', async () => {
      // Arrange
      vi.mocked(db.visit_photos.findUnique).mockResolvedValue(null);

      // Act
      const result = await caller.getById({ id: 999 });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getByVisitId', () => {
    it('should return photos by visit id', async () => {
      // Arrange
      const mockPhotos: VisitPhoto[] = [
        { 
          photo_id: 1, 
          visit_id: 1,
          file_path: '/uploads/photo1.jpg',
          description: 'First photo',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          users_visit_photos_created_byTousers: { username: 'testuser' }
        }
      ];
      
      vi.mocked(db.visit_photos.findMany).mockResolvedValue(mockPhotos);

      // Act
      const result = await caller.getByVisitId({ visitId: 1 });

      // Assert
      expect(result).toEqual(mockPhotos);
      expect(db.visit_photos.findMany).toHaveBeenCalledWith({
        where: { visit_id: 1 },
        include: {
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return empty array when no photos exist for visit', async () => {
      // Arrange
      vi.mocked(db.visit_photos.findMany).mockResolvedValue([]);

      // Act
      const result = await caller.getByVisitId({ visitId: 999 });

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('getByUserId', () => {
    it('should return photos by user id', async () => {
      // Arrange
      const mockPhotos: VisitPhoto[] = [
        { 
          photo_id: 1, 
          visit_id: 1,
          file_path: '/uploads/photo1.jpg',
          description: 'User photo',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          visits: {
            visit_id: 1,
            locations: { name: 'Test Location', address: 'Test Address' }
          }
        }
      ];
      
      vi.mocked(db.visit_photos.findMany).mockResolvedValue(mockPhotos);

      // Act
      const result = await caller.getByUserId({ userId: 1 });

      // Assert
      expect(result).toEqual(mockPhotos);
      expect(db.visit_photos.findMany).toHaveBeenCalledWith({
        where: { created_by: 1 },
        include: {
          visits: {
            include: {
              locations: {
                select: {
                  name: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('create', () => {
    it('should create a new visit photo', async () => {
      // Arrange - 実際のzodスキーマに合わせた必須フィールド
      const newPhotoData = { 
        visit_id: 1,
        file_path: '/uploads/new-photo.jpg',
        description: 'New photo',
        created_by: 1
      };
      const createdPhoto: VisitPhoto = { 
        photo_id: 1, 
        visit_id: 1,
        file_path: '/uploads/new-photo.jpg',
        description: 'New photo',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1,
        visits: {
          visit_id: 1,
          locations: { name: 'Test Location' }
        },
        users_visit_photos_created_byTousers: { username: 'testuser' }
      };
      
      vi.mocked(db.visit_photos.create).mockResolvedValue(createdPhoto);

      // Act
      const result = await caller.create(newPhotoData);

      // Assert
      expect(result).toEqual(createdPhoto);
      expect(db.visit_photos.create).toHaveBeenCalledWith({
        data: {
          visit_id: 1,
          file_path: '/uploads/new-photo.jpg',
          description: 'New photo',
          created_by: 1,
          updated_by: 1,
        },
        include: {
          visits: {
            include: {
              locations: {
                select: {
                  name: true,
                },
              },
            },
          },
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
        },
      });
    });

    it('should throw error when file_path is empty', async () => {
      // Act & Assert
      await expect(caller.create({ 
        visit_id: 1,
        file_path: '',
        description: 'Test',
        created_by: 1
      })).rejects.toThrow('ファイルパスは必須です');
    });
  });

  describe('update', () => {
    it('should update existing visit photo', async () => {
      // Arrange - 実際のzodスキーマに合わせた形式
      const updateData = { 
        id: 1,
        file_path: '/uploads/updated-photo.jpg',
        description: 'Updated description',
        updated_by: 1
      };
      const updatedPhoto: VisitPhoto = { 
        photo_id: 1, 
        visit_id: 1,
        file_path: '/uploads/updated-photo.jpg',
        description: 'Updated description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
        created_by: 1,
        updated_by: 1,
        visits: {
          visit_id: 1,
          locations: { name: 'Test Location' }
        },
        users_visit_photos_updated_byTousers: { username: 'testuser' }
      };
      
      vi.mocked(db.visit_photos.update).mockResolvedValue(updatedPhoto);

      // Act
      const result = await caller.update(updateData);

      // Assert
      expect(result).toEqual(updatedPhoto);
      expect(db.visit_photos.update).toHaveBeenCalledWith({
        where: { photo_id: 1 },
        data: { 
          file_path: '/uploads/updated-photo.jpg',
          description: 'Updated description',
          updated_by: 1,
          updated_at: expect.any(Date),
        },
        include: {
          visits: {
            include: {
              locations: {
                select: {
                  name: true,
                },
              },
            },
          },
          users_visit_photos_updated_byTousers: {
            select: { username: true },
          },
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete visit photo by id', async () => {
      // Arrange
      const deletedPhoto: VisitPhoto = { 
        photo_id: 1, 
        visit_id: 1,
        file_path: '/uploads/deleted-photo.jpg',
        description: 'Deleted photo',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
        created_by: 1,
        updated_by: 1
      };
      vi.mocked(db.visit_photos.delete).mockResolvedValue(deletedPhoto);

      // Act
      const result = await caller.delete({ id: 1 });

      // Assert
      expect(result).toEqual(deletedPhoto);
      expect(db.visit_photos.delete).toHaveBeenCalledWith({
        where: { photo_id: 1 },
      });
    });
  });

  describe('getByLocationId', () => {
    it('should return photos by location id', async () => {
      // Arrange
      const mockPhotos: VisitPhoto[] = [
        { 
          photo_id: 1, 
          visit_id: 1,
          file_path: '/uploads/photo1.jpg',
          description: 'Location photo',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          visits: {
            visit_date: new Date('2024-01-01'),
            rating: 5,
            notes: 'Great visit'
          },
          users_visit_photos_created_byTousers: { username: 'testuser' }
        }
      ];
      
      vi.mocked(db.visit_photos.findMany).mockResolvedValue(mockPhotos);

      // Act
      const result = await caller.getByLocationId({ locationId: 1 });

      // Assert
      expect(result).toEqual(mockPhotos);
      expect(db.visit_photos.findMany).toHaveBeenCalledWith({
        where: {
          visits: {
            location_id: 1,
          },
        },
        include: {
          visits: {
            select: {
              visit_date: true,
              rating: true,
              notes: true,
            },
          },
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
        },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('createMultiple', () => {
    it('should create multiple photos at once', async () => {
      // Arrange
      const multiplePhotosData = {
        visit_id: 1,
        photos: [
          { file_path: '/uploads/photo1.jpg', description: 'Photo 1' },
          { file_path: '/uploads/photo2.jpg', description: 'Photo 2' }
        ],
        created_by: 1
      };
      const createManyResult = { count: 2 };
      
      vi.mocked(db.visit_photos.createMany).mockResolvedValue(createManyResult);

      // Act
      const result = await caller.createMultiple(multiplePhotosData);

      // Assert
      expect(result).toEqual(createManyResult);
      expect(db.visit_photos.createMany).toHaveBeenCalledWith({
        data: [
          {
            visit_id: 1,
            file_path: '/uploads/photo1.jpg',
            description: 'Photo 1',
            created_by: 1,
            updated_by: 1,
          },
          {
            visit_id: 1,
            file_path: '/uploads/photo2.jpg',
            description: 'Photo 2',
            created_by: 1,
            updated_by: 1,
          }
        ],
      });
    });
  });

  describe('getPhotoStats', () => {
    it('should return photo statistics', async () => {
      // Arrange
      const mockCount = 100;
      const mockGroupBy = [
        { visit_id: 1, _count: { photo_id: 5 } },
        { visit_id: 2, _count: { photo_id: 3 } }
      ];
      const mockRecentPhotos = [
        {
          photo_id: 1,
          visit_id: 1,
          file_path: '/uploads/recent1.jpg',
          description: 'Recent photo',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          visits: {
            visit_id: 1,
            locations: { name: 'Recent Location' }
          },
          users_visit_photos_created_byTousers: { username: 'testuser' }
        }
      ];

      const expectedStats = {
        totalPhotos: mockCount,
        photosByVisit: mockGroupBy,
        recentPhotos: mockRecentPhotos
      };
      
      vi.mocked(db.visit_photos.count).mockResolvedValue(mockCount);
      vi.mocked(db.visit_photos.groupBy).mockResolvedValue(mockGroupBy as any);
      vi.mocked(db.visit_photos.findMany).mockResolvedValue(mockRecentPhotos as any);

      // Act
      const result = await caller.getPhotoStats();

      // Assert
      expect(result).toEqual(expectedStats);
      expect(db.visit_photos.count).toHaveBeenCalledWith();
      expect(db.visit_photos.groupBy).toHaveBeenCalledWith({
        by: ['visit_id'],
        _count: { photo_id: true },
        orderBy: { _count: { photo_id: 'desc' } },
        take: 10,
      });
      expect(db.visit_photos.findMany).toHaveBeenCalledWith({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          visits: {
            include: {
              locations: {
                select: {
                  name: true,
                },
              },
            },
          },
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
        },
      });
    });
  });
});
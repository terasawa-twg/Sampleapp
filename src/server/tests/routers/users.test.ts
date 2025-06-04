import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createTestContext, createUsersCaller, createMockSession } from '../helpers/trpc';

// dbをモック
vi.mock('../../db', () => ({
  db: {
    users: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    locations: {
      findMany: vi.fn(),
    },
    visits: {
      findMany: vi.fn(),
    },
  },
}));

import { db } from '../../db';


// 実際のPrismaスキーマに基づく正確な型定義
type User = {
  user_id: number;
  username: string;
};

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
};

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
  // リレーション（includeした場合）
  locations?: Location;
  visit_photos?: VisitPhoto[];
};

type VisitPhoto = {
  photo_id: number;
  visit_id: number;
  file_path: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
};

describe('Users Router', () => {
  let caller: ReturnType<typeof createUsersCaller>;
  let mockSession: ReturnType<typeof createMockSession>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockSession = createMockSession('1', 'test@example.com');
    const ctx = await createTestContext(mockSession);
    caller = createUsersCaller(ctx);
  });

  describe('getAll', () => {
    it('should return all users ordered by user_id desc', async () => {
      // Arrange
      const mockUsers: User[] = [
        { user_id: 2, username: 'user2' },
        { user_id: 1, username: 'user1' },
      ];
      
      vi.mocked(db.users.findMany).mockResolvedValue(mockUsers);

      // Act
      const result = await caller.getAll();

      // Assert
      expect(result).toEqual(mockUsers);
      expect(db.users.findMany).toHaveBeenCalledWith({
        orderBy: { user_id: 'desc' },
      });
    });
  });

  describe('getById', () => {
    it('should return user by id', async () => {
      // Arrange
      const mockUser: User = { user_id: 1, username: 'testuser' };
      vi.mocked(db.users.findUnique).mockResolvedValue(mockUser);

      // Act
      const result = await caller.getById({ id: 1 });

      // Assert
      expect(result).toEqual(mockUser);
      expect(db.users.findUnique).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
    });

    it('should return null when user not found', async () => {
      // Arrange
      vi.mocked(db.users.findUnique).mockResolvedValue(null);

      // Act
      const result = await caller.getById({ id: 999 });

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // Arrange
      const newUserData = { username: 'newuser' };
      const createdUser: User = { user_id: 1, username: 'newuser' };
      
      vi.mocked(db.users.create).mockResolvedValue(createdUser);

      // Act
      const result = await caller.create(newUserData);

      // Assert
      expect(result).toEqual(createdUser);
      expect(db.users.create).toHaveBeenCalledWith({
        data: { username: 'newuser' },
      });
    });

    it('should throw error when username is empty', async () => {
      // Act & Assert - zodのバリデーションエラーをテスト
      await expect(caller.create({ username: '' }))
        .rejects.toThrow('ユーザー名は必須です');
    });
  });

  describe('update', () => {
    it('should update existing user', async () => {
      // Arrange
      const updateData = { id: 1, username: 'updateduser' };
      const updatedUser: User = { user_id: 1, username: 'updateduser' };
      
      vi.mocked(db.users.update).mockResolvedValue(updatedUser);

      // Act
      const result = await caller.update(updateData);

      // Assert
      expect(result).toEqual(updatedUser);
      expect(db.users.update).toHaveBeenCalledWith({
        where: { user_id: 1 },
        data: { username: 'updateduser' },
      });
    });
  });

  describe('delete', () => {
    it('should delete user by id', async () => {
      // Arrange
      const deletedUser: User = { user_id: 1, username: 'deleteduser' };
      vi.mocked(db.users.delete).mockResolvedValue(deletedUser);

      // Act
      const result = await caller.delete({ id: 1 });

      // Assert
      expect(result).toEqual(deletedUser);
      expect(db.users.delete).toHaveBeenCalledWith({
        where: { user_id: 1 },
      });
    });
  });

  describe('getLocations', () => {
    it('should return locations created by user', async () => {
      // Arrange - 実際のPrismaスキーマに合わせたモックデータ
      const mockLocations: Location[] = [
        { 
          location_id: 1, 
          name: 'Location 1',
          latitude: 35.6762, // 数値として扱う
          longitude: 139.6503, // 数値として扱う
          address: 'Test Address 1',
          description: 'Test Description 1',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1
        },
        { 
          location_id: 2, 
          name: 'Location 2',
          latitude: 35.6895, // 数値として扱う
          longitude: 139.6917, // 数値として扱う
          address: 'Test Address 2',
          description: 'Test Description 2',
          created_at: new Date('2024-01-02'),
          updated_at: new Date('2024-01-02'),
          created_by: 1,
          updated_by: 1
        },
      ];
      
      vi.mocked(db.locations.findMany).mockResolvedValue(mockLocations);

      // Act
      const result = await caller.getLocations({ userId: 1 });

      // Assert
      expect(result).toEqual(mockLocations);
      expect(db.locations.findMany).toHaveBeenCalledWith({
        where: { created_by: 1 },
        orderBy: { created_at: 'desc' },
      });
    });
  });

  describe('getVisits', () => {
    it('should return visits with locations and photos', async () => {
      // Arrange - 実際のPrismaスキーマに合わせたモックデータ
      const mockVisits: (Visit & { locations: Location; visit_photos: VisitPhoto[] })[] = [
        {
          visit_id: 1,
          location_id: 1,
          visit_date: new Date('2024-01-01'),
          notes: 'Test visit notes',
          rating: 5,
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
          created_by: 1,
          updated_by: 1,
          locations: {
            location_id: 1,
            name: 'Test Location',
            latitude: 35.6762, // 数値として扱う
            longitude: 139.6503, // 数値として扱う
            address: 'Test Address',
            description: 'Test Description',
            created_at: new Date('2024-01-01'),
            updated_at: new Date('2024-01-01'),
            created_by: 1,
            updated_by: 1
          },
          visit_photos: [
            {
              photo_id: 1,
              visit_id: 1,
              file_path: '/uploads/photo1.jpg',
              description: 'Test photo',
              created_at: new Date('2024-01-01'),
              updated_at: new Date('2024-01-01'),
              created_by: 1,
              updated_by: 1
            }
          ]
        },
      ];
      
      vi.mocked(db.visits.findMany).mockResolvedValue(mockVisits);

      // Act
      const result = await caller.getVisits({ userId: 1 });

      // Assert
      expect(result).toEqual(mockVisits);
      expect(db.visits.findMany).toHaveBeenCalledWith({
        where: { created_by: 1 },
        include: {
          locations: true,
          visit_photos: true,
        },
        orderBy: { visit_date: 'desc' },
      });
    });
  });
});
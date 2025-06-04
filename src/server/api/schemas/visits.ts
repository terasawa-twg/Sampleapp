import { z } from "zod";

// 基本的な訪問データのスキーマ
export const visitBaseSchema = z.object({
  location_id: z.number(),
  visit_date: z.date(),
  notes: z.string().default(""),
  rating: z.number().min(0).max(5).default(0),
});

// 訪問作成用のスキーマ
export const createVisitSchema = visitBaseSchema.extend({
  created_by: z.number(),
});

// 訪問更新用のスキーマ
export const updateVisitSchema = z.object({
  id: z.number(),
  visit_date: z.date().optional(),
  notes: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  updated_by: z.number(),
});

// ID指定用のスキーマ
export const visitIdSchema = z.object({
  id: z.number(),
});

// 場所ID指定用のスキーマ
export const visitsByLocationSchema = z.object({
  locationId: z.number(),
});

// ユーザーID指定用のスキーマ
export const visitsByUserSchema = z.object({
  userId: z.number(),
});

// 期間指定用のスキーマ
export const visitsByDateRangeSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
  userId: z.number().optional(),
});

// 評価指定用のスキーマ
export const visitsByRatingSchema = z.object({
  rating: z.number().min(0).max(5),
});

// ユーザー統計用のスキーマ
export const userStatsSchema = z.object({
  userId: z.number(),
});

// 共通の並び順
export const defaultVisitOrderBy = { visit_date: "desc" } as const;

// Prismaのinclude設定（実際のコードに合わせて）
export const visitIncludeBasic = {
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
} as const;

export const visitIncludeDetail = {
  locations: true,
  users_visits_created_byTousers: {
    select: { username: true },
  },
  users_visits_updated_byTousers: {
    select: { username: true },
  },
  visit_photos: true,
} as const;

export const visitIncludeByLocation = {
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
} as const;

export const visitIncludeByUser = {
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
} as const;

export const visitIncludeByDateRange = {
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
} as const;

export const visitIncludeByRating = {
  locations: {
    select: {
      name: true,
      address: true,
    },
  },
  users_visits_created_byTousers: {
    select: { username: true },
  },
} as const;
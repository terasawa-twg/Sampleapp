import { z } from "zod";

// 基本的な場所データのスキーマ
export const locationBaseSchema = z.object({
  name: z.string().min(1, "場所名は必須です"),
  latitude: z.number().min(-90).max(90, "緯度は-90から90の間で入力してください"),
  longitude: z.number().min(-180).max(180, "経度は-180から180の間で入力してください"),
  address: z.string().default(""),
  description: z.string().default(""),
});

// 場所作成用のスキーマ
export const createLocationSchema = locationBaseSchema.extend({
  created_by: z.number(),
});

// 場所更新用のスキーマ
export const updateLocationSchema = locationBaseSchema.extend({
  id: z.number(),
  updated_by: z.number(),
});

// ID指定用のスキーマ
export const locationIdSchema = z.object({
  id: z.number(),
});

// 近くの場所検索用のスキーマ
export const nearbyLocationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  radiusKm: z.number().default(10), // デフォルト10km圏内
});

// 場所検索用のスキーマ
export const searchLocationSchema = z.object({
  query: z.string().min(1),
});

// Prismaのinclude設定を型安全にするためのタイプ
export const locationIncludeBasic = {
  users_locations_created_byTousers: {
    select: { username: true },
  },
  _count: {
    select: { visits: true },
  },
} as const;

export const locationIncludeDetail = {
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
    orderBy: { visit_date: "desc" },
  },
} as const;
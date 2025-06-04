import { z } from "zod";

// 基本的な写真データのスキーマ（実際のコードに合わせて file_path を使用）
export const visitPhotoBaseSchema = z.object({
  visit_id: z.number(),
  file_path: z.string().min(1, "ファイルパスは必須です"),
  description: z.string().default(""),
});

// 写真作成用のスキーマ
export const createVisitPhotoSchema = visitPhotoBaseSchema.extend({
  created_by: z.number(),
});

// 写真更新用のスキーマ
export const updateVisitPhotoSchema = z.object({
  id: z.number(),
  file_path: z.string().min(1, "ファイルパスは必須です").optional(),
  description: z.string().optional(),
  updated_by: z.number(),
});

// ID指定用のスキーマ
export const visitPhotoIdSchema = z.object({
  id: z.number(),
});

// 訪問ID指定用のスキーマ
export const photosByVisitSchema = z.object({
  visitId: z.number(),
});

// ユーザーID指定用のスキーマ
export const photosByUserSchema = z.object({
  userId: z.number(),
});

// 場所ID指定用のスキーマ
export const photosByLocationSchema = z.object({
  locationId: z.number(),
});

// 一括作成用のスキーマ
export const createMultiplePhotosSchema = z.object({
  visit_id: z.number(),
  photos: z.array(
    z.object({
      file_path: z.string().min(1, "ファイルパスは必須です"),
      description: z.string().default(""),
    }),
  ),
  created_by: z.number(),
});

// 共通の並び順
export const defaultPhotoOrderBy = { created_at: "desc" } as const;

// Prismaのinclude設定（実際のコードに合わせて）
export const visitPhotoIncludeAll = {
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
} as const;

export const visitPhotoIncludeDetail = {
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
} as const;

export const visitPhotoIncludeBasic = {
  users_visit_photos_created_byTousers: {
    select: { username: true },
  },
} as const;

export const visitPhotoIncludeByUser = {
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
} as const;

export const visitPhotoIncludeByLocation = {
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
} as const;

export const visitPhotoIncludeCreate = {
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
} as const;

export const visitPhotoIncludeUpdate = {
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
} as const;

export const visitPhotoIncludeStats = {
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
} as const;
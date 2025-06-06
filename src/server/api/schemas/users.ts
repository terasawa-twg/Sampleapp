import { z } from "zod";

// 基本的なユーザーデータのスキーマ（実際のusers.tsに合わせて簡素化）
export const userBaseSchema = z.object({
  username: z.string().min(1, "ユーザー名は必須です"),
});

// ユーザー作成用のスキーマ
export const createUserSchema = userBaseSchema;

// ユーザー更新用のスキーマ
export const updateUserSchema = z.object({
  id: z.number(),
  username: z.string().min(1, "ユーザー名は必須です"),
});

// ID指定用のスキーマ
export const userIdSchema = z.object({
  id: z.number(),
});

// ユーザーIDでデータ取得用のスキーマ
export const userDataByIdSchema = z.object({
  userId: z.number(),
});

// 共通の並び順
export const defaultUserOrderBy = { user_id: "desc" } as const;
export const defaultLocationOrderBy = { created_at: "desc" } as const;
export const defaultVisitOrderBy = { visit_date: "desc" } as const;

// Prismaのinclude設定（実際のコードに合わせて調整）
export const userVisitsInclude = {
  locations: true,
  visit_photos: true,
} as const;
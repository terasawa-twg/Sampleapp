import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const usersRouter = createTRPCRouter({
  // 全ユーザー取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.users.findMany({
      orderBy: { user_id: "desc" },
    });
  }),

  // ID指定でユーザー取得
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.users.findUnique({
        where: { user_id: input.id },
      });
    }),

  // ユーザー作成
  create: publicProcedure
    .input(
      z.object({
        username: z.string().min(1, "ユーザー名は必須です"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.users.create({
        data: {
          username: input.username,
        },
      });
    }),

  // ユーザー更新
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        username: z.string().min(1, "ユーザー名は必須です"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.users.update({
        where: { user_id: input.id },
        data: {
          username: input.username,
        },
      });
    }),

  // ユーザー削除
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.users.delete({
        where: { user_id: input.id },
      });
    }),

  // ユーザーの作成した場所を取得
  getLocations: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.locations.findMany({
        where: { created_by: input.userId },
        orderBy: { created_at: "desc" },
      });
    }),

  // ユーザーの訪問記録を取得
  getVisits: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { created_by: input.userId },
        include: {
          locations: true,
          visit_photos: true,
        },
        orderBy: { visit_date: "desc" },
      });
    }),
});
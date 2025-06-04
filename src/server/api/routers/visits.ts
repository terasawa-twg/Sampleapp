import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const visitsRouter = createTRPCRouter({
  // 全訪問記録取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.visits.findMany({
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
      orderBy: { visit_date: "desc" },
    });
  }),

  // ID指定で訪問記録取得
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findUnique({
        where: { visit_id: input.id },
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
    }),

  // 場所ID指定で訪問記録取得
  getByLocationId: publicProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { location_id: input.locationId },
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
        orderBy: { visit_date: "desc" },
      });
    }),

  // ユーザーID指定で訪問記録取得
  getByUserId: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { created_by: input.userId },
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
        orderBy: { visit_date: "desc" },
      });
    }),

  // 訪問記録作成
  create: publicProcedure
    .input(
      z.object({
        location_id: z.number(),
        visit_date: z.date(),
        notes: z.string().default(""),
        rating: z.number().min(0).max(5).default(0),
        created_by: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visits.create({
        data: {
          location_id: input.location_id,
          visit_date: input.visit_date,
          notes: input.notes,
          rating: input.rating,
          created_by: input.created_by,
          updated_by: input.created_by,
        },
        include: {
          locations: true,
          users_visits_created_byTousers: {
            select: { username: true },
          },
        },
      });
    }),

  // 訪問記録更新
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        visit_date: z.date().optional(),
        notes: z.string().optional(),
        rating: z.number().min(0).max(5).optional(),
        updated_by: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, updated_by, ...updateData } = input;
      
      return await ctx.db.visits.update({
        where: { visit_id: id },
        data: {
          ...updateData,
          updated_by,
          updated_at: new Date(),
        },
        include: {
          locations: true,
          users_visits_updated_byTousers: {
            select: { username: true },
          },
        },
      });
    }),

  // 訪問記録削除
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visits.delete({
        where: { visit_id: input.id },
      });
    }),

  // 期間指定で訪問記録取得
  getByDateRange: publicProcedure
    .input(
      z.object({
        startDate: z.date(),
        endDate: z.date(),
        userId: z.number().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: {
          visit_date: {
            gte: input.startDate,
            lte: input.endDate,
          },
          ...(input.userId && { created_by: input.userId }),
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
        orderBy: { visit_date: "desc" },
      });
    }),

  // 評価別で訪問記録取得
  getByRating: publicProcedure
    .input(z.object({ rating: z.number().min(0).max(5) }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { rating: input.rating },
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
        orderBy: { visit_date: "desc" },
      });
    }),

  // ユーザーの訪問統計取得
  getUserStats: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      const [totalVisits, averageRating, visitsByRating] = await Promise.all([
        // 総訪問数
        ctx.db.visits.count({
          where: { created_by: input.userId },
        }),
        // 平均評価
        ctx.db.visits.aggregate({
          where: { created_by: input.userId },
          _avg: { rating: true },
        }),
        // 評価別訪問数
        ctx.db.visits.groupBy({
          by: ['rating'],
          where: { created_by: input.userId },
          _count: { rating: true },
          orderBy: { rating: 'asc' },
        }),
      ]);

      return {
        totalVisits,
        averageRating: averageRating._avg.rating ?? 0,
        visitsByRating,
      };
    }),
});
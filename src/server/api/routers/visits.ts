import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  createVisitSchema,
  updateVisitSchema,
  visitIdSchema,
  visitsByLocationSchema,
  visitsByUserSchema,
  visitsByDateRangeSchema,
  visitsByRatingSchema,
  userStatsSchema,
  defaultVisitOrderBy,
  visitIncludeBasic,
  visitIncludeDetail,
  visitIncludeByLocation,
  visitIncludeByUser,
  visitIncludeByDateRange,
  visitIncludeByRating,
} from "../schemas/visits";

export const visitsRouter = createTRPCRouter({
  // 全訪問記録取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.visits.findMany({
      include: visitIncludeBasic,
      orderBy: defaultVisitOrderBy,
    });
  }),

  // ID指定で訪問記録取得
  getById: publicProcedure
    .input(visitIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findUnique({
        where: { visit_id: input.id },
        include: visitIncludeDetail,
      });
    }),

  // 場所ID指定で訪問記録取得
  getByLocationId: publicProcedure
    .input(visitsByLocationSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { location_id: input.locationId },
        include: visitIncludeByLocation,
        orderBy: defaultVisitOrderBy,
      });
    }),

  // ユーザーID指定で訪問記録取得
  getByUserId: publicProcedure
    .input(visitsByUserSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { created_by: input.userId },
        include: visitIncludeByUser,
        orderBy: defaultVisitOrderBy,
      });
    }),

  // 訪問記録作成
  create: publicProcedure
    .input(createVisitSchema)
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
    .input(updateVisitSchema)
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
    .input(visitIdSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visits.delete({
        where: { visit_id: input.id },
      });
    }),

  // 期間指定で訪問記録取得
  getByDateRange: publicProcedure
    .input(visitsByDateRangeSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: {
          visit_date: {
            gte: input.startDate,
            lte: input.endDate,
          },
          ...(input.userId && { created_by: input.userId }),
        },
        include: visitIncludeByDateRange,
        orderBy: defaultVisitOrderBy,
      });
    }),

  // 評価別で訪問記録取得
  getByRating: publicProcedure
    .input(visitsByRatingSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visits.findMany({
        where: { rating: input.rating },
        include: visitIncludeByRating,
        orderBy: defaultVisitOrderBy,
      });
    }),

  // ユーザーの訪問統計取得
  getUserStats: publicProcedure
    .input(userStatsSchema)
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
import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  createVisitPhotoSchema,
  updateVisitPhotoSchema,
  visitPhotoIdSchema,
  photosByVisitSchema,
  photosByUserSchema,
  photosByLocationSchema,
  createMultiplePhotosSchema,
  defaultPhotoOrderBy,
  visitPhotoIncludeAll,
  visitPhotoIncludeDetail,
  visitPhotoIncludeBasic,
  visitPhotoIncludeByUser,
  visitPhotoIncludeByLocation,
  visitPhotoIncludeCreate,
  visitPhotoIncludeUpdate,
  visitPhotoIncludeStats,
} from "../schemas/visit_photos";

export const visitPhotosRouter = createTRPCRouter({
  // 全写真取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.visit_photos.findMany({
      include: visitPhotoIncludeAll,
      orderBy: defaultPhotoOrderBy,
    });
  }),

  // ID指定で写真取得
  getById: publicProcedure
    .input(visitPhotoIdSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findUnique({
        where: { photo_id: input.id },
        include: visitPhotoIncludeDetail,
      });
    }),

  // 訪問ID指定で写真取得
  getByVisitId: publicProcedure
    .input(photosByVisitSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findMany({
        where: { visit_id: input.visitId },
        include: visitPhotoIncludeBasic,
        orderBy: defaultPhotoOrderBy,
      });
    }),

  // ユーザーID指定で写真取得
  getByUserId: publicProcedure
    .input(photosByUserSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findMany({
        where: { created_by: input.userId },
        include: visitPhotoIncludeByUser,
        orderBy: defaultPhotoOrderBy,
      });
    }),

  // 写真作成
  create: publicProcedure
    .input(createVisitPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.create({
        data: {
          visit_id: input.visit_id,
          file_path: input.file_path,
          description: input.description,
          created_by: input.created_by,
          updated_by: input.created_by,
        },
        include: visitPhotoIncludeCreate,
      });
    }),

  // 写真更新
  update: publicProcedure
    .input(updateVisitPhotoSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, updated_by, ...updateData } = input;
      
      return await ctx.db.visit_photos.update({
        where: { photo_id: id },
        data: {
          ...updateData,
          updated_by,
          updated_at: new Date(),
        },
        include: visitPhotoIncludeUpdate,
      });
    }),

  // 写真削除
  delete: publicProcedure
    .input(visitPhotoIdSchema)
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.delete({
        where: { photo_id: input.id },
      });
    }),

  // 場所ID指定で写真取得
  getByLocationId: publicProcedure
    .input(photosByLocationSchema)
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findMany({
        where: {
          visits: {
            location_id: input.locationId,
          },
        },
        include: visitPhotoIncludeByLocation,
        orderBy: defaultPhotoOrderBy,
      });
    }),

  // 複数写真を一括作成（1回の訪問で複数写真アップロード用）
  createMultiple: publicProcedure
    .input(createMultiplePhotosSchema)
    .mutation(async ({ ctx, input }) => {
      const photosData = input.photos.map((photo) => ({
        visit_id: input.visit_id,
        file_path: photo.file_path,
        description: photo.description,
        created_by: input.created_by,
        updated_by: input.created_by,
      }));

      return await ctx.db.visit_photos.createMany({
        data: photosData,
      });
    }),

  // 訪問記録の写真数統計
  getPhotoStats: publicProcedure.query(async ({ ctx }) => {
    const [totalPhotos, photosByVisit, recentPhotos] = await Promise.all([
      // 総写真数
      ctx.db.visit_photos.count(),
      // 訪問記録別写真数
      ctx.db.visit_photos.groupBy({
        by: ['visit_id'],
        _count: { photo_id: true },
        orderBy: { _count: { photo_id: 'desc' } },
        take: 10,
      }),
      // 最近の写真
      ctx.db.visit_photos.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: visitPhotoIncludeStats,
      }),
    ]);

    return {
      totalPhotos,
      photosByVisit,
      recentPhotos,
    };
  }),
});
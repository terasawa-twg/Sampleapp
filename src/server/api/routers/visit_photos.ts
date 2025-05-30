import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const visitPhotosRouter = createTRPCRouter({
  // 全写真取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.visit_photos.findMany({
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
      orderBy: { created_at: "desc" },
    });
  }),

  // ID指定で写真取得
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findUnique({
        where: { photo_id: input.id },
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
    }),

  // 訪問ID指定で写真取得
  getByVisitId: publicProcedure
    .input(z.object({ visitId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findMany({
        where: { visit_id: input.visitId },
        include: {
          users_visit_photos_created_byTousers: {
            select: { username: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    }),

  // ユーザーID指定で写真取得
  getByUserId: publicProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findMany({
        where: { created_by: input.userId },
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
        orderBy: { created_at: "desc" },
      });
    }),

  // 写真作成
  create: publicProcedure
    .input(
      z.object({
        visit_id: z.number(),
        file_path: z.string().min(1, "ファイルパスは必須です"),
        description: z.string().default(""),
        created_by: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.create({
        data: {
          visit_id: input.visit_id,
          file_path: input.file_path,
          description: input.description,
          created_by: input.created_by,
          updated_by: input.created_by,
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
    }),

  // 写真更新
  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        file_path: z.string().min(1, "ファイルパスは必須です").optional(),
        description: z.string().optional(),
        updated_by: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, updated_by, ...updateData } = input;
      
      return await ctx.db.visit_photos.update({
        where: { photo_id: id },
        data: {
          ...updateData,
          updated_by,
          updated_at: new Date(),
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
    }),

  // 写真削除
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.delete({
        where: { photo_id: input.id },
      });
    }),

  // 場所ID指定で写真取得
  getByLocationId: publicProcedure
    .input(z.object({ locationId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.visit_photos.findMany({
        where: {
          visits: {
            location_id: input.locationId,
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
        orderBy: { created_at: "desc" },
      });
    }),

  // 複数写真を一括作成（1回の訪問で複数写真アップロード用）
  createMultiple: publicProcedure
    .input(
      z.object({
        visit_id: z.number(),
        photos: z.array(
          z.object({
            file_path: z.string().min(1, "ファイルパスは必須です"),
            description: z.string().default(""),
          }),
        ),
        created_by: z.number(),
      }),
    )
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
      }),
    ]);

    return {
      totalPhotos,
      photosByVisit,
      recentPhotos,
    };
  }),
});
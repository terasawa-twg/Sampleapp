import { createTRPCRouter, publicProcedure } from "../trpc";
import {
  createLocationSchema,
  updateLocationSchema,
  locationIdSchema,
  nearbyLocationSchema,
  searchLocationSchema,
  locationIncludeBasic,
  locationIncludeDetail,
} from "../schemas/locations";

// 共通の並び順
const defaultOrderBy = { created_at: "desc" } as const;

export const locationsRouter = createTRPCRouter({
  // 全場所取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.locations.findMany({
      include: locationIncludeBasic,
      orderBy: defaultOrderBy,
    });
  }),

  // ID指定で場所取得
  getById: publicProcedure
    .input(locationIdSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.locations.findUnique({
        where: { location_id: input.id },
        include: locationIncludeDetail,
      });
    }),

  // 場所作成
  create: publicProcedure
    .input(createLocationSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.locations.create({
        data: {
          name: input.name,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          description: input.description,
          created_by: input.created_by,
          updated_by: input.created_by,
        },
      });
    }),

  // 場所更新
  update: publicProcedure
    .input(updateLocationSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.locations.update({
        where: { location_id: input.id },
        data: {
          name: input.name,
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          description: input.description,
          updated_by: input.updated_by,
          updated_at: new Date(),
        },
      });
    }),

  // 場所削除
  delete: publicProcedure
    .input(locationIdSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.locations.delete({
        where: { location_id: input.id },
      });
    }),

  // 近くの場所を検索（緯度経度指定）
  getNearby: publicProcedure
    .input(nearbyLocationSchema)
    .query(async ({ ctx, input }) => {
      // 簡易的な距離計算（より正確にはHaversine公式を使用）
      const latDiff = 1 / 111; // 1km ≈ 1/111度
      const lonDiff = 1 / (111 * Math.cos(input.latitude * Math.PI / 180));
      const radius = input.radiusKm;

      return ctx.db.locations.findMany({
        where: {
          latitude: {
            gte: input.latitude - (radius * latDiff),
            lte: input.latitude + (radius * latDiff),
          },
          longitude: {
            gte: input.longitude - (radius * lonDiff),
            lte: input.longitude + (radius * lonDiff),
          },
        },
        include: locationIncludeBasic,
        orderBy: defaultOrderBy,
      });
    }),

  // 場所名で検索
  search: publicProcedure
    .input(searchLocationSchema)
    .query(async ({ ctx, input }) => {
      return ctx.db.locations.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { address: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        },
        include: locationIncludeBasic,
        orderBy: defaultOrderBy,
      });
    }),
});
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";

export const locationsRouter = createTRPCRouter({
  // 全場所取得
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.db.locations.findMany({
      include: {
        users_locations_created_byTousers: {
          select: { username: true },
        },
        _count: {
          select: { visits: true },
        },
      },
      orderBy: { created_at: "desc" },
    });
  }),

  // ID指定で場所取得
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.locations.findUnique({
        where: { location_id: input.id },
        include: {
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
        },
      });
    }),

  // 場所作成
  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, "場所名は必須です"),
        latitude: z.number().min(-90).max(90, "緯度は-90から90の間で入力してください"),
        longitude: z.number().min(-180).max(180, "経度は-180から180の間で入力してください"),
        address: z.string().default(""),
        description: z.string().default(""),
        created_by: z.number(),
      })
    )
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
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1, "場所名は必須です"),
        latitude: z.number().min(-90).max(90),
        longitude: z.number().min(-180).max(180),
        address: z.string().default(""),
        description: z.string().default(""),
        updated_by: z.number(),
      })
    )
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.locations.delete({
        where: { location_id: input.id },
      });
    }),

  // 近くの場所を検索（緯度経度指定）
  getNearby: publicProcedure
    .input(
      z.object({
        latitude: z.number(),
        longitude: z.number(),
        radiusKm: z.number().default(10), // デフォルト10km圏内
      })
    )
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
        include: {
          users_locations_created_byTousers: {
            select: { username: true },
          },
          _count: {
            select: { visits: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    }),

  // 場所名で検索
  search: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return ctx.db.locations.findMany({
        where: {
          OR: [
            { name: { contains: input.query, mode: "insensitive" } },
            { address: { contains: input.query, mode: "insensitive" } },
            { description: { contains: input.query, mode: "insensitive" } },
          ],
        },
        include: {
          users_locations_created_byTousers: {
            select: { username: true },
          },
          _count: {
            select: { visits: true },
          },
        },
        orderBy: { created_at: "desc" },
      });
    }),
});
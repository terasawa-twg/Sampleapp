import { type inferAsyncReturnType } from '@trpc/server';
// 相対パスに変更
import { createTRPCContext } from '../../api/trpc';
// 個別ルーターも相対パスに変更
import { usersRouter } from '../../api/routers/users';
import { visitsRouter } from '../../api/routers/visits';
import { locationsRouter } from '../../api/routers/locations';
import { visitPhotosRouter } from '../../api/routers/visit_photos';

// Session型の定義（next-auth未使用のため自作）
export interface Session {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  expires: string;
}

// 実際のtRPCコンテキスト型を推論
type TRPCContext = inferAsyncReturnType<typeof createTRPCContext>;

// テスト用に拡張されたコンテキスト型
export interface TestContext extends TRPCContext {
  session?: Session | null;
}

// テスト用のコンテキスト作成関数
export const createTestContext = async (session?: Session | null): Promise<TestContext> => {
  // 実際のコンテキスト作成関数を使用
  const baseContext = await createTRPCContext({
    headers: new Headers(),
  });

  // セッションを追加
  return {
    ...baseContext,
    session: session || null,
  };
};

// 個別ルーター用のcaller作成関数
export const createUsersCaller = (ctx: TestContext) => {
  return usersRouter.createCaller(ctx);
};

export const createVisitsCaller = (ctx: TestContext) => {
  return visitsRouter.createCaller(ctx);
};

export const createLocationsCaller = (ctx: TestContext) => {
  return locationsRouter.createCaller(ctx);
};

export const createVisitPhotosCaller = (ctx: TestContext) => {
  return visitPhotosRouter.createCaller(ctx);
};

// 便利なヘルパー関数
export const createMockSession = (userId: string = '1', email: string = 'test@example.com'): Session => {
  return {
    user: {
      id: userId,
      email,
      name: 'Test User',
      image: null,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24時間後
  };
};
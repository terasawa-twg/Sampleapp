import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./setup.ts'],
    include: ['**/*.test.ts'],
    exclude: ['node_modules', 'dist'],
    clearMocks: true,
    restoreMocks: true,
  },
  // tsconfigPaths() が tsconfig.json の paths を自動読み込みするため
  // resolve.alias は削除（競合を避ける）
  define: {
    'process.env.NODE_ENV': '"test"',
  },
});
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Starting a throwaway MongoDB takes longer than Vitest's default
    // 10-second limit for setup code — especially the first time, when it
    // has to download the database itself.
    hookTimeout: 120_000,
    testTimeout: 20_000,
  },
});

import { defineConfig } from 'vitest/config';

// Runs the lecture's intermediate test files — src/__tests__/*.stage.ts —
// which `npm test` deliberately skips. See src/__tests__/STAGES.md.
export default defineConfig({
  test: {
    include: ['src/__tests__/*.stage.ts'],
    hookTimeout: 120_000,
    testTimeout: 20_000,
  },
});

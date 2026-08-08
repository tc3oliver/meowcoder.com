import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Bound the scan explicitly. Parallel task execution creates git worktrees
    // under `.worktrees/`, and an unbounded scan would run other tasks'
    // in-flight test files as if they were this tree's.
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', '.astro/**', '.worktrees/**'],
  },
});

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Process CSS instead of stubbing it. `src/styles/design-system.test.ts`
    // asserts on the stylesheets' own text via `?raw`; with the default
    // `css: false` every CSS import resolves to an empty string and those
    // assertions would pass while checking nothing.
    css: true,
    // Bound the scan explicitly. Parallel task execution creates git worktrees
    // under `.worktrees/`, and an unbounded scan would run other tasks'
    // in-flight test files as if they were this tree's.
    include: ['src/**/*.test.ts'],
    exclude: ['node_modules/**', 'dist/**', '.astro/**', '.worktrees/**'],
  },
});

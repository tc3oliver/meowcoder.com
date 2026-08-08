import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'dist/',
      '.astro/',
      'node_modules/',
      // CLI-managed workflow artifacts, not application source.
      'backlog/',
      '.agent-workflow/',
      '.claude/',
      '.omc/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs['flat/recommended'],
  // Note: astro's `flat/jsx-a11y-recommended` is intentionally not enabled.
  // It requires eslint-plugin-jsx-a11y, which as of 6.10.2 peer-depends on
  // eslint <=9 and cannot install against eslint 10 without --legacy-peer-deps.
  // Accessibility is validated in MCD-11 (axe + Lighthouse + manual keyboard
  // testing) instead. Revisit when the plugin supports eslint 10.
  {
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];

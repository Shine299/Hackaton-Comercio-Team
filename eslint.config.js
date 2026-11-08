// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

/**
 * Reglas de arquitectura (ver README, «Reglas de dependencia»):
 *  1. Una feature importa a otra SOLO por su index.ts: `@/features/x` sí, `@/features/x/archivo` no.
 *  2. `shared/` no importa de `features/`.
 * Los ciclos entre features los revisa `npm run arch:check`.
 */
const DEEP_FEATURE_IMPORT = {
  group: ['@/features/*/*'],
  message: 'Importa la feature por su index.ts (`@/features/<nombre>`). Si falta, expórtalo desde ese index.ts.',
};
const SHARED_IMPORTS_FEATURE = {
  group: ['@/features', '@/features/*'],
  message: 'shared/ no puede importar de features/. Mueve lo compartido a shared/ o invierte la dependencia.',
};

module.exports = defineConfig([
  expoConfig,
  {
    // Las Edge Functions de Supabase son Deno (otro runtime y otros imports): se revisan aparte.
    ignores: ['dist/*', 'supabase/functions/**'],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [DEEP_FEATURE_IMPORT] }],
    },
  },
  {
    files: ['src/shared/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [DEEP_FEATURE_IMPORT, SHARED_IMPORTS_FEATURE] }],
    },
  },
  {
    // Las pruebas pueden usar datos de demo internos de una feature.
    files: ['src/**/*.test.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
]);

import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

const nodeGlobals = {
  process: 'readonly', Buffer: 'readonly', console: 'readonly',
  __dirname: 'readonly', __filename: 'readonly', global: 'readonly',
  setTimeout: 'readonly', clearTimeout: 'readonly', URL: 'readonly',
};
const jestGlobals = {
  describe: 'readonly', it: 'readonly', test: 'readonly', expect: 'readonly',
  beforeAll: 'readonly', beforeEach: 'readonly', afterAll: 'readonly',
  afterEach: 'readonly', jest: 'readonly',
};

export default [
  { ignores: ['**/dist/**', '**/node_modules/**', '**/.serverless/**', '**/coverage/**', '**/*.config.js', '**/jest.config.js'] },
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: 2023, sourceType: 'module' },
      globals: nodeGlobals,
    },
    plugins: { '@typescript-eslint': tseslint },
    rules: {
      ...tseslint.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-unused-vars': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
    },
  },
  {
    files: ['**/tests/**/*.ts', '**/*.test.ts'],
    languageOptions: { globals: { ...nodeGlobals, ...jestGlobals } },
  },
  prettier,
];

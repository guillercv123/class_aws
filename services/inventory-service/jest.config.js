/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@orderflow/shared$': '<rootDir>/../../libs/shared/src/index.ts' },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: { global: { branches: 50, functions: 65, lines: 65, statements: 65 } },
  clearMocks: true,
  restoreMocks: true,
};

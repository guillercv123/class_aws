/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@orderflow/shared$': '<rootDir>/../../libs/shared/src/index.ts' },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: { global: { branches: 45, functions: 60, lines: 60, statements: 60 } },
  clearMocks: true,
  restoreMocks: true,
};

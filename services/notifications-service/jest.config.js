/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: { '^@orderflow/shared$': '<rootDir>/../../libs/shared/src/index.ts' },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: { global: { branches: 40, functions: 60, lines: 55, statements: 55 } },
  clearMocks: true,
  restoreMocks: true,
};

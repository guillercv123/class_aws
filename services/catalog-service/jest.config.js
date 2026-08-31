/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@orderflow/shared$': '<rootDir>/../../libs/shared/src/index.ts',
  },
  testMatch: ['**/tests/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: { branches: 55, functions: 70, lines: 70, statements: 70 },
  },
  clearMocks: true,
  restoreMocks: true,
};

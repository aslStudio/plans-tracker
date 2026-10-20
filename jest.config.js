/** @type {import('jest').Config} */
module.exports = {
    preset: 'jest-expo',
    resolver: '<rootDir>/jest/resolver.js',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
    moduleNameMapper: {
        '\\.tgs$': '<rootDir>/jest/tgsMock.js',
        '^@/assets/(.*)$': '<rootDir>/assets/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '\\.svg$': '<rootDir>/jest/svgMock.js',
    },
    collectCoverageFrom: ['src/shared/ui/**/*.{ts,tsx}'],
}

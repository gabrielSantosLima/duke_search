module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.ts'],
    clearMocks: true,
    transform: {
        '^.+\\.ts$': ['ts-jest', {tsconfig: 'tsconfig.test.json'}],
    },
}

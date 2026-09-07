import js from '@eslint/js'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import {defineConfig} from 'eslint/config'

export default defineConfig([
    {
        ignores: ['web/**', 'dist/**', 'node_modules/**'],
    },
    {
        files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
        plugins: {js},
        extends: ['js/recommended'],
        languageOptions: {globals: globals.browser},
    },
    {
        files: ['jest.config.cjs'],
        languageOptions: {globals: globals.node},
    },
    {
        files: ['tests/**/*.ts'],
        languageOptions: {
            globals: {
                ...globals.node,
                jest: 'readonly',
                describe: 'readonly',
                it: 'readonly',
                test: 'readonly',
                expect: 'readonly',
                beforeAll: 'readonly',
                afterAll: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
    },
    tseslint.configs.recommended,
])

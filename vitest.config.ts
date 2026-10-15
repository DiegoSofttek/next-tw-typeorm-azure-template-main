import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

import { fileURLToPath } from 'node:url'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
    test: {
        environment: 'jsdom',
        coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.ts', 'src/**/*.tsx', 'packages/**/*.ts'],
        },
    },
})
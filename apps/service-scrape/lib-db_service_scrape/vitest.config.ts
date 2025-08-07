import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        pool: 'threads',
        reporters: ['verbose', 'github-actions'],
        logHeapUsage: true,
        setupFiles: ['./test/setup.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['text'],
            include: ['src/**/*.ts'],
            exclude: ['index.ts', 'migrator.ts'],
        },
    },
})

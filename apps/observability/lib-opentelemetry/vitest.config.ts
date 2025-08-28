import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        pool: 'threads',
        reporters: ['verbose', 'github-actions'],
        logHeapUsage: true,
        coverage: {
            provider: 'v8',
            reporter: ['text'],
            exclude: ['src/commitId.ts', 'src/startOpenTelemetry.ts', 'src/index.ts'],
            include: ['src/**/*.ts'],
        },
    },
})

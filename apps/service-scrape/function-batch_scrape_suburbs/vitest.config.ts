import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        pool: 'threads',
        reporters: ['verbose', 'github-actions'],
        logHeapUsage: true,
        coverage: {
            provider: 'v8',
            reporter: ['text'],
        },
    },
})

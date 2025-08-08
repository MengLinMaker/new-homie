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
            exclude: [
                'src/index.ts',
                'src/migrator.ts',
                'src/schema.ts',
                'src/migration/V0001__enable-postgis.ts',
            ],
        },
    },
})

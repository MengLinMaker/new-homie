import { safeqlConfig } from '@service-scrape/lib-db_service_scrape/dev'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
    globalIgnores(['dist']),
    // @ts-ignore
    tseslint.configs.recommended[0],
    {
        files: ['src/**/*.ts'],
    },
    // @ts-ignore
    ...safeqlConfig,
])

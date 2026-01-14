import { safeqlConfig } from '@service-scrape/lib-db_service_scrape/dev'
import tseslint from 'typescript-eslint'

export default tseslint.config(
    {
        files: ['src/**/*.ts'],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                projectService: true,
            },
        },
    },
    safeqlConfig,
)

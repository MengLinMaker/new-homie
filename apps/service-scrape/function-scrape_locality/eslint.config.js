import safeql from '@ts-safeql/eslint-plugin/config'
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
    safeql.configs.connections({
        databaseUrl: 'postgres://user:password@localhost:54320/db',
        targets: [{ tag: 'sql' }],
    }),
)

import safeql from '@ts-safeql/eslint-plugin/config'

export const safeqlConfig = [
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
    },
    safeql.configs.connections({
        databaseUrl: 'postgres://user:password@localhost:54320/db',
        targets: [
            {
                tag: 'sql',
                transform: [],
            },
        ],
    }),
]

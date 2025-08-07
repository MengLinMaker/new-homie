import path from 'node:path'
import { promises as fs } from 'node:fs'
import { Kysely, Migrator, PostgresDialect, FileMigrationProvider } from 'kysely'
import { Cli } from 'kysely-codegen'
import { exit } from 'node:process'

import type { DB } from './schema.ts'
import { ENV } from './env.ts'
import { LOG } from './logger.ts'

// CommonJS import only - no ESM support available
import pgImport from 'pg'
const { Pool, Client } = pgImport

LOG.info('DATABASE MIGRATION')

/**
 * @description Kysely database query builder
 * @link Kysely docs: https://kysely.dev/
 */
export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: ENV.POSTGRES_URL,
        }),
    }),
})

try {
    new Client({ connectionString: ENV.POSTGRES_URL }).connect()
    LOG.info('Database connected')
} catch {
    LOG.fatal('Database connection failed')
}

const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs,
        path,
        // Locate relative to the current file's directory
        migrationFolder: `${import.meta.dirname}/migration`,
    }),
})
const { error, results } = await migrator.migrateToLatest()
await db.destroy()

for (const result of results ?? []) {
    if (result.status === 'Success') {
        LOG.info(`Migration succeeded - "${result.migrationName}"`)
    } else if (result.status === 'Error') {
        LOG.error(`Migration failed - "${result.migrationName}"`)
    }
}

if (error) {
    LOG.fatal('MIGRATION FAILED')
    exit(1)
}

try {
    const codegenCli = new Cli()
    await codegenCli.generate({
        outFile: path.join(import.meta.dirname, 'schema.ts'),
        dialect: 'postgres',
        url: ENV.POSTGRES_URL,
        includePattern: '*_(table)',
    })
} catch {
    LOG.fatal('KYSELY CODE GENERATION FAILED')
    exit(1)
}
exit(0)

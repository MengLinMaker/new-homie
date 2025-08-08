import path from 'node:path'
import { promises as fs } from 'node:fs'
import { Migrator, FileMigrationProvider } from 'kysely'
import { Cli } from 'kysely-codegen'
import pino from 'pino'

import { getKyselyPostgresDb } from './connection.ts'

export const LOG = pino({
    transport: {
        target: 'pino-pretty',
    },
})

export const kyselyPostgresMigrate = async (connectionString: string) => {
    LOG.info('DATABASE MIGRATION')
    const db = await getKyselyPostgresDb(connectionString)
    if (db === null) {
        LOG.fatal('Invalid uri or database is not running')
        return db
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

    for (const result of results ?? []) {
        if (result.status === 'Success') {
            LOG.info(`Migration succeeded - "${result.migrationName}"`)
        } else if (result.status === 'Error') {
            LOG.error(`Migration failed - "${result.migrationName}"`)
        }
    }

    if (error) {
        LOG.fatal('MIGRATION FAILED')
        return db
    }

    try {
        const codegenCli = new Cli()
        await codegenCli.generate({
            outFile: path.join(import.meta.dirname, 'schema.ts'),
            dialect: 'postgres',
            url: connectionString,
            includePattern: '*_(table)',
            runtimeEnums: true,
        })
        LOG.info('Kysely code generated')
    } catch {
        LOG.fatal('Kysely code generation failed')
        return db
    }

    LOG.info('DATABASE MIGRATION COMPLETED')
    return db
}

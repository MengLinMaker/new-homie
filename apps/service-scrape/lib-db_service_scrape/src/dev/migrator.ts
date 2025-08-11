import path from 'node:path'
import { promises as fs } from 'node:fs'
import { Migrator, FileMigrationProvider } from 'kysely'

import { getKyselyPostgresDb } from '../connection.ts'
import { LOG } from './log.ts'

/**
 * Migrates postgis database
 * @param connectionString - Postgis uri
 * @param migrationFolder - Folder of Kysely migration scripts
 * @returns db - Kysely database query builder
 */
export const kyselyPostgisMigrate = async (
    connectionString: string,
    migrationFolder: string = `${import.meta.dirname}/../migration`,
) => {
    LOG.debug('DATABASE MIGRATION')
    const db = await getKyselyPostgresDb(connectionString)
    if (db === null) {
        LOG.fatal('MIGRATION FAILED - Invalid uri or database is not running')
        return db
    }

    const migrator = new Migrator({
        db,
        provider: new FileMigrationProvider({
            fs,
            path,
            migrationFolder,
        }),
    })
    const { error, results } = await migrator.migrateToLatest()

    for (const result of results ?? []) {
        if (result.status === 'Success') {
            LOG.debug(`Migration succeeded - "${result.migrationName}"`)
        } else if (result.status === 'Error') {
            LOG.debug(`Migration failed - "${result.migrationName}"`)
        }
    }

    if (error) {
        LOG.fatal('MIGRATION FAILED - could not migrate files')
        return db
    }

    LOG.debug('DATABASE MIGRATION COMPLETED')
    return db
}

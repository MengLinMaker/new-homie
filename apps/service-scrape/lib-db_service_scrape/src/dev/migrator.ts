import path from 'node:path'
import { promises as fs } from 'node:fs'
import { Migrator, FileMigrationProvider } from 'kysely'

import { getKyselyPostgresDb } from '../connection.ts'
import type { DB } from '../schema-write.ts'

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
    console.debug(`DATABASE MIGRATION from ${path.join(import.meta.dirname, '../migration')}`)
    const db = getKyselyPostgresDb<DB>(connectionString)
    if (db === null) {
        console.error('MIGRATION FAILED - Invalid uri or database is not running')
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
            console.debug(`Migration succeeded - "${result.migrationName}"`)
        } else if (result.status === 'Error') {
            console.error(`Migration failed - "${result.migrationName}"`)
        }
    }

    if (error) {
        console.log(error)
        console.error('MIGRATION FAILED - could not migrate files')
        return db
    }

    console.debug('DATABASE MIGRATION COMPLETED')
    return db
}

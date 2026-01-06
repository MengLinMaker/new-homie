import { Cli } from 'kysely-codegen'
import { execSync } from 'node:child_process'
import path from 'node:path'

/**
 * Generates schema from migrated Postgis database
 * @param connectionString - Postgis uri
 * @returns success - true or false
 */
export const kyselyPostgisGenerateSchema = async (connectionString: string) => {
    try {
        const codegenCli = new Cli()
        await codegenCli.generate({
            outFile: path.join(import.meta.dirname, '../schema-write.ts'),
            dialect: 'postgres',
            url: connectionString,
            includePattern: '*_(table)',
            runtimeEnums: false,
        })
        console.debug('Kysely code generated')
        execSync(
            [
                `pg_dump -d ${connectionString} --exclude-table=kysely_migration --exclude-table=kysely_migration_lock`,
                `| sed -E 's/[\\](un)?restrict /-- /g'`,
                `| sed -E 's/[\\][.]//g'`,
                `> src/dev/schema.sql`,
            ].join(' '),
        )
        console.debug('Schema Dumped')
        return true
    } catch {
        console.error('Kysely code generation failed')
        return false
    }
}

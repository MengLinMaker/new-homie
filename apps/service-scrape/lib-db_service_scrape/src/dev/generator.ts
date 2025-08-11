import { Cli } from 'kysely-codegen'
import path from 'node:path'
import { LOG } from './log.ts'

/**
 * Generates schema from migrated Postgis database
 * @param connectionString - Postgis uri
 * @returns success - true or false
 */
export const kyselyPostgisGenerateSchema = async (connectionString: string) => {
    try {
        const codegenCli = new Cli()
        await codegenCli.generate({
            outFile: path.join(import.meta.dirname, '../schema.ts'),
            dialect: 'postgres',
            url: connectionString,
            includePattern: '*_(table)',
            runtimeEnums: true,
        })
        LOG.debug('Kysely code generated')
        return true
    } catch {
        LOG.fatal('Kysely code generation failed')
        return false
    }
}

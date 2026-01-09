import { Cli } from 'kysely-codegen'
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
        return true
    } catch {
        console.error('Kysely code generation failed')
        return false
    }
}

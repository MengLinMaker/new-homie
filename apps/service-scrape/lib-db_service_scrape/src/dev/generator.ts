import path from 'node:path'
import kanel from 'kanel'
import kanelKysely from 'kanel-kysely'
import kanelZod from 'kanel-zod'
import { Cli } from 'kysely-codegen'

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
        await kanel.processDatabase({
            connection: connectionString,
            outputPath: path.join(import.meta.dirname, '../schema'),
            resolveViews: true,
            preDeleteOutputFolder: true,
            enumStyle: 'type',
            preRenderHooks: [
                kanelZod.makeGenerateZodSchemas({
                    getZodSchemaMetadata: kanelZod.defaultGetZodSchemaMetadata,
                    getZodIdentifierMetadata: kanelZod.defaultGetZodIdentifierMetadata,
                    castToSchema: true,
                    zodTypeMap: {
                        ...kanelZod.defaultZodTypeMap,
                        'public.geometry': 'z.string()',
                    },
                }),
            ],
            customTypeMap: { 'public.geometry': 'string' },
            // Remove kysely migration tables
            typeFilter: kanelKysely.kyselyTypeFilter,
        })
        console.debug('Kysely code generated')
        return true
    } catch {
        console.error('Kysely code generation failed')
        return false
    }
}

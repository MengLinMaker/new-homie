import { Kysely, PostgresDialect } from 'kysely'
import { z } from 'zod'

import type { DB } from './schema.ts'

// CommonJS import only - no ESM support available
import pgImport from 'pg'
const { Pool } = pgImport

/**
 * @description Kysely database query builder
 * @link Kysely docs: https://kysely.dev/
 */

export const getKyselyPostgresDb = async (postgresUri: string) => {
    try {
        const validUri = z
            .string()
            .regex(/postgres(ql)?:\/\/\w+:\w+@[\w-.:]+\/\w+((\?)(\w+=\w+)+)?/, {
                message: 'Invalid postgres uri',
            })
            .parse(postgresUri)
        const db = new Kysely<DB>({
            dialect: new PostgresDialect({
                pool: new Pool({ connectionString: validUri }),
            }),
        })
        return db
    } catch {
        return null
    }
}

import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`.execute(db)
}

export async function down(db: Kysely<DB>) {
    await sql`DROP EXTENSION IF EXISTS postgis`.execute(db)
}

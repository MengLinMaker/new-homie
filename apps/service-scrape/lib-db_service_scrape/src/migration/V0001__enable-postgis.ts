import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>): Promise<void> {
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`.execute(db)
}

export async function down(db: Kysely<DB>): Promise<void> {
    await sql`DROP EXTENSION IF EXISTS postgis`.execute(db)
}

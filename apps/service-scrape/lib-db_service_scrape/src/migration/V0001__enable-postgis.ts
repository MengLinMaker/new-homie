import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await sql`CREATE EXTENSION IF NOT EXISTS postgis`.execute(db)
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await sql`DROP EXTENSION IF EXISTS postgis`.execute(db)
}

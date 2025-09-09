import type { Kysely } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>): Promise<void> {
    await db.schema
        .alterTable('home_table')
        .alterColumn('gps', (ac) => ac.dropNotNull())
        .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema
        .alterTable('home_table')
        .alterColumn('gps', (ac) => ac.setNotNull())
        .execute()
}

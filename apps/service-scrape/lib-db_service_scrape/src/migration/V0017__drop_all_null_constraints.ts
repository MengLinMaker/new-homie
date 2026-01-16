import type { Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .alterTable('school_table')
        .alterColumn('url', (ac) => ac.setNotNull())
        .execute()
    await db.schema
        .alterTable('home_table')
        .alterColumn('gps', (ac) => ac.setNotNull())
        .alterColumn('inspection_time', (ac) => ac.setNotNull())
        .alterColumn('auction_time', (ac) => ac.setNotNull())
        .execute()
}

export async function down(_db: Kysely<DB>) {}

import { type Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema.dropView('latest_sale_view').execute()
    await db.schema.dropView('latest_rent_view').execute()
}

export async function down(db: Kysely<DB>) {}

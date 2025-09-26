import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createTable('sale_price_table')
        .addColumn('id', 'integer', (col) => col.notNull().primaryKey().generatedAlwaysAsIdentity())
        .addColumn('home_table_id', 'integer', (col) => col.notNull().references('home_table.id'))
        .addColumn('first_scrape_date', 'date', (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn('last_scrape_date', 'date', (col) => col.notNull().defaultTo(sql`now()`))
        .addColumn('higher_price_aud', 'integer', (col) => col.notNull())
        .addColumn('aud_per_bed', 'real', (col) => col.notNull())
        .addColumn('aud_per_land_m2', 'real', (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropTable('sale_price_table').execute()
}

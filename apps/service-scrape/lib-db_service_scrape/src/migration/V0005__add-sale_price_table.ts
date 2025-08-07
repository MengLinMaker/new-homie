import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('sale_price_table')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn('home_table_id', 'integer', (col) => col.references('home_table.id'))
        .addColumn('first_scrape_date', 'date', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('last_scrape_date', 'date', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('higher_price_aud', 'integer', (col) => col.notNull())
        .addColumn('aud_per_bed', 'timestamptz')
        .addColumn('aud_per_land_m2', 'timestamptz')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('sale_price_table').execute()
}

import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('rent_price_table')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedAlwaysAsIdentity())
        .addColumn('home_table_id', 'integer', (col) => col.notNull())
        .addForeignKeyConstraint(
            'rent_price_table_home_table_id_fk',
            ['home_table_id'],
            'home_table',
            ['id'],
        )
        .addColumn('first_scrape_date', 'date', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('last_scrape_date', 'date', (col) => col.defaultTo(sql`now()`).notNull())
        .addColumn('weekly_rent_aud', 'real', (col) => col.notNull())
        .addColumn('aud_per_bed', 'real')
        .addColumn('aud_per_land_m2', 'real')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('rent_price_table').execute()
}

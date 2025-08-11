import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createTable('home_table')
        .addColumn('id', 'integer', (col) =>
            col.notNull().primaryKey().generatedByDefaultAsIdentity(),
        )
        .addColumn('localities_table_id', 'integer', (col) =>
            col.notNull().references('localities_table.id'),
        )
        .addColumn('common_features_table_id', 'integer', (col) =>
            col.notNull().references('common_features_table.id'),
        )
        .addColumn('street_address', 'text', (col) => col.notNull())
        .addCheckConstraint(
            'home_table_street_address_check',
            sql`LENGTH(street_address) > 0 AND LENGTH(street_address) < 64`,
        )
        .addColumn('gps', sql`geometry(point)`, (col) => col.notNull())
        .addColumn('land_m2', 'integer', (col) => col.notNull())
        .addCheckConstraint('home_table_land_m2_check', sql`land_m2 >= 0`)
        .addColumn('inspection_time', 'timestamptz')
        .addColumn('auction_time', 'timestamptz')
        .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropTable('home_table').execute()
}

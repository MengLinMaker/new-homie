import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createTable('home_table')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn('localities_table_id', 'integer', (col) => col.references('localities_table.id'))
        .addColumn('common_features_table_id', 'integer', (col) =>
            col.references('common_features_table.id'),
        )
        .addColumn('street_address', 'text', (col) => col.notNull())
        .addCheckConstraint(
            'home_table_street_address_check',
            sql`LENGTH("home_table"."street_address") < 64`,
        )
        .addColumn('gps', sql`geometry(point)`, (col) => col.notNull())
        .addColumn('land_m2', 'integer')
        .addColumn('inspection_time', 'time')
        .addColumn('auction_time', 'time')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('home_table').execute()
}

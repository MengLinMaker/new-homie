import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>): Promise<void> {
    await db.schema
        .createTable('home_table')
        .addColumn('id', 'integer', (col) =>
            col.notNull().primaryKey().generatedByDefaultAsIdentity(),
        )
        .addColumn('locality_table_id', 'integer', (col) =>
            col.notNull().references('locality_table.id'),
        )
        .addColumn('home_feature_table_id', 'integer', (col) =>
            col.notNull().references('home_feature_table.id'),
        )
        .addColumn('street_address', 'text', (col) => col.notNull())
        .addUniqueConstraint('home_table_locality_table_id_street_address_unique', [
            'locality_table_id',
            'street_address',
        ])
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

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema.dropTable('home_table').execute()
}

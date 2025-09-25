import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createTable('school_table')
        .addColumn('id', 'integer', (col) => col.notNull().primaryKey().generatedAlwaysAsIdentity())
        .addColumn('locality_table_id', 'integer', (col) =>
            col.notNull().references('locality_table.id'),
        )
        .addColumn('school_feature_table_id', 'integer', (col) =>
            col.notNull().references('school_feature_table.id'),
        )
        .addColumn('acara_id', 'integer', (col) => col.notNull())
        .addUniqueConstraint('school_table_acara_id_unique', ['acara_id'])
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('url', 'text')
        .addColumn('gps', sql`geometry(point)`, (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropTable('rent_price_table').execute()
}

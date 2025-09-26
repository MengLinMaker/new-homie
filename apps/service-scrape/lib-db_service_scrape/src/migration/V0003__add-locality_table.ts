import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createType('state_abbreviation_enum')
        .asEnum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'])
        .execute()
    await db.schema
        .createTable('locality_table')
        .addColumn('id', 'integer', (col) =>
            col.notNull().primaryKey().generatedByDefaultAsIdentity(),
        )
        .addColumn('suburb_name', 'text', (col) => col.notNull())
        .addCheckConstraint(
            'locality_table_suburb_name_check',
            sql`LENGTH(suburb_name) > 0 AND LENGTH(suburb_name) < 64`,
        )
        .addColumn('postcode', 'text', (col) => col.notNull())
        .addCheckConstraint('locality_table_postcode_check', sql`LENGTH(postcode) = 4`)
        .addColumn('state_abbreviation', sql`state_abbreviation_enum`, (col) => col.notNull())
        .addUniqueConstraint('locality_table_suburb_name_postcode_state_abbreviation_unique', [
            'suburb_name',
            'postcode',
            'state_abbreviation',
        ])
        .addColumn('boundary_coordinates', sql`geometry(polygon)`, (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<DB>) {
    await db.schema.dropType('state_abbreviation_enum').execute()
    await db.schema.dropTable('common_features_table').execute()
}

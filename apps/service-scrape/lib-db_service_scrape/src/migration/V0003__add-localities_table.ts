import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createType('state_abbreviation_enum')
        .asEnum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'])
        .execute()
    await db.schema
        .createTable('localities_table')
        .addColumn('id', 'integer', (col) =>
            col.notNull().primaryKey().generatedByDefaultAsIdentity(),
        )
        .addColumn('suburb_name', 'text', (col) => col.notNull())
        .addCheckConstraint(
            'localities_table_suburb_name_check',
            sql`LENGTH("localities_table"."suburb_name") < 64`,
        )
        .addColumn('postcode', 'text', (col) => col.notNull())
        .addCheckConstraint(
            'localities_table_postcode_check',
            sql`LENGTH("localities_table"."postcode") = 4`,
        )
        .addColumn('state_abbreviation', sql`state_abbreviation_enum`, (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropType('state_abbreviation_enum').execute()
    await db.schema.dropTable('common_features_table').execute()
}

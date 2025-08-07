import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db.schema
        .createType('home_type_enum')
        .asEnum(['ApartmentUnitFlat', 'House', 'Townhouse', 'BlockOfUnits'])
        .execute()
    await db.schema
        .createTable('common_features_table')
        .addColumn('id', 'integer', (col) => col.primaryKey().generatedByDefaultAsIdentity())
        .addColumn('bed_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint(
            'common_features_table_bed_quantity_check',
            sql`"bed_quantity" >= 1 AND "bed_quantity" <= 5`,
        )
        .addColumn('bath_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint(
            'common_features_table_bath_quantity_check',
            sql`"bath_quantity" >= 1 AND "bath_quantity" <= 5`,
        )
        .addColumn('car_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint(
            'common_features_table_car_quantity_check',
            sql`"car_quantity" >= 0 AND "car_quantity" <= 5`,
        )
        .addColumn('home_type', sql`home_type_enum`, (col) => col.notNull())
        .addColumn('is_retirement', 'boolean', (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropType('home_type_enum').execute()
    await db.schema.dropTable('common_features_table').execute()
}

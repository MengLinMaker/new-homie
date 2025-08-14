import { type Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>): Promise<void> {
    await db.schema
        .createType('home_type_enum')
        // Enums are taken from "ptype" query param
        .asEnum([
            'Apartment', // Not specified in "ptype" query param
            'ApartmentUnitFlat',
            'BlockOfUnits',
            'DevelopmentSite',
            'Duplex',
            'FreeStanding',
            'House', // Not specified in "ptype" query param
            'Land', // Not specified in "ptype" query param
            'NewApartments',
            'NewHomeDesigns',
            'NewHouseLand',
            'NewLand',
            'PentHouse',
            'Retirement', // Not specified in "ptype" query param
            'SemiDetached',
            'Studio',
            'Terrace',
            'TownHouse',
            'VacantLand',
            'Villa',
        ])
        .execute()
    await db.schema
        .createTable('common_features_table')
        .addColumn('id', 'integer', (col) =>
            col.notNull().primaryKey().generatedByDefaultAsIdentity(),
        )
        .addColumn('bed_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint('common_features_table_bed_quantity_check', sql`bed_quantity >= 0`)
        .addColumn('bath_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint('common_features_table_bath_quantity_check', sql`bath_quantity >= 0`)
        .addColumn('car_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint('common_features_table_car_quantity_check', sql`car_quantity >= 0`)
        .addColumn('home_type', sql`home_type_enum`, (col) => col.notNull())
        .addColumn('is_retirement', 'boolean', (col) => col.notNull())
        .execute()
}

export async function down(db: Kysely<unknown>): Promise<void> {
    await db.schema.dropType('home_type_enum').execute()
    await db.schema.dropTable('common_features_table').execute()
}

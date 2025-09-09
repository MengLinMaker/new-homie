import { type Kysely, sql } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>): Promise<void> {
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
            'Townhouse', // Follow spelling in filter
            'VacantLand',
            'Villa',
        ])
        .execute()
    await db.schema
        .createTable('home_feature_table')
        .addColumn('id', 'integer', (col) =>
            col.notNull().primaryKey().generatedByDefaultAsIdentity(),
        )
        .addColumn('bed_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint('home_feature_table_bed_quantity_check', sql`bed_quantity >= 0`)
        .addColumn('bath_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint('home_feature_table_bath_quantity_check', sql`bath_quantity >= 0`)
        .addColumn('car_quantity', 'integer', (col) => col.notNull())
        .addCheckConstraint('home_feature_table_car_quantity_check', sql`car_quantity >= 0`)
        .addColumn('home_type', sql`home_type_enum`, (col) => col.notNull())
        .addColumn('is_retirement', 'boolean', (col) => col.notNull())
        .addUniqueConstraint('home_feature_table_unique', [
            'bed_quantity',
            'bath_quantity',
            'car_quantity',
            'home_type',
            'is_retirement',
        ])
        .execute()
}

export async function down(db: Kysely<DB>): Promise<void> {
    await db.schema.dropType('home_type_enum').execute()
    await db.schema.dropTable('home_feature_table').execute()
}

import type { Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createIndex('rent_price_table_last_scrape_date_idx')
        .on('rent_price_table')
        .column('last_scrape_date')
        .execute()
    const highest_last_scrape_date = db
        .selectFrom('rent_price_table')
        // @ts-expect-error: Kysely bug with aggregate functions in subqueries
        .select(({ fn }) => fn.max('last_scrape_date'))
    const latest_rent_view = db
        .selectFrom('rent_price_table')
        .leftJoin('home_table', 'rent_price_table.home_table_id', 'home_table.id')
        .leftJoin('home_feature_table', 'home_table.home_feature_table_id', 'home_feature_table.id')
        .leftJoin('locality_table', 'home_table.locality_table_id', 'locality_table.id')
        .select([
            // rent_price_table columns
            'first_scrape_date',
            'last_scrape_date',
            'weekly_rent_aud',
            'aud_per_bed',
            'aud_per_land_m2',
            // home_table columns
            'home_table_id',
            'street_address',
            'gps',
            'land_m2',
            'inspection_time',
            'auction_time',
            // home_feature_table columns
            'home_feature_table_id',
            'bed_quantity',
            'bath_quantity',
            'car_quantity',
            'home_type',
            'is_retirement',
            // locality_table columns
            'locality_table_id',
            'suburb_name',
            'state_abbreviation',
            'postcode',
            'boundary_coordinates',
        ])
        .where('last_scrape_date', '=', highest_last_scrape_date)
    await db.schema.createView('latest_rent_view').as(latest_rent_view).execute()
}

export async function down(db: Kysely<DB>) {
    db.schema.dropView('latest_rent_view').execute()
    db.schema.dropIndex('rent_price_table_last_scrape_date_idx').execute()
}

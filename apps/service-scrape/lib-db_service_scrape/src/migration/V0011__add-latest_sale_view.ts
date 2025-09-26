import type { Kysely } from 'kysely'
import type { DB } from '../schema.ts'

export async function up(db: Kysely<DB>) {
    await db.schema
        .createView('latest_sale_view')
        .as(
            db
                .selectFrom('sale_price_table')
                .leftJoin('home_table', 'sale_price_table.home_table_id', 'home_table.id')
                .leftJoin(
                    'home_feature_table',
                    'home_table.home_feature_table_id',
                    'home_feature_table.id',
                )
                .leftJoin('locality_table', 'home_table.locality_table_id', 'locality_table.id')
                .select([
                    // sale_price_table columns
                    'first_scrape_date',
                    'last_scrape_date',
                    'higher_price_aud',
                    'aud_per_bed',
                    'aud_per_land_m2',
                    //  home_table columns
                    'street_address',
                    'gps',
                    'land_m2',
                    'inspection_time',
                    'auction_time',
                    // home_feature_table columns
                    'suburb_name',
                    'state_abbreviation',
                    'postcode',
                    'boundary_coordinates',
                    // locality_table columns
                    'bed_quantity',
                    'bath_quantity',
                    'car_quantity',
                    'home_type',
                    'is_retirement',
                ])
                .where(
                    'last_scrape_date',
                    '=',
                    db
                        .selectFrom('sale_price_table')
                        // @ts-expect-error: Kysely bug with aggregate functions in subqueries
                        .select(({ fn }) => fn.max('last_scrape_date')),
                ),
        )
        .execute()
}

export async function down(db: Kysely<DB>) {
    db.schema.dropView('latest_sale_view').execute()
}

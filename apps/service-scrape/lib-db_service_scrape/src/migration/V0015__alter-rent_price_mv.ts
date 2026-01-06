import { sql, type Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    const latest_rent_mv = sql`
    WITH scrape_dates AS (
        SELECT last_scrape_date, COUNT(*) AS frequency
        FROM rent_price_table
        WHERE last_scrape_date > NOW() - INTERVAL '4 days'
        GROUP BY last_scrape_date
        ORDER BY frequency DESC
        LIMIT 2
    ),
    latest_rent_price AS (
        SELECT DISTINCT ON (home_table_id) *
        FROM rent_price_table
        WHERE last_scrape_date >= (
            SELECT MAX(last_scrape_date) FROM scrape_dates
        )
        ORDER BY home_table_id, last_scrape_date DESC
    )
    SELECT first_scrape_date, last_scrape_date, weekly_rent_aud, aud_per_bed, aud_per_land_m2,
        auction_time, ST_X(gps) as longitude, ST_Y(gps) as latitude,
        inspection_time, land_m2, locality_table_id, street_address,
        bed_quantity, bath_quantity, car_quantity, home_type, is_retirement
    FROM latest_rent_price
    LEFT JOIN home_table ON home_table_id = home_table.id
    LEFT JOIN home_feature_table ON home_table.home_feature_table_id = home_feature_table.id`
    await db.schema.createView('latest_rent_mv').materialized().as(latest_rent_mv).execute()
    await db.schema.dropView('latest_rent_view')
}

export async function down(db: Kysely<DB>) {
    db.schema.dropView('latest_rent_mv').execute()
}

import { sql, type Kysely } from 'kysely'
import type { DB } from '../schema-write.ts'

export async function up(db: Kysely<DB>) {
    const latest_sale_mv = sql`
    WITH scrape_dates AS (
        SELECT last_scrape_date, COUNT(*) AS frequency
        FROM sale_price_table
        WHERE last_scrape_date > NOW() - INTERVAL '1 week'
        GROUP BY last_scrape_date
        ORDER BY frequency DESC
        LIMIT 2
    ),
    latest_sale_price AS (
        SELECT DISTINCT ON (home_table_id) *
        FROM sale_price_table
        WHERE last_scrape_date >= (
            SELECT MAX(last_scrape_date) FROM scrape_dates
        )
        ORDER BY home_table_id, last_scrape_date DESC
    )
    SELECT first_scrape_date, last_scrape_date, higher_price_aud, aud_per_bed, aud_per_land_m2,
        auction_time, ST_X(gps) as longitude, ST_Y(gps) as latitude,
        inspection_time, land_m2, locality_table_id, street_address,
        bed_quantity, bath_quantity, car_quantity, home_type, is_retirement
    FROM latest_sale_price
    LEFT JOIN home_table ON home_table_id = home_table.id
    LEFT JOIN home_feature_table ON home_table.home_feature_table_id = home_feature_table.id`
    await db.schema.createView('latest_sale_mv').materialized().as(latest_sale_mv).execute()
    await db.schema.dropView('latest_sale_view')
}

export async function down(db: Kysely<DB>) {
    db.schema.dropView('latest_sale_mv').execute()
}

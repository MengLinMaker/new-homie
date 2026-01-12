import { IDatabased } from '../../global/IDatabased'
import type { RemoveTableIds, SchemaWrite } from '@service-scrape/lib-db_service_scrape'
import { sql } from 'kysely'

const datesAreOnSameDay = (first: Date, second: Date) =>
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()

export class ScrapeModel extends IDatabased {
    async tryUpdateLocality(args: {
        suburbData: {
            locality_table: RemoveTableIds<SchemaWrite.LocalityTable>
        }
    }) {
        try {
            const lt = args.suburbData.locality_table
            const upsertLocality = await sql<{ id: number }>`
            INSERT INTO locality_table (
                boundary_coordinates,
                postcode,
                state_abbreviation,
                suburb_name
            )
            VALUES (
                ${lt.boundary_coordinates},
                ${lt.postcode},
                ${lt.state_abbreviation}::state_abbreviation_enum,
                ${lt.suburb_name}
            )
            ON CONFLICT (
                suburb_name,
                state_abbreviation,
                postcode
            )
            DO UPDATE SET
                boundary_coordinates = EXCLUDED.boundary_coordinates,
                postcode = EXCLUDED.postcode,
                state_abbreviation = EXCLUDED.state_abbreviation,
                suburb_name = EXCLUDED.suburb_name
            RETURNING id;`.execute(this.DB)
            return upsertLocality.rows[0]
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateLocality, args, e)
            return null
        }
    }

    async tryUpdateSchool(args: {
        schoolData: {
            school_table: RemoveTableIds<SchemaWrite.SchoolTable>
            school_feature_table: RemoveTableIds<SchemaWrite.SchoolFeatureTable>
        }
        localityId: number
    }) {
        try {
            const sft = args.schoolData.school_feature_table
            const upsertSchoolFeature = await sql<{ id: number }>`
            INSERT INTO school_feature_table (
                "primary",
                secondary,
                government_sector,
                independent,
                special_needs
            )
            VALUES (
                ${sft.primary}::boolean,
                ${sft.secondary}::boolean,
                ${sft.government_sector}::boolean,
                ${sft.independent}::boolean,
                ${sft.special_needs}::boolean
            )
            ON CONFLICT (
                "primary",
                secondary,
                government_sector,
                independent,
                special_needs
            )
            DO UPDATE SET
                "primary" = EXCLUDED.primary,
                secondary = EXCLUDED.secondary,
                government_sector = EXCLUDED.government_sector,
                independent = EXCLUDED.independent,
                special_needs = EXCLUDED.special_needs
            RETURNING id;`.execute(this.DB)

            const st = args.schoolData.school_table
            const upsertSchool = sql<{ id: number }>`
            INSERT INTO school_table (
                school_feature_table_id,
                locality_table_id,
                name,
                url,
                acara_id,
                gps
            )
            VALUES (
                ${upsertSchoolFeature.rows[0]!.id},
                ${args.localityId},
                ${st.name},
                ${st.url!},
                ${st.acara_id}::integer,
                ${st.gps}
            )
            ON CONFLICT ( acara_id )
            DO UPDATE SET
                school_feature_table_id = EXCLUDED.school_feature_table_id,
                locality_table_id = EXCLUDED.locality_table_id,
                name = EXCLUDED.name,
                url = EXCLUDED.url,
                acara_id = EXCLUDED.acara_id,
                gps = EXCLUDED.gps
            RETURNING id;`
            await upsertSchool.execute(this.DB)
            return true
        } catch (e) {
            console.log(e)
            this.logExceptionArgs('error', this.tryUpdateSchool, args, e)
            return false
        }
    }

    private async updateListing(args: {
        listingData: {
            home_feature_table: RemoveTableIds<SchemaWrite.HomeFeatureTable>
            home_table: RemoveTableIds<SchemaWrite.HomeTable>
        }
        localityId: number
    }) {
        const hft = args.listingData.home_feature_table
        const upsertHomeFeature = await sql<{ id: number }>`
        INSERT INTO home_feature_table (
            bath_quantity,
            bed_quantity,
            car_quantity,
            home_type,
            is_retirement
        )
        VALUES (
            ${hft.bath_quantity}::integer,
            ${hft.bed_quantity}::integer,
            ${hft.car_quantity}::integer,
            ${hft.home_type}::home_type_enum,
            ${hft.is_retirement}::boolean
        )
        ON CONFLICT (
            bath_quantity,
            bed_quantity,
            car_quantity,
            home_type,
            is_retirement
        )
        DO UPDATE SET
            bath_quantity = EXCLUDED.bath_quantity,
            bed_quantity = EXCLUDED.bed_quantity,
            car_quantity = EXCLUDED.car_quantity,
            home_type = EXCLUDED.home_type,
            is_retirement = EXCLUDED.is_retirement
        RETURNING id;`.execute(this.DB)

        const ht = args.listingData.home_table
        // COALESCE to prefer non null values that exist
        const upsertHome = await sql<{ id: number }>`
        INSERT INTO home_table (
            locality_table_id,
            gps,
            auction_time,
            home_feature_table_id,
            inspection_time,
            land_m2,
            street_address
        )
        VALUES (
            ${args.localityId},
            ${ht.gps},
            ${ht.auction_time as Date | null},
            ${upsertHomeFeature.rows[0]!.id},
            ${ht.inspection_time as Date | null},
            ${ht.land_m2}::integer,
            ${ht.street_address}
        )
        ON CONFLICT (
            street_address,
            locality_table_id
        )
        DO UPDATE SET
            locality_table_id = EXCLUDED.locality_table_id,
            gps = COALESCE(EXCLUDED.gps, home_table.gps),
            auction_time = EXCLUDED.auction_time,
            home_feature_table_id = EXCLUDED.home_feature_table_id,
            inspection_time = EXCLUDED.inspection_time,
            land_m2 = GREATEST(EXCLUDED.land_m2, home_table.land_m2),
            street_address = EXCLUDED.street_address
        RETURNING id;`.execute(this.DB)
        return upsertHome.rows[0]!
    }

    async tryUpdateRentListing(args: {
        rentData: {
            home_feature_table: RemoveTableIds<SchemaWrite.HomeFeatureTable>
            home_table: RemoveTableIds<SchemaWrite.HomeTable>
            rent_price_table: Omit<
                RemoveTableIds<SchemaWrite.RentPriceTable>,
                `${string}_scrape_date`
            >
        }
        localityId: number
    }) {
        try {
            const home_table = await this.updateListing({
                listingData: args.rentData,
                localityId: args.localityId,
            })

            const getLastRentScrapeData = await sql<{
                id: number
                last_scrape_date: Date
                weekly_rent_aud: number
            }>`
            SELECT id, last_scrape_date, weekly_rent_aud
            FROM rent_price_table
            WHERE home_table_id=${home_table.id}::integer
            ORDER BY last_scrape_date DESC
            LIMIT 1;`.execute(this.DB)
            const scrapeDateData = getLastRentScrapeData.rows[0]

            const rpt = args.rentData.rent_price_table
            const currentTimestamp = new Date()
            const insertRentPriceTable = sql`
            INSERT INTO rent_price_table (
                aud_per_bed,
                aud_per_land_m2,
                first_scrape_date,
                last_scrape_date,
                weekly_rent_aud,
                home_table_id
            )
            VALUES (
                ${rpt.aud_per_bed}::real,
                ${rpt.aud_per_land_m2}::real,
                ${currentTimestamp},
                ${currentTimestamp},
                ${rpt.weekly_rent_aud}::integer,
                ${home_table.id}
            );`

            // Case 1: price data never scraped before
            if (!scrapeDateData) {
                await insertRentPriceTable.execute(this.DB)
                return 1
            }

            // Case 2: on same day scraping get highest price
            if (datesAreOnSameDay(scrapeDateData.last_scrape_date, currentTimestamp)) {
                // const updateSameDayRentPriceTable =
                await sql`
                UPDATE rent_price_table
                SET
                    aud_per_bed = GREATEST(${rpt.aud_per_bed}::real, aud_per_bed),
                    aud_per_land_m2 = GREATEST(${rpt.aud_per_land_m2}::real, aud_per_land_m2),
                    weekly_rent_aud = GREATEST(${rpt.weekly_rent_aud}::integer, weekly_rent_aud)
                WHERE id = ${scrapeDateData.id}
                ;`.execute(this.DB)
                return 2
            }

            // Case 3: price is same as previous scrape
            if (scrapeDateData.weekly_rent_aud === rpt.weekly_rent_aud) {
                // const updateSamePriceRentPriceTable =
                await sql`
                UPDATE rent_price_table
                SET last_scrape_date = ${currentTimestamp}::date
                WHERE id = ${scrapeDateData.id}
                ;`.execute(this.DB)
                return 3
            }

            // Case 4: different price, different scrape date, existing data
            await insertRentPriceTable.execute(this.DB)
            return 4
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateRentListing, args, e)
            return 0
        }
    }

    async tryUpdateSaleListing(args: {
        saleData: {
            home_feature_table: RemoveTableIds<SchemaWrite.HomeFeatureTable>
            home_table: RemoveTableIds<SchemaWrite.HomeTable>
            sale_price_table: Omit<
                RemoveTableIds<SchemaWrite.SalePriceTable>,
                `${string}_scrape_date`
            >
        }
        localityId: number
    }) {
        try {
            const home_table = await this.updateListing({
                listingData: args.saleData,
                localityId: args.localityId,
            })

            const getLastSaleScrapeData = await sql<{
                id: number
                last_scrape_date: Date
                higher_price_aud: number
            }>`
            SELECT id, last_scrape_date, higher_price_aud
            FROM sale_price_table
            WHERE home_table_id=${home_table.id}::integer
            ORDER BY last_scrape_date DESC
            LIMIT 1;`.execute(this.DB)
            const scrapeDateData = getLastSaleScrapeData.rows[0]

            const rpt = args.saleData.sale_price_table
            const currentTimestamp = new Date()
            const insertSalePriceTable = sql`
            INSERT INTO sale_price_table (
                aud_per_bed,
                aud_per_land_m2,
                first_scrape_date,
                last_scrape_date,
                higher_price_aud,
                home_table_id
            )
            VALUES (
                ${rpt.aud_per_bed}::real,
                ${rpt.aud_per_land_m2}::real,
                ${currentTimestamp},
                ${currentTimestamp},
                ${rpt.higher_price_aud}::integer,
                ${home_table.id}
            );`

            // Case 1: price data never scraped before
            if (!scrapeDateData) {
                await insertSalePriceTable.execute(this.DB)
                return 1
            }

            // Case 2: on same day scraping get highest price
            if (datesAreOnSameDay(scrapeDateData.last_scrape_date, currentTimestamp)) {
                // const updateSameDaySalePriceTable =
                await sql`
                UPDATE sale_price_table
                SET
                    aud_per_bed = GREATEST(${rpt.aud_per_bed}::real, aud_per_bed),
                    aud_per_land_m2 = GREATEST(${rpt.aud_per_land_m2}::real, aud_per_land_m2),
                    higher_price_aud = GREATEST(${rpt.higher_price_aud}::integer, higher_price_aud)
                WHERE id = ${scrapeDateData.id}
                ;`.execute(this.DB)
                return 2
            }

            // Case 3: price is same as previous scrape
            if (scrapeDateData.higher_price_aud === rpt.higher_price_aud) {
                // const updateSamePriceSalePriceTable =
                await sql`
                UPDATE sale_price_table
                SET last_scrape_date = ${currentTimestamp}::date
                WHERE id = ${scrapeDateData.id}
                ;`.execute(this.DB)
                return 3
            }

            // Case 4: different price, different scrape date, existing data
            await insertSalePriceTable.execute(this.DB)
            return 4
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateSaleListing, args, e)
            return 0
        }
    }
}

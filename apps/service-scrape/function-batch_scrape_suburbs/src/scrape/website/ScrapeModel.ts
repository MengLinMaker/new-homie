import type { Insertable, Updateable } from 'kysely'
import { IDatabased } from '../../base/IDatabased'
import type { Schema } from '@service-scrape/lib-db_service_scrape'

export class ScrapeModel extends IDatabased {
    async tryUpdateSuburb(args: {
        suburbData: {
            localities_table: Insertable<Schema.LocalitiesTable>
        }
    }) {
        const { suburbData } = args
        try {
            return await this.DB.insertInto('localities_table')
                .values(suburbData.localities_table)
                .onConflict((oc) =>
                    oc
                        .columns(['suburb_name', 'state_abbreviation', 'postcode'])
                        .doUpdateSet(suburbData.localities_table),
                )
                .returning('id')
                .executeTakeFirstOrThrow()
        } catch (e) {
            this.logException('fatal', e, args)
            return null
        }
    }

    private async updateListing(args: {
        listingData: {
            common_features_table: Insertable<Schema.CommonFeaturesTable>
            home_table: Updateable<Schema.HomeTable>
        }
        localityId: number
    }) {
        const { listingData, localityId } = args
        const common_features_table = await this.DB.insertInto('common_features_table')
            .values(listingData.common_features_table)
            .onConflict((oc) =>
                oc
                    .columns([
                        'bed_quantity',
                        'bath_quantity',
                        'car_quantity',
                        'home_type',
                        'is_retirement',
                    ])
                    .doUpdateSet(listingData.common_features_table),
            )
            .returning('id')
            .executeTakeFirstOrThrow()

        const home_tableValues = {
            ...listingData.home_table,
            common_features_table_id: common_features_table.id,
            localities_table_id: localityId,
        } as Insertable<Schema.HomeTable>
        const home_table = await this.DB.insertInto('home_table')
            .values(home_tableValues)
            .onConflict((oc) =>
                oc.columns(['localities_table_id', 'street_address']).doUpdateSet(home_tableValues),
            )
            .returning('id')
            .executeTakeFirstOrThrow()

        return home_table
    }

    async tryUpdateRentListing(args: {
        rentData: {
            common_features_table: Insertable<Schema.CommonFeaturesTable>
            home_table: Updateable<Schema.HomeTable>
            rent_price_table: Updateable<Schema.RentPriceTable>
        }
        localityId: number
    }) {
        const { rentData, localityId } = args
        try {
            const home_table = await this.updateListing({
                listingData: rentData,
                localityId,
            })

            const scrapeDateData = await this.DB.selectFrom('rent_price_table')
                .select(['id', 'weekly_rent_aud'])
                .where('home_table_id', '=', home_table.id)
                .orderBy('last_scrape_date', 'desc')
                .limit(1)
                .executeTakeFirst()
            const currentTimestamp = new Date().toISOString()

            if (
                scrapeDateData &&
                rentData.rent_price_table.weekly_rent_aud === scrapeDateData.weekly_rent_aud
            ) {
                await this.DB.updateTable('rent_price_table')
                    .set({ last_scrape_date: currentTimestamp })
                    .where('id', '=', scrapeDateData.id)
                    .execute()
            } else {
                await this.DB.insertInto('rent_price_table')
                    .values({
                        ...rentData.rent_price_table,
                        home_table_id: home_table.id,
                        last_scrape_date: currentTimestamp,
                    } as Insertable<Schema.RentPriceTable>)
                    .execute()
            }
            return true
        } catch (e) {
            this.logException('fatal', e, args)
            return false
        }
    }

    async tryUpdateSaleListing(args: {
        saleData: {
            common_features_table: Insertable<Schema.CommonFeaturesTable>
            home_table: Updateable<Schema.HomeTable>
            sale_price_table: Updateable<Schema.SalePriceTable>
        }
        localityId: number
    }) {
        const { saleData, localityId } = args
        try {
            const home_table = await this.updateListing({
                listingData: saleData,
                localityId,
            })

            const scrapeDateData = await this.DB.selectFrom('sale_price_table')
                .select(['id', 'higher_price_aud'])
                .where('home_table_id', '=', home_table.id)
                .orderBy('last_scrape_date', 'desc')
                .limit(1)
                .executeTakeFirst()
            const currentTimestamp = new Date().toISOString()

            if (
                scrapeDateData &&
                saleData.sale_price_table.higher_price_aud === scrapeDateData.higher_price_aud
            ) {
                await this.DB.updateTable('sale_price_table')
                    .set({ last_scrape_date: currentTimestamp })
                    .where('id', '=', scrapeDateData.id)
                    .execute()
            } else {
                await this.DB.insertInto('sale_price_table')
                    .values({
                        ...saleData.sale_price_table,
                        home_table_id: home_table.id,
                        last_scrape_date: currentTimestamp,
                    } as Insertable<Schema.SalePriceTable>)
                    .execute()
            }
            return true
        } catch (e) {
            this.logException('fatal', e, args)
            return false
        }
    }
}

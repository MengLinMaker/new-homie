import type { Updateable } from 'kysely'
import { IDatabased } from '../../global/IDatabased'
import type { Schema } from '@service-scrape/lib-db_service_scrape'

export class ScrapeModel extends IDatabased {
    private async conflictInsertReturnId<T extends keyof Schema.DB>(
        tableName: T,
        conflictColumns: Array<keyof Updateable<Schema.DB[T]>>,
        values: Updateable<Schema.DB[T]>,
    ) {
        return await this.DB.insertInto(tableName)
            .values(values as never)
            .onConflict((oc) => oc.columns(conflictColumns as never).doUpdateSet(values as never))
            .returning('id')
            .executeTakeFirstOrThrow()
    }

    async tryUpdateSuburb(args: {
        suburbData: {
            locality_table: Updateable<Schema.LocalityTable>
        }
    }) {
        const { suburbData } = args
        try {
            return await this.conflictInsertReturnId(
                'locality_table',
                ['suburb_name', 'state_abbreviation', 'postcode'],
                suburbData.locality_table,
            )
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateSuburb, args, e)
            return null
        }
    }

    async tryUpdateSchool(args: {
        schoolData: {
            school_table: Updateable<Schema.SchoolTable>
            school_feature_table: Updateable<Schema.SchoolFeatureTable>
        }
        localityId: number
    }) {
        const { schoolData, localityId } = args
        try {
            const school_feature_table = await this.conflictInsertReturnId(
                'school_feature_table',
                objectKeys(schoolData.school_feature_table),
                schoolData.school_feature_table,
            )
            schoolData.school_table.school_feature_table_id = school_feature_table.id
            schoolData.school_table.locality_table_id = localityId
            await this.conflictInsertReturnId('school_table', ['acara_id'], schoolData.school_table)
            return true
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateSchool, args, e)
            return false
        }
    }

    private async updateListing(args: {
        listingData: {
            home_feature_table: Updateable<Schema.HomeFeatureTable>
            home_table: Updateable<Schema.HomeTable>
        }
        localityId: number
    }) {
        const { listingData, localityId } = args
        const home_feature_table = await this.conflictInsertReturnId(
            'home_feature_table',
            objectKeys(listingData.home_feature_table),
            listingData.home_feature_table,
        )
        listingData.home_table.home_feature_table_id = home_feature_table.id
        listingData.home_table.locality_table_id = localityId
        return await this.conflictInsertReturnId(
            'home_table',
            ['locality_table_id', 'street_address'],
            listingData.home_table,
        )
    }

    async tryUpdateRentListing(args: {
        rentData: {
            home_feature_table: Updateable<Schema.HomeFeatureTable>
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
                return true
            }

            rentData.rent_price_table.home_table_id = home_table.id
            rentData.rent_price_table.last_scrape_date = currentTimestamp
            await this.DB.insertInto('rent_price_table')
                .values(rentData.rent_price_table as never)
                .execute()
            return true
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateRentListing, args, e)
            return false
        }
    }

    async tryUpdateSaleListing(args: {
        saleData: {
            home_feature_table: Updateable<Schema.HomeFeatureTable>
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
                return true
            }

            saleData.sale_price_table.home_table_id = home_table.id
            saleData.sale_price_table.last_scrape_date = currentTimestamp
            await this.DB.insertInto('sale_price_table')
                .values(saleData.sale_price_table as never)
                .execute()
            return true
        } catch (e) {
            this.logExceptionArgs('error', this.tryUpdateSaleListing, args, e)
            return false
        }
    }
}

const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

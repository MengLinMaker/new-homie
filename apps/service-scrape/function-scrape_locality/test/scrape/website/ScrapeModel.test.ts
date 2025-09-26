import { afterAll, describe, expect, it, vi } from 'vitest'
import { dbCountRow, LOGGER, suiteNameFromFileName } from '../../util'
import { ScrapeModel } from '../../../src/scrape/website/ScrapeModel'
import { setupTestPostgisDb } from '@service-scrape/lib-db_service_scrape/dev'
import type { Insertable, Updateable } from 'kysely'
import {
    createPostgisPointString,
    createPostgisPolygonString,
    type SchemaWrite,
} from '@service-scrape/lib-db_service_scrape'
import { afterEach, beforeEach } from 'node:test'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, async () => {
    const { container, db } = await setupTestPostgisDb()
    beforeEach(() => {
        vi.useFakeTimers()
    })
    afterEach(() => {
        vi.useRealTimers()
    })
    afterAll(async () => {
        await db.destroy()
        await container.stop()
    })

    const scrapeModel = new ScrapeModel(LOGGER, db)

    describe.sequential('tryUpdateSuburb', () => {
        const boundary_coordinates = createPostgisPolygonString([
            [0, 0],
            [1, 0],
            [0, 1],
            [0, 0],
        ])
        if (!boundary_coordinates) throw Error('boundary_coordinates is invalid')
        const locality_table = {
            suburb_name: 'Melbourne',
            state_abbreviation: 'VIC',
            postcode: '3000',
            boundary_coordinates,
        } satisfies Insertable<SchemaWrite.LocalityTable>
        const suburbData = { locality_table }

        it.sequential('should not insert same data', async () => {
            await scrapeModel.tryUpdateSuburb({ suburbData })
            const oldLength = await dbCountRow(db, 'locality_table')

            await scrapeModel.tryUpdateSuburb({ suburbData })
            const newLength = await dbCountRow(db, 'locality_table')

            expect(oldLength).toBe(newLength)
        })

        it.sequential('should insert new data', async () => {
            const length_1 = await dbCountRow(db, 'locality_table')

            suburbData.locality_table.postcode = '3001'
            await scrapeModel.tryUpdateSuburb({ suburbData })
            const length_2 = await dbCountRow(db, 'locality_table')
            expect(length_1 + 1).toBe(length_2)

            suburbData.locality_table.suburb_name = 'Melbourne North'
            await scrapeModel.tryUpdateSuburb({ suburbData })
            const length_3 = await dbCountRow(db, 'locality_table')
            expect(length_2 + 1).toBe(length_3)
        })
    })

    describe.sequential('tryUpdateSchool', () => {
        const schoolData = {
            school_table: {
                name: 'A B Paterson College',
                url: 'https://www.abpat.qld.edu.au/',
                acara_id: 48096,
                gps: 'POINT(153.36 -27.9277)',
            },
            school_feature_table: {
                primary: true,
                secondary: true,
                government_sector: false,
                independent: true,
                special_needs: false,
            },
        }
        const localityId = 1
        const dbCountRows = async () => {
            return {
                school_table: await dbCountRow(db, 'school_table'),
                school_feature_table: await dbCountRow(db, 'school_feature_table'),
            }
        }

        it.sequential('should not insert same data', async () => {
            const beginLength = await dbCountRows()
            await scrapeModel.tryUpdateSchool({ schoolData, localityId })
            const oldLength = await dbCountRows()
            beginLength.school_table++
            beginLength.school_feature_table++
            expect(beginLength).toStrictEqual(oldLength)

            await scrapeModel.tryUpdateSchool({ schoolData, localityId })
            const newLength = await dbCountRows()
            expect(oldLength).toStrictEqual(newLength)
        })

        it.sequential('should insert new data', async () => {
            const lengths_1 = await dbCountRows()

            schoolData.school_table.acara_id = 99999
            await scrapeModel.tryUpdateSchool({ schoolData, localityId })
            const lengths_2 = await dbCountRows()
            lengths_1.school_table++
            expect(lengths_1).toStrictEqual(lengths_2)

            schoolData.school_table.name = 'My Hero Academia High School'
            await scrapeModel.tryUpdateSchool({ schoolData, localityId })
            const lengths_3 = await dbCountRows()
            expect(lengths_2).toStrictEqual(lengths_3)
        })
    })

    describe.sequential('tryUpdateRentListing', () => {
        vi.setSystemTime(new Date(0).toISOString())
        const rentData: {
            home_feature_table: Updateable<SchemaWrite.HomeFeatureTable>
            home_table: Updateable<SchemaWrite.HomeTable>
            rent_price_table: Updateable<SchemaWrite.RentPriceTable>
        } = {
            home_feature_table: {
                bath_quantity: 1,
                bed_quantity: 1,
                car_quantity: 1,
                home_type: 'ApartmentUnitFlat',
                is_retirement: false,
            },
            home_table: {
                street_address: '1 Smith street',
                gps: createPostgisPointString(0, 0),
                land_m2: 1,
                inspection_time: null,
                auction_time: new Date(0).toISOString(),
            },
            rent_price_table: {
                first_scrape_date: new Date(0).toISOString(),
                last_scrape_date: new Date(0).toISOString(),
                aud_per_bed: 1,
                aud_per_land_m2: 1,
                weekly_rent_aud: 1,
            },
        }
        const localityId = 1
        const dbCountRows = async () => {
            return {
                home_feature_table: await dbCountRow(db, 'home_feature_table'),
                home_table: await dbCountRow(db, 'home_table'),
                rent_price_table: await dbCountRow(db, 'rent_price_table'),
            }
        }

        it.sequential('should not insert same data', async () => {
            await scrapeModel.tryUpdateRentListing({ rentData, localityId })
            const lengths_1 = await dbCountRows()

            await scrapeModel.tryUpdateRentListing({ rentData, localityId })
            const lengths_2 = await dbCountRows()
            expect(lengths_1).toStrictEqual(lengths_2)
        })

        it.sequential(
            'should update on same "weekly_rent_aud" and new "last_scrape_date"',
            async () => {
                vi.setSystemTime(new Date(10 ** 11))
                rentData.rent_price_table.last_scrape_date = new Date().toISOString()
                const lengths_1 = await dbCountRows()

                await scrapeModel.tryUpdateRentListing({ rentData, localityId })
                const lengths_2 = await dbCountRows()
                expect(lengths_1).toStrictEqual(lengths_2)
            },
        )

        it.sequential(
            'should create "rent_price_table" row with new "weekly_rent_aud"',
            async () => {
                vi.setSystemTime(new Date(10 ** 12))
                rentData.rent_price_table.last_scrape_date = new Date().toISOString()
                rentData.rent_price_table.first_scrape_date = new Date().toISOString()
                rentData.rent_price_table.weekly_rent_aud = 2
                const lengths_1 = await dbCountRows()

                await scrapeModel.tryUpdateRentListing({ rentData, localityId })
                const lengths_2 = await dbCountRows()
                lengths_1.rent_price_table++
                expect(lengths_1).toStrictEqual(lengths_2)
            },
        )

        it.sequential('should update "home_table" on new "home_feature_table"', async () => {
            rentData.home_feature_table.is_retirement = true
            rentData.home_table.land_m2 = 2
            const lengths_1 = await dbCountRows()

            await scrapeModel.tryUpdateRentListing({ rentData, localityId })
            const lengths_2 = await dbCountRows()
            lengths_1.home_feature_table++
            expect(lengths_1).toStrictEqual(lengths_2)
        })
    })

    describe.sequential('tryUpdateSaleListing', () => {
        vi.setSystemTime(new Date(0).toISOString())
        const saleData: {
            home_feature_table: Updateable<SchemaWrite.HomeFeatureTable>
            home_table: Updateable<SchemaWrite.HomeTable>
            sale_price_table: Updateable<SchemaWrite.SalePriceTable>
        } = {
            home_feature_table: {
                bath_quantity: 1,
                bed_quantity: 1,
                car_quantity: 1,
                home_type: 'ApartmentUnitFlat',
                is_retirement: false,
            },
            home_table: {
                street_address: '1 Smith street',
                gps: createPostgisPointString(0, 0),
                land_m2: 1,
                inspection_time: null,
                auction_time: new Date(0).toISOString(),
            },
            sale_price_table: {
                first_scrape_date: new Date(0).toISOString(),
                last_scrape_date: new Date(0).toISOString(),
                aud_per_bed: 1,
                aud_per_land_m2: 1,
                higher_price_aud: 1,
            },
        }
        const localityId = 1
        const dbCountRows = async () => {
            return {
                home_feature_table: await dbCountRow(db, 'home_feature_table'),
                home_table: await dbCountRow(db, 'home_table'),
                sale_price_table: await dbCountRow(db, 'sale_price_table'),
            }
        }

        it.sequential('should not insert same data', async () => {
            await scrapeModel.tryUpdateSaleListing({ saleData, localityId })
            const lengths_1 = await dbCountRows()

            await scrapeModel.tryUpdateSaleListing({ saleData, localityId })
            const lengths_2 = await dbCountRows()
            expect(lengths_1).toStrictEqual(lengths_2)
        })

        it.sequential(
            'should update on same "higher_price_aud" and new "last_scrape_date"',
            async () => {
                vi.setSystemTime(new Date(10 ** 11))
                saleData.sale_price_table.last_scrape_date = new Date().toISOString()
                const lengths_1 = await dbCountRows()

                await scrapeModel.tryUpdateSaleListing({ saleData, localityId })
                const lengths_2 = await dbCountRows()
                expect(lengths_1).toStrictEqual(lengths_2)
            },
        )

        it.sequential(
            'should create "sale_price_table" row with new "higher_price_aud"',
            async () => {
                vi.setSystemTime(new Date(10 ** 12))
                saleData.sale_price_table.last_scrape_date = new Date().toISOString()
                saleData.sale_price_table.first_scrape_date = new Date().toISOString()
                saleData.sale_price_table.higher_price_aud = 2
                const lengths_1 = await dbCountRows()

                await scrapeModel.tryUpdateSaleListing({ saleData, localityId })
                const lengths_2 = await dbCountRows()
                lengths_1.sale_price_table++
                expect(lengths_1).toStrictEqual(lengths_2)
            },
        )

        it.sequential('should update "home_table" on new "home_feature_table"', async () => {
            saleData.home_feature_table.bath_quantity = 2
            saleData.home_table.land_m2 = 2
            const lengths_1 = await dbCountRows()

            await scrapeModel.tryUpdateSaleListing({ saleData, localityId })
            const lengths_2 = await dbCountRows()
            lengths_1.home_feature_table++
            expect(lengths_1).toStrictEqual(lengths_2)
        })
    })
})

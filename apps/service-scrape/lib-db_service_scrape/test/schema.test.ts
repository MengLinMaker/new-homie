/** biome-ignore-all lint/style/noNonNullAssertion: <test is controlled> */
import { describe, expect, it, afterAll } from 'vitest'
import { faker } from '@faker-js/faker'
import type { Insertable } from 'kysely'

import { createPostgisPointString, createPostgisPolygonString } from '../src/util'
import type { DB } from '../src/schema-write'
import { setupTestPostgisDb } from '../src/dev'

describe('schema.ts', async () => {
    const { container, db } = await setupTestPostgisDb()
    afterAll(async () => {
        await db.destroy()
        await container.stop()
    })

    const insertIds = new Map<keyof DB, number>()

    it.sequential('should insert into all tables', async () => {
        const insertIntoTable = async <K extends keyof DB>(
            tableName: K,
            values: Insertable<DB[K]>,
        ) => {
            const id = (
                await db
                    .insertInto(tableName)
                    .values(values)
                    .returning('id')
                    .executeTakeFirstOrThrow()
            ).id
            expect(id).toBeDefined()
            insertIds.set(tableName, id)
        }
        await insertIntoTable('locality_table', {
            suburb_name: faker.location.city(),
            postcode: faker.location.zipCode('####'),
            state_abbreviation: 'VIC',
            boundary_coordinates: createPostgisPolygonString([
                [1, 2],
                [3, 4],
                [5, 6],
                [1, 2],
            ])!,
        })
        await insertIntoTable('home_feature_table', {
            bed_quantity: faker.number.int({ min: 1, max: 5 }),
            bath_quantity: faker.number.int({ min: 1, max: 5 }),
            car_quantity: faker.number.int({ min: 1, max: 5 }),
            home_type: 'ApartmentUnitFlat',
            is_retirement: Math.random() < 0.5,
        })
        await insertIntoTable('home_table', {
            locality_table_id: insertIds.get('locality_table')!,
            home_feature_table_id: insertIds.get('home_feature_table')!,
            street_address: faker.location.streetAddress(),
            gps: null,
            land_m2: faker.number.int({ min: 0, max: 10000 }),
            inspection_time: faker.date.anytime(),
            auction_time: null,
        })
        await insertIntoTable('sale_price_table', {
            home_table_id: insertIds.get('home_table')!,
            first_scrape_date: faker.date.past(),
            last_scrape_date: faker.date.recent(),
            higher_price_aud: faker.number.int({ min: 200000, max: 2000000 }),
            aud_per_bed: 0,
            aud_per_land_m2: 0,
        })
        await insertIntoTable('rent_price_table', {
            home_table_id: insertIds.get('home_table')!,
            first_scrape_date: faker.date.past(),
            last_scrape_date: faker.date.recent(),
            weekly_rent_aud: faker.number.int({ min: 100, max: 2000 }),
            aud_per_bed: 0,
            aud_per_land_m2: 0,
        })
        await insertIntoTable('school_feature_table', {
            primary: faker.datatype.boolean(),
            secondary: faker.datatype.boolean(),
            government_sector: faker.datatype.boolean(),
            independent: faker.datatype.boolean(),
            special_needs: faker.datatype.boolean(),
        })
        await insertIntoTable('school_table', {
            school_feature_table_id: insertIds.get('school_feature_table')!,
            locality_table_id: insertIds.get('locality_table')!,
            name: faker.company.name(),
            url: faker.internet.url(),
            acara_id: faker.number.int({ min: 100000, max: 999999 }),
            gps: createPostgisPointString(faker.location.longitude(), faker.location.latitude()),
        })
    })

    it.sequential('should select from all tables', async () => {
        const reverseTableNameIds = Array.from(insertIds.entries()).reverse()
        for (const [tableName, id] of reverseTableNameIds) {
            const data = await db
                .selectFrom(tableName)
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirstOrThrow()
            expect(data.id).toBe(id)
        }
    })

    it.sequential('should delete from all tables', async () => {
        for (const [tableName, id] of Array.from(insertIds.entries()).reverse()) {
            const data = await db
                .deleteFrom(tableName)
                .where('id', '=', id)
                .executeTakeFirstOrThrow()
            expect(data.numDeletedRows).toBe(1n)

            const noData = await db
                .selectFrom(tableName)
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirst()
            expect(noData).toBeUndefined()
        }
    })
}, 300000)

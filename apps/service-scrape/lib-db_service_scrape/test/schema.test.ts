/** biome-ignore-all lint/style/noNonNullAssertion: <test is controlled> */
import { createPostgisPointString, createPostgisPolygonString } from '../src/util'
import { describe, expect, test } from 'vitest'
import { faker } from '@faker-js/faker'
import { HomeTypeEnum, StateAbbreviationEnum, type DB } from '../src/schema'
import type { Insertable } from 'kysely'

describe('schema validation', async () => {
    const insertIds = new Map<keyof DB, number>()

    test.sequential('insert into all tables', async () => {
        const insertIntoTable = async <K extends keyof DB>(
            tableName: K,
            values: Insertable<DB[K]>,
        ) => {
            const id = (
                await global.db
                    .insertInto(tableName)
                    .values(values)
                    .returning('id')
                    .executeTakeFirstOrThrow()
            ).id
            expect(id).toBeDefined()
            insertIds.set(tableName, id)
        }
        await insertIntoTable('localities_table', {
            suburb_name: faker.location.city(),
            postcode: faker.location.zipCode('####'),
            state_abbreviation: StateAbbreviationEnum.VIC,
            boundary_coordinates: createPostgisPolygonString([
                [1, 2],
                [3, 4],
                [5, 6],
                [1, 2],
            ])!,
        })
        await insertIntoTable('common_features_table', {
            bed_quantity: faker.number.int({ min: 1, max: 5 }),
            bath_quantity: faker.number.int({ min: 1, max: 5 }),
            car_quantity: faker.number.int({ min: 1, max: 5 }),
            home_type: HomeTypeEnum.APARTMENT_UNIT_FLAT,
            is_retirement: Math.random() < 0.5,
        })
        await insertIntoTable('home_table', {
            localities_table_id: insertIds.get('localities_table')!,
            common_features_table_id: insertIds.get('common_features_table')!,
            street_address: faker.location.streetAddress(),
            gps: createPostgisPointString(faker.location.longitude(), faker.location.latitude()),
            land_m2: faker.number.int({ min: 0, max: 10000 }),
            inspection_time: faker.date.anytime(),
            auction_time: null,
        })
        await insertIntoTable('sale_price_table', {
            home_table_id: insertIds.get('home_table')!,
            first_scrape_date: faker.date.past(),
            last_scrape_date: faker.date.recent(),
            higher_price_aud: faker.number.int({ min: 200000, max: 2000000 }),
        })
        await insertIntoTable('rent_price_table', {
            home_table_id: insertIds.get('home_table')!,
            first_scrape_date: faker.date.past(),
            last_scrape_date: faker.date.recent(),
            weekly_rent_aud: faker.number.int({ min: 100, max: 2000 }),
        })
    })

    test.sequential('select from all tables', async () => {
        const reverseTableNameIds = Array.from(insertIds.entries()).reverse()
        for (const [tableName, id] of reverseTableNameIds) {
            const data = await global.db
                .selectFrom(tableName)
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirstOrThrow()
            expect(data.id).toBe(id)
        }
    })

    test.sequential('delete from all tables', async () => {
        for (const [tableName, id] of Array.from(insertIds.entries()).reverse()) {
            const data = await global.db
                .deleteFrom(tableName)
                .where('id', '=', id)
                .executeTakeFirstOrThrow()
            expect(data.numDeletedRows).toBe(1n)

            const noData = await global.db
                .selectFrom(tableName)
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirst()
            expect(noData).toBeUndefined()
        }
    })
})

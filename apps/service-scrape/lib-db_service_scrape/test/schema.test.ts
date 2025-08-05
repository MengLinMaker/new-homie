import { describe, test } from 'vitest'
import { db } from '../src/kysely'
import { type dbSchema, home_type_enum, type Database } from '../src/schema'
import { faker } from '@faker-js/faker'
import { toPgDatetime, toPostgisPoint } from '../src/util'
import type { z } from 'zod'

describe('schema test', async () => {
    const insertIds = new Map<keyof Database, any>()
    const insertValues = new Map<keyof Database, any>()
    const insertIntoTable = async <K extends keyof Database>(
        tableName: K,
        values: z.infer<(typeof dbSchema)[K]>,
    ) => {
        test.sequential(`insert into '${tableName}'`, async () => {
            insertValues.set(tableName, values)
            const id = (
                await db
                    .insertInto(tableName)
                    .values(values as any)
                    .returning('id')
                    .executeTakeFirstOrThrow()
            ).id
            insertIds.set(tableName, id)
        })
    }

    await insertIntoTable('localities_table', {
        suburb_name: faker.location.city(),
        postcode: faker.location.zipCode('####'),
        state_abbreviation: 'VIC',
    })
    await insertIntoTable('common_features_table', {
        bed_quantity: faker.number.int({ min: 0, max: 5 }),
        bath_quantity: faker.number.int({ min: 0, max: 5 }),
        car_quantity: faker.number.int({ min: 0, max: 5 }),
        home_type: home_type_enum.enumValues[Math.floor(Math.random() * home_type_enum.length)]!,
        is_retirement: Math.random() < 0.5,
    })
    await insertIntoTable('home_table', {
        localities_table_id: insertIds.get('localities_table'),
        common_features_table_id: insertIds.get('common_features_table'),
        street_address: faker.location.streetAddress(),
        gps: toPostgisPoint([faker.number.float(), faker.number.float()]) as any,
        land_m2: faker.number.int({ min: 0, max: 10000 }),
        inspection_time: toPgDatetime(faker.date.soon().toISOString()),
        auction_time: toPgDatetime(null),
    })
    await insertIntoTable('sale_price_table', {
        home_table_id: insertIds.get('home_table'),
        first_scrape_date: toPgDatetime(faker.date.past().toISOString()),
        last_scrape_date: toPgDatetime(faker.date.recent().toISOString()),
        higher_price_aud: faker.number.int({ min: 200000, max: 2000000 }),
    })
    await insertIntoTable('rent_price_table', {
        home_table_id: insertIds.get('home_table'),
        first_scrape_date: toPgDatetime(faker.date.past().toISOString()),
        last_scrape_date: toPgDatetime(faker.date.recent().toISOString()),
        weekly_rent_aud: faker.number.int({ min: 100, max: 2000 }),
    })

    test.sequential('select from all tables', async () => {
        for (const [tableName, id] of Array.from(insertIds.entries()).reverse()) {
            await db.selectFrom(tableName).where('id', '=', id).executeTakeFirstOrThrow()
        }
    })

    test.sequential('delete from all tables', async () => {
        for (const [tableName, id] of Array.from(insertIds.entries()).reverse()) {
            await db.deleteFrom(tableName).where('id', '=', id).executeTakeFirstOrThrow()
        }
    })
})

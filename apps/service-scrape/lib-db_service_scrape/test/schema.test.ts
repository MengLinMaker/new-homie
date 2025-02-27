import { test } from 'vitest'
import { db } from './kysely'
import { describe } from 'node:test'
import { home_type_enum, type Database } from '../src/schema'
import { faker } from '@faker-js/faker'
import { toPgDatetime, toPgPoint } from '../src/util'

describe('schema test', () => {
  const insertIds = new Map<keyof Database, any>()

  test.sequential('insert into all tables', async () => {
    await db.transaction().execute(async (t) => {
      insertIds.set(
        'localities_table',
        (
          await t
            .insertInto('localities_table')
            .values({
              suburb_name: faker.location.city(),
              postcode: faker.location.zipCode('####'),
              state_abbreviation: 'VIC',
            })
            .returning('id')
            .executeTakeFirstOrThrow()
        ).id,
      )

      insertIds.set(
        'common_features_table',
        (
          await t
            .insertInto('common_features_table')
            .values({
              bed_quantity: faker.number.int({ min: 0, max: 5 }),
              bath_quantity: faker.number.int({ min: 0, max: 5 }),
              car_quantity: faker.number.int({ min: 0, max: 5 }),
              home_type:
                home_type_enum.enumValues[Math.floor(Math.random() * home_type_enum.length)]!,
              is_retirement: Math.random() < 0.5,
              is_rural: Math.random() < 0.5,
            })
            .returning('id')
            .executeTakeFirstOrThrow()
        ).id,
      )

      insertIds.set(
        'home_table',
        (
          await t
            .insertInto('home_table')
            .values({
              localities_table_id: insertIds.get('localities_table'),
              common_features_table_id: insertIds.get('common_features_table'),
              street_address: faker.location.streetAddress(),
              gps: toPgPoint([faker.number.float(), faker.number.float()]),
              land_m2: faker.number.int({ min: 0, max: 10000 }),
              inspection_time: toPgDatetime(faker.date.soon().toISOString()),
              auction_time: toPgDatetime(null),
            })
            .returning('id')
            .executeTakeFirstOrThrow()
        ).id,
      )

      insertIds.set(
        'sale_price_table',
        (
          await t
            .insertInto('sale_price_table')
            .values({
              home_table_id: insertIds.get('home_table'),
              first_scrape_date: toPgDatetime(faker.date.past().toISOString()),
              last_scrape_date: toPgDatetime(faker.date.recent().toISOString()),
              higher_price_aud: faker.number.int({ min: 200000, max: 2000000 }),
            })
            .returning('id')
            .executeTakeFirstOrThrow()
        ).id,
      )

      insertIds.set(
        'rental_price_table',
        (
          await t
            .insertInto('rental_price_table')
            .values({
              home_table_id: insertIds.get('home_table'),
              first_scrape_date: toPgDatetime(faker.date.past().toISOString()),
              last_scrape_date: toPgDatetime(faker.date.recent().toISOString()),
              weekly_rent_aud: faker.number.int({ min: 100, max: 2000 }),
            })
            .returning('id')
            .executeTakeFirstOrThrow()
        ).id,
      )

      return insertIds
    })
  })

  test.sequential('delete from all tables', async () => {
    for (const [tableName, id] of Array.from(insertIds.entries()).reverse()) {
      await db.deleteFrom(tableName).where('id', '=', id).executeTakeFirstOrThrow()
    }
  })
})

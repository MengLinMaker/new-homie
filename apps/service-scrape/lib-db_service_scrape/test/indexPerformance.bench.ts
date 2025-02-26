import { bench } from 'vitest'
import { db } from './kysely'
import { faker } from '@faker-js/faker'
import { home_type_enum } from '../src/schema'
import { sql } from 'kysely'
import { toPgPoint } from '../src'

const tables = {
  localities_table: {
    count: 0,
    target: 16000,
    insert: async () => {
      await db
        .insertInto('localities_table')
        .values({
          suburb_name: faker.location.city(),
          postcode: faker.location.zipCode('####'),
          state_abbreviation: 'VIC',
        })
        .execute()
      tables.localities_table.count++
    },
  },
  common_features_table: {
    count: 0,
    target: 16000,
    insert: async () => {
      try {
        await db
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
          .execute()
      } catch (e) {
        console.log(e)
      }
      tables.common_features_table.count++
    },
  },
  home_table: {
    count: 0,
    target: 30000,
    insert: async () => {
      await db
        .insertInto('home_table')
        .values({
          localities_table_id: faker.number.int({ min: 1, max: tables.localities_table.count }),
          common_features_table_id: faker.number.int({
            min: 1,
            max: tables.common_features_table.count,
          }),
          street_address: faker.location.streetAddress(),
          gps: toPgPoint([faker.number.float(), faker.number.float()]),
          land_m2: faker.number.int({ min: 0, max: 10000 }),
          inspection_time: faker.date.soon().toISOString().replaceAll('T', ' ').replaceAll('Z', ''),
          auction_time: null,
        })
        .execute()
      tables.home_table.count++
    },
  },
  sale_price_table: {
    count: 0,
    target: 30000,
    insert: async () => {
      await db
        .insertInto('sale_price_table')
        .values({
          home_table_id: faker.number.int({ min: 1, max: tables.home_table.count }),
          first_scrape_date: faker.date.past().toISOString().replaceAll(/[TZ]/g, ' '),
          last_scrape_date: faker.date.recent().toISOString().replaceAll(/[TZ]/g, ' '),
          lower_price_aud: faker.number.int({ min: 200000, max: 2000000 }),
          higher_price_aud: faker.number.int({ min: 200000, max: 2000000 }),
        })
        .execute()
      tables.sale_price_table.count++
    },
  },
}

const objectKeys = <T extends object>(obj: T) => Object.keys(obj) as (keyof T)[]

const startDbSeedTime = performance.now()
for (const table of objectKeys(tables)) {
  // while (tables[table].count < tables[table].target) await tables[table].insert()
  // console.info(`Created ${tables[table].count} rows for '${table}'`)

  bench(`${table} insert`, async () => await tables[table].insert())
}
const endDbSeedTime = performance.now()

console.info(`Database seeded in ${0.001 * Math.floor(endDbSeedTime - startDbSeedTime)}s`)

const databaseSize = await sql<{
  pg_size_pretty: number
}>`SELECT pg_size_pretty( pg_database_size('db') );`.execute(db)
console.info(`Database size: ${databaseSize.rows[0]?.pg_size_pretty} / 32 MB docker`)

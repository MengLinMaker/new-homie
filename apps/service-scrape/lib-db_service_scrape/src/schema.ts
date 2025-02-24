import { conventionalConstraintFactory } from './util'
import { sql } from 'drizzle-orm'
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  point,
  smallint,
  text,
  time,
} from 'drizzle-orm/pg-core'
import type { Kyselify } from 'drizzle-orm/kysely'
import { createSelectSchema } from 'drizzle-zod'

export const state_abbreviation_enum = pgEnum('state_abbreviation_enum', [
  'ACT',
  'NSW',
  'NT',
  'QLD',
  'SA',
  'TAS',
  'VIC',
  'WA',
])

export const localities_table = pgTable(
  'localities_table',
  {
    // Less than 20 thousand suburbs in Australia. Number not expected to grow.
    id: smallint().generatedByDefaultAsIdentity().primaryKey(),
    suburb_name: text().notNull(),
    postcode: text().notNull(),
    state_abbreviation: state_abbreviation_enum().notNull(),
    gps: point().notNull(),
  },
  (t) => {
    const c = conventionalConstraintFactory('localities_table')
    return [
      // c.textSearchIndex(t.suburb_name),
      // c.index('hash', t.postcode),
      // c.index('hash', t.state_abbreviation),
      // c.index('gist', t.gps),

      c.check(t.suburb_name, sql`LENGTH(${t.suburb_name}) < 64`),
      c.check(t.postcode, sql`LENGTH(${t.postcode}) = 4`),
    ]
  },
)

export const home_type_enum = pgEnum('home_type_enum', [
  'ApartmentUnitFlat',
  'House',
  'Townhouse',
  'BlockOfUnits',
])

export const common_features_table = pgTable(
  'common_features_table',
  {
    // Small number of common feature permutations that reduce database size
    // Estimate 10 * 5 * 20 * 4 * 2 * 2 = 16000 permutations at 224kb or 28 postgresql pages
    id: smallint().generatedByDefaultAsIdentity().primaryKey(),
    bed_quantity: smallint().notNull(), // 10 beds is beyond budget
    bath_quantity: smallint().notNull(), // 5 baths is beyond budget
    car_quantity: smallint().notNull(), // 20 cars is beyond budget
    home_type: home_type_enum().notNull(),
    is_retirement: boolean().notNull(),
    is_rural: boolean().notNull(),
  },
  (t) => {
    const c = conventionalConstraintFactory('common_features_table')
    return [
      // Indexes on this small table don't seem to improve query speed.
      // c.index('btree', t.bed_quantity),
      // c.index('btree', t.bath_quantity),
      // c.index('btree', t.car_quantity),
      // c.index('hash', t.is_retirement),
      // c.index('hash', t.is_rural),

      c.check(t.bed_quantity, sql`${t.bed_quantity} >= 0 AND ${t.bed_quantity} <= 10`),
      c.check(t.bath_quantity, sql`${t.bath_quantity} >= 0  AND ${t.bath_quantity} <= 5`),
      c.check(t.car_quantity, sql`${t.car_quantity} >= 0  AND ${t.car_quantity} <= 20`),
    ]
  },
)

export const home_table = pgTable(
  'home_table',
  {
    // Around 10 million homes in Australia.
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    localities_table_id: smallint().references(() => localities_table.id),
    common_features_table_id: smallint().references(() => common_features_table.id), // 500x smaller
    // Very unique data - not worth normalising
    street_address: text().notNull(),
    gps: point().notNull(),
    land_m2: smallint(),
    inspection_time: time(),
    auction_time: time(),
  },
  (t) => {
    const c = conventionalConstraintFactory('home_table')
    return [
      // c.textSearchIndex(t.street_address),
      // c.index('gist', t.gps),
      // c.index('btree', t.land_m2),
      // c.index('btree', t.inspection_time),
      // c.index('btree', t.auction_time),

      c.check(t.street_address, sql`LENGTH(${t.street_address}) < 64`),
    ]
  },
)

export const rental_price_table = pgTable(
  'rental_price_table',
  {
    // Rentals listed around 50k per week ~ 3 million data points per year
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    home_table_id: integer().references(() => home_table.id),
    first_scrape_date: date().notNull().defaultNow(),
    last_scrape_date: date().notNull().defaultNow(),
    weekly_rent_aud: smallint().notNull(),
  },
  (_t) => {
    conventionalConstraintFactory('rental_price_table')
    return [
      // c.index('btree', t.first_scrape_date),
      // c.index('btree', t.last_scrape_date),
      // c.index('btree', t.weekly_rent_aud),
    ]
  },
)

export const sale_price_table = pgTable(
  'sale_price_table',
  {
    // Sales listed around 20k per week ~ 1 million data points per year
    id: integer().generatedByDefaultAsIdentity().primaryKey(),
    home_table_id: integer().references(() => home_table.id),
    first_scrape_date: date().notNull().defaultNow(),
    last_scrape_date: date().notNull().defaultNow(),
    lower_price_aud: integer().notNull(),
    higher_price_aud: integer().notNull(),
  },
  (_t) => {
    conventionalConstraintFactory('sale_price_table')
    return [
      // c.index('btree', t.first_scrape_date),
      // c.index('btree', t.last_scrape_date),
      // c.index('btree', t.lower_price_aud),
      // c.index('btree', t.higher_price_aud),
    ]
  },
)

export const db_schema = {
  localities_table: createSelectSchema(localities_table),
  common_features_table: createSelectSchema(common_features_table),
  home_table: createSelectSchema(home_table),
  rental_price_table: createSelectSchema(rental_price_table),
  sale_price_table: createSelectSchema(sale_price_table),
}
export interface Database {
  localities_table: Kyselify<typeof localities_table>
  common_features_table: Kyselify<typeof common_features_table>
  home_table: Kyselify<typeof home_table>
  rental_price_table: Kyselify<typeof rental_price_table>
  sale_price_table: Kyselify<typeof sale_price_table>
}

import { localitySchema } from '@service-scrape/lib-australia_amenity'
import { os } from '@orpc/server'
import z from 'zod'
import { DB } from './global/setup.ts'
import { latestRentMv, latestSaleMv } from '@service-scrape/lib-db_service_scrape/schema'
import { sql } from 'kysely'

// const objectKeys = <T extends object>(input: T) => Object.keys(input) as (keyof T)[]

export const router = {
    findLatestSale: os
        .input(localitySchema.partial())
        .route({ method: 'GET', path: `/latestSale` })
        .output(z.array(latestSaleMv.required()))
        .handler(async ({ input }) => {
            const result = await sql<Required<z.infer<typeof latestSaleMv>>>`
                SELECT latest_sale_mv.* from latest_sale_mv
                LEFT JOIN locality_table ON locality_table_id = locality_table.id
                WHERE (${input.suburb_name === undefined} IS TRUE OR suburb_name = ${input.suburb_name!})
                AND (${input.state_abbreviation === undefined} IS TRUE OR state_abbreviation = ${input.state_abbreviation!})
                AND (${input.postcode === undefined} IS TRUE OR postcode = ${input.postcode!})
                ;`.execute(DB)
            return result.rows

            // let query = DB.selectFrom('latest_sale_mv')
            //     .leftJoin('locality_table', 'locality_table_id', 'locality_table.id')
            //     .selectAll('latest_sale_mv')
            // for (const key of objectKeys(input)) {
            //     if (input[key]) query = query.where(key, '=', input[key])
            // }
            // return await query.execute()
        }),

    findLatestRent: os
        .input(localitySchema.partial())
        .route({ method: 'GET', path: `/latestRent` })
        .output(z.array(latestRentMv.required()))
        .handler(async ({ input }) => {
            const result = await sql<Required<z.infer<typeof latestRentMv>>>`
                SELECT latest_rent_mv.* from latest_rent_mv
                LEFT JOIN locality_table ON locality_table_id = locality_table.id
                WHERE (${input.suburb_name === undefined} IS TRUE OR suburb_name = ${input.suburb_name!})
                AND (${input.state_abbreviation === undefined} IS TRUE OR state_abbreviation = ${input.state_abbreviation!})
                AND (${input.postcode === undefined} IS TRUE OR postcode = ${input.postcode!})
                ;`.execute(DB)
            return result.rows

            // let query = DB.selectFrom('latest_rent_mv')
            //     .leftJoin('locality_table', 'locality_table_id', 'locality_table.id')
            //     .selectAll('latest_rent_mv')
            // for (const key of objectKeys(input)) {
            //     if (input[key]) query = query.where(key, '=', input[key])
            // }
            // return await query.execute()
        }),
}

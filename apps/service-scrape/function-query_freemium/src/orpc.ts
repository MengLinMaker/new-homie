import { os } from '@orpc/server'
import z from 'zod'
import { DB } from './global/setup'
import {
    latestRentViewSchema,
    latestSaleViewSchema,
    stateAbbreviationEnumSchema,
} from '@service-scrape/lib-db_service_scrape/zod'

const locationInput = os.input(
    z.object({
        state_abbreviation: stateAbbreviationEnumSchema.optional(),
        postcode: z.string().length(4).optional(),
    }),
)

const objectKeys = <T extends Object>(input: T) => Object.keys(input) as (keyof T)[]

export const findLatestSale = locationInput
    .route({ method: 'GET', path: `/latestSale` })
    .output(z.array(latestSaleViewSchema))
    .handler(async ({ input }) => {
        let query = await DB.selectFrom('latest_sale_view').selectAll()
        for (const key of objectKeys(input)) {
            if (input[key]) query = query.where(key, '=', input[key])
        }
        return await query.execute()
    })

export const findLatestRent = locationInput
    .route({ method: 'GET', path: `/latestRent` })
    .output(z.array(latestRentViewSchema))
    .handler(async ({ input }) => {
        let query = await DB.selectFrom('latest_rent_view').selectAll()
        for (const key of objectKeys(input)) {
            if (input[key]) query = query.where(key, '=', input[key])
        }
        return await query.execute()
    })

export const router = {
    latestSale: {
        find: findLatestSale,
    },
    latestRent: {
        find: findLatestRent,
    },
}

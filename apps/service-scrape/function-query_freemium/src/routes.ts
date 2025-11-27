import { os } from '@orpc/server'
import z from 'zod'
import { DB } from './global/setup.ts'
import {
    latestRentViewSchema,
    latestSaleViewSchema,
    localityTableSchema,
} from '@service-scrape/lib-db_service_scrape/zod'

const objectKeys = <T extends object>(input: T) => Object.keys(input) as (keyof T)[]

const homeFilterInput = os.input(
    localityTableSchema.partial().omit({ id: true, boundary_coordinates: true }),
)

export const router = {
    findLatestSale: homeFilterInput
        .route({ method: 'GET', path: `/latestSale` })
        .output(z.array(latestSaleViewSchema))
        .handler(async ({ input }) => {
            let query = DB.selectFrom('latest_sale_view').selectAll()
            for (const key of objectKeys(input)) {
                if (input[key]) query = query.where(key, '=', input[key])
            }
            return await query.execute()
        }),

    findLatestRent: homeFilterInput
        .route({ method: 'GET', path: `/latestRent` })
        .output(z.array(latestRentViewSchema))
        .handler(async ({ input }) => {
            let query = DB.selectFrom('latest_rent_view').selectAll()
            for (const key of objectKeys(input)) {
                if (input[key]) query = query.where(key, '=', input[key])
            }
            return await query.execute()
        }),
}

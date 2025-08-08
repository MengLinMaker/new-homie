import { traceTryFunction } from '../instrumentation'
import { date, z } from 'zod'
import {
    enumToArray,
    Schema,
    createPostgisPointString,
} from '@service-scrape/lib-db_service_scrape'
import { scrapeUtil } from './scrapeUtil'
import type { Updateable } from 'kysely'

const _listingsSchema = z.object({
    listingModel: z.object({
        url: z.string(),
        price: z.string(),
        address: z.object({
            street: z.string(),
            lat: z.number(),
            lng: z.number(),
        }),
        features: z.object({
            beds: z.number().nullish(),
            baths: z.number().nullish(),
            parking: z.number().nullish(),
            propertyType: z.enum(enumToArray(Schema.HomeTypeEnum)),
            isRural: z.boolean(),
            landSize: z.number(),
            isRetirement: z.boolean(),
        }),
        inspection: z.object({
            openTime: z.string().nullish(),
            closeTime: z.string().nullish(),
        }),
        auction: z.string().nullish(),
    }),
})

export const domainListings = {
    listingsSchema: _listingsSchema,

    /**
     * Next.js json schema parser to reduce app logic
     */
    nextDataJsonSchema: z.object({
        props: z.object({
            pageProps: z.object({
                componentProps: z.object({
                    currentPage: z.number().min(1),
                    totalPages: z.number().min(1),
                    listingsMap: z.record(z.string(), _listingsSchema),
                }),
            }),
        }),
    }),

    /**
     * @description Extract array of raw listings from Next.js JSON.
     * @description Detects isLastPage for looping.
     * @param nextDataJson
     */
    tryExtractListings(nextDataJson: object) {
        return traceTryFunction(
            'domainListings.tryExtractListings',
            arguments,
            'ERROR',
            async () => {
                const validNextjson = domainListings.nextDataJsonSchema.parse(nextDataJson)
                const currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage
                const lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages
                const listings = Object.values(
                    validNextjson.props.pageProps.componentProps.listingsMap,
                )
                const isLastPage = lastPageNumber === currentPageNumber
                return [listings, isLastPage]
            },
        )
    },

    /**
     * @description Transform listing json data for database table inserts
     * @param listing
     * @returns Object containing tables for database inserts
     */
    tryTransformListing(listing: z.infer<typeof _listingsSchema>) {
        return traceTryFunction(
            'domainListings.tryTransformListing',
            arguments,
            'ERROR',
            async () => {
                const listingModel = listing.listingModel
                const address = listingModel.address
                const features = listingModel.features

                return {
                    common_features_table: {
                        bed_quantity: features.beds ?? 0,
                        bath_quantity: features.baths ?? 0,
                        car_quantity: features.parking ?? 0,
                        home_type: features.propertyType,
                        is_retirement: features.isRetirement,
                    } satisfies Updateable<Schema.CommonFeaturesTable>,
                    home_table: {
                        street_address: address.street,
                        gps: createPostgisPointString(address.lng, address.lat),
                        land_m2: features.landSize === 0 ? null : features.landSize,
                        inspection_time: scrapeUtil.parseDatetime(listingModel.inspection.openTime),
                        auction_time: scrapeUtil.parseDatetime(listingModel.auction),
                    } satisfies Updateable<Schema.HomeTable>,
                }
            },
        )
    },

    /**
     * @description Get sale price info
     * @param listing
     * @returns Object containing tables for database inserts
     */
    tryTransformSalePrice(listing: z.infer<typeof _listingsSchema>) {
        return traceTryFunction(
            'domainListings.tryTransformSalePrice',
            arguments,
            'WARN',
            async () => {
                const beds = listing.listingModel.features.beds ?? 0
                const land = listing.listingModel.features.landSize
                const priceString = listing.listingModel.price
                const price = scrapeUtil.highestPriceFromString(priceString)

                if (!price) throw Error('no price in listing.listingModel.price')
                return {
                    sale_price_table: {
                        last_scrape_date: '',
                        higher_price_aud: price,
                        aud_per_bed: beds > 0 ? Math.round(price / beds) : null,
                        aud_per_land_m2: land > 0 ? Math.round(price / land) : null,
                    } satisfies Updateable<Schema.SalePriceTable>,
                }
            },
        )
    },

    /**
     * @description Get rent price info
     * @param listing
     * @returns Object containing tables for database inserts
     */
    tryTransformRentPrice(listing: z.infer<typeof _listingsSchema>) {
        return traceTryFunction(
            'domainListings.tryTransformRentPrice',
            arguments,
            'WARN',
            async () => {
                const beds = listing.listingModel.features.beds ?? 0
                const priceString = listing.listingModel.price
                const price = scrapeUtil.highestPriceFromString(priceString)

                if (!price) throw Error('no price in listing.listingModel.price')
                return {
                    rent_price_table: {
                        last_scrape_date: '',
                        weekly_rent_aud: price,
                        aud_per_bed: beds > 0 ? Math.round(price / beds) : null,
                    } satisfies Updateable<Schema.RentPriceTable>,
                }
            },
        )
    },
}

import { z } from 'zod'
import {
    enumToArray,
    Schema,
    createPostgisPointString,
} from '@service-scrape/lib-db_service_scrape'
import { scrapeUtil } from '../scrapeUtil'
import type { Updateable } from 'kysely'
import { IService } from '../../global/IService'

const listingsSchema = z.object({
    listingModel: z.object({
        url: z.string(),
        price: z.string(),
        address: z.object({
            street: z.string(),
            lat: z.number(),
            lng: z.number(),
        }),
        features: z.object({
            beds: z.number().catch(0),
            baths: z.number().catch(0),
            parking: z.number().catch(0),
            propertyType: z.enum(enumToArray(Schema.HomeTypeEnum)),
            isRural: z.boolean(),
            landSize: z.number().catch(0),
            isRetirement: z.boolean(),
        }),
        inspection: z.object({
            openTime: z.string().nullable(),
            closeTime: z.string().nullable(),
        }),
        auction: z.string().nullable(),
    }),
})

export type ListingsSchemaDTO = z.infer<typeof listingsSchema>

/**
 * Next.js json schema parser to reduce app logic
 */
const nextDataJsonSchema = z.object({
    props: z.object({
        pageProps: z.object({
            componentProps: z.object({
                currentPage: z.number().min(1),
                totalPages: z.number().min(1),
                listingsMap: z.record(z.string(), listingsSchema),
            }),
        }),
    }),
})

export class DomainListingsService extends IService {
    /**
     * @description Extract array of raw listings from Next.js JSON.
     * @description Detects isLastPage for looping.
     * @param nextDataJson
     */
    tryExtractListings(args: { nextDataJson: object }) {
        try {
            const validNextjson = nextDataJsonSchema.parse(args.nextDataJson)
            const currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage
            const lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages
            const listings = Object.values(
                validNextjson.props.pageProps.componentProps.listingsMap,
            ) as ListingsSchemaDTO[]
            const isLastPage = lastPageNumber === currentPageNumber
            return { listings, isLastPage }
        } catch (e) {
            this.log('error', e, args)
            return null
        }
    }

    /**
     * @description Transform listing json data for database table inserts
     * @param listing
     * @returns Object containing tables for database inserts
     */
    tryTransformListing(args: { listing: ListingsSchemaDTO }) {
        try {
            const listingModel = args.listing.listingModel
            const address = listingModel.address
            const features = listingModel.features
            return {
                common_features_table: {
                    bed_quantity: features.beds,
                    bath_quantity: features.baths,
                    car_quantity: features.parking,
                    home_type: features.propertyType,
                    is_retirement: features.isRetirement,
                } satisfies Updateable<Schema.CommonFeaturesTable>,
                home_table: {
                    street_address: address.street,
                    gps: createPostgisPointString(address.lng, address.lat),
                    land_m2: features.landSize,
                    inspection_time: scrapeUtil.parseDatetime(listingModel.inspection.openTime),
                    auction_time: scrapeUtil.parseDatetime(listingModel.auction),
                } satisfies Updateable<Schema.HomeTable>,
            }
        } catch (e) {
            this.log('error', e, args)
            return null
        }
    }

    /**
     * @description Get sale price info
     * @param listing
     * @returns Object containing tables for database inserts
     */
    tryTransformSalePrice(args: { listing: ListingsSchemaDTO }) {
        try {
            const beds = args.listing.listingModel.features.beds
            const land = args.listing.listingModel.features.landSize
            const priceString = args.listing.listingModel.price
            const price = scrapeUtil.highestPriceFromString(priceString)

            if (!price)
                throw Error(
                    `no price in listing.listingModel.price - "${args.listing.listingModel.price}"`,
                )
            return {
                sale_price_table: {
                    last_scrape_date: '',
                    higher_price_aud: price,
                    aud_per_bed: beds > 0 ? price / beds : 0,
                    aud_per_land_m2: land > 0 ? price / land : 0,
                } satisfies Updateable<Schema.SalePriceTable>,
            }
        } catch (e) {
            this.log('error', e, args)
            return null
        }
    }

    /**
     * @description Get rent price info
     * @param listing
     * @returns Object containing tables for database inserts
     */
    tryTransformRentPrice(args: { listing: ListingsSchemaDTO }) {
        try {
            const beds = args.listing.listingModel.features.beds
            const land = args.listing.listingModel.features.landSize
            const priceString = args.listing.listingModel.price
            const price = scrapeUtil.highestPriceFromString(priceString)

            if (!price) throw Error('no price in listing.listingModel.price')
            return {
                rent_price_table: {
                    last_scrape_date: '',
                    weekly_rent_aud: price,
                    aud_per_bed: beds > 0 ? price / beds : 0,
                    aud_per_land_m2: land > 0 ? price / land : 0,
                } satisfies Updateable<Schema.RentPriceTable>,
            }
        } catch (e) {
            this.log('error', e, args)
            return null
        }
    }
}

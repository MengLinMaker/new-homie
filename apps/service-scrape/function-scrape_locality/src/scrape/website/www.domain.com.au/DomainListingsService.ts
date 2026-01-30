import { z } from 'zod'
import {
    type RemoveTableIds,
    tryCreatePostgisPointString,
} from '@service-scrape/lib-db_service_scrape'
import {
    type HomeFeatureTableInitializer,
    type HomeTableInitializer,
    homeTypeEnum,
    type RentPriceTableInitializer,
    type SalePriceTableInitializer,
} from '@service-scrape/lib-db_service_scrape/schema'
import { ILoggable } from '@observability/lib-opentelemetry'

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
            beds: z.number().min(1),
            baths: z.number().catch(0),
            parking: z.number().catch(0),
            propertyType: homeTypeEnum,
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
                totalPages: z.number().min(0),
                listingsMap: z.record(z.string(), listingsSchema.nullable().catch(null)),
            }),
        }),
    }),
})

export class DomainListingsService extends ILoggable {
    expectedNoMatchingPrice(priceString: string) {
        // Remove years 2020 to 2099
        priceString = priceString.replaceAll(/[ /]20[2-9]\d(?!\d)/g, '')
        // Remove areas sqm and m2
        priceString = priceString.replaceAll(/\d{3,4} ?(sqm|m2)/gi, '')

        // No number to extract
        if (!priceString.match(/\d/i)) return true
        const digitLengths = [...priceString.matchAll(/\d+/g)].map((m) => m[0].length)
        // Exclude if all numbers are under length 3
        if (Math.max(...digitLengths) < 3) return true
        // Exclude if all numbers are over length 7
        if (Math.min(...digitLengths) > 7) return true
        // Requires agent contact
        if (priceString.match(/(auction|call|contact|offer|expression)/i)) return true
        // Contains a time
        if (priceString.match(/\d{1,2}(:\d{1,2})?(pm|am)/i)) return true
        // Contains a date
        if (priceString.match(/\b\d{2}\b(\/|-)\b\d{2}\b(\/|-)\b\d{2,4}\b/i)) return true
        // Exclude not many numeric characters
        if (priceString.matchAll(/\d/g).toArray().length / priceString.length < 1 / 10) return true
        return false
    }

    /**
     * @description Homes tend to sell at higher price.
     * @returns Integer price
     */
    highestSalePriceFromString(priceString: string) {
        const digitPrices = priceString
            .replaceAll(',', '')
            .matchAll(/\b\d{5,7}\b/g) // Integer totalling 5-7 digits - assume 5 digit houses don't exist
            .toArray()
        if (digitPrices.length !== 0) {
            const priceList = digitPrices.map((match) => Number.parseFloat(match.toString()))
            return Math.max(...priceList)
        }
        const kPrices = priceString
            .replaceAll(',', '')
            .matchAll(/\b\d{2,3}k\b/gi) // Integer totalling 2-3 digits followed by 'k' or 'K'
            .toArray()
        if (kPrices.length !== 0) {
            const priceList = kPrices.map((match) =>
                Number.parseFloat(match.toString().toLowerCase().replace(/k/g, '')),
            )
            return Math.max(...priceList) * 1000
        }
        const spacedPrices = priceString.matchAll(/\b[$]?\d{3} 0{3}\b/g).toArray()
        if (spacedPrices.length !== 0) {
            const priceList = spacedPrices.map((match) =>
                Number.parseFloat(match.toString().replaceAll(/[ $]/g, '')),
            )
            return Math.max(...priceList)
        }
        return null
    }

    /**
     * @description Homes tend to sell at higher price.
     * @returns Integer price
     */
    highestRentPriceFromString(priceString: string) {
        const prices = priceString
            .replaceAll(/\b\d{3}\b \b\d{4}\b \b\d{4}\b/g, '') // Replace phone numbers
            .replaceAll(/\b\d{2}\b(\/|-)\b\d{2}\b(\/|-)\b\d{2,4}\b/g, '') // Replace dates
            .replaceAll(',', '') // Remove commas from numbers
            .toLowerCase()
            .matchAll(/\b\d{3,4}(pw|p\/w|weekly|per)?\b/g) // Integer totalling 3-4 digits
            .toArray()
        if (prices.length === 0) return null
        const priceList = prices.map((match) => Number.parseFloat(match.toString()))
        return Math.max(...priceList)
    }

    /**
     * Parse raw datetime to ISO format
     * @param datetime
     * @returns
     */
    parseDatetime(datetime: string | null | undefined) {
        if (datetime) {
            return z.iso.datetime().parse(`${datetime}Z`, {
                reportInput: true,
            })
        } else {
            return z.iso.datetime().parse(new Date(0).toISOString(), {
                reportInput: true,
            })
        }
    }

    /**
     * @description Extract array of raw listings from Next.js JSON.
     * @description Detects isLastPage for looping.
     * @param nextDataJson
     */
    tryExtractListings(args: { nextDataJson: object }) {
        try {
            const validNextjson = nextDataJsonSchema.parse(args.nextDataJson, {
                reportInput: true,
            })
            const currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage
            const lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages
            const listings = Object.values(
                validNextjson.props.pageProps.componentProps.listingsMap,
            ).filter((listing) => !!listing) as ListingsSchemaDTO[]
            const isLastPage = lastPageNumber <= currentPageNumber
            return { listings, isLastPage }
        } catch (e) {
            this.logExceptionArgs('error', this.tryExtractListings, args, e)
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
            if (address.street.length === 0) return null

            const features = listingModel.features
            // Convert to hectares if needed
            const landSize = Number.isInteger(features.landSize)
                ? features.landSize
                : Math.floor(features.landSize * 10 ** 4)
            return {
                home_feature_table: {
                    bed_quantity: features.beds,
                    bath_quantity: features.baths,
                    car_quantity: features.parking,
                    home_type: features.propertyType,
                    is_retirement: features.isRetirement,
                } satisfies RemoveTableIds<HomeFeatureTableInitializer>,
                home_table: {
                    street_address: address.street,
                    gps: tryCreatePostgisPointString(address.lng, address.lat),
                    land_m2: landSize,
                    inspection_time: this.parseDatetime(listingModel.inspection.openTime) as never,
                    auction_time: this.parseDatetime(listingModel.auction) as never,
                } satisfies RemoveTableIds<HomeTableInitializer>,
            }
        } catch (e) {
            this.logExceptionArgs('error', this.tryTransformListing, args, e)
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
            const price = this.highestSalePriceFromString(priceString)
            if (!price) {
                if (this.expectedNoMatchingPrice(priceString)) return
                const e = new Error(
                    `no price in listing.listingModel.price - "${args.listing.listingModel.price}"`,
                )
                this.logException('warn', this.tryTransformSalePrice, e)
                return null
            }
            return {
                sale_price_table: {
                    higher_price_aud: price,
                    aud_per_bed: beds > 0 ? price / beds : 0,
                    aud_per_land_m2: land > 0 ? price / land : 0,
                } satisfies Omit<
                    RemoveTableIds<SalePriceTableInitializer>,
                    `${string}_scrape_date`
                >,
            }
        } catch (e) {
            this.logExceptionArgs('error', this.tryTransformSalePrice, args, e)
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
            const price = this.highestRentPriceFromString(priceString)
            if (!price) {
                if (this.expectedNoMatchingPrice(priceString)) return
                const e = new Error(
                    `no price in listing.listingModel.price - "${args.listing.listingModel.price}"`,
                )
                this.logException('warn', this.tryTransformRentPrice, e)
                return null
            }
            return {
                rent_price_table: {
                    weekly_rent_aud: price,
                    aud_per_bed: beds > 0 ? price / beds : 0,
                    aud_per_land_m2: land > 0 ? price / land : 0,
                } satisfies Omit<
                    RemoveTableIds<RentPriceTableInitializer>,
                    `${string}_scrape_date`
                >,
            }
        } catch (e) {
            this.logExceptionArgs('error', this.tryTransformRentPrice, args, e)
            return null
        }
    }

    tryExtractSalesPage(args: { nextDataJson: object }) {
        const { nextDataJson } = args
        const result = this.tryExtractListings({ nextDataJson })
        if (!result) return null
        const { listings, isLastPage } = result

        const salesInfo = listings
            .map((listing) => {
                const listingInfo = this.tryTransformListing({ listing })
                const priceInfo = this.tryTransformSalePrice({ listing })

                if (!listingInfo || !priceInfo) return null
                const validSaleInfo = {
                    ...listingInfo,
                    ...priceInfo,
                }
                return validSaleInfo
            })
            .filter((result) => result !== null)
        return { salesInfo, isLastPage }
    }

    tryExtractRentsPage(args: { nextDataJson: object }) {
        const { nextDataJson } = args
        const result = this.tryExtractListings({ nextDataJson })
        if (!result) return null
        const { listings, isLastPage } = result

        const rentsInfo = listings
            .map((listing) => {
                const listingInfo = this.tryTransformListing({ listing })
                const priceInfo = this.tryTransformRentPrice({ listing })

                if (!listingInfo || !priceInfo) return null
                const validSaleInfo = {
                    ...listingInfo,
                    ...priceInfo,
                }
                return validSaleInfo
            })
            .filter((result) => result !== null)
        return { rentsInfo, isLastPage }
    }
}

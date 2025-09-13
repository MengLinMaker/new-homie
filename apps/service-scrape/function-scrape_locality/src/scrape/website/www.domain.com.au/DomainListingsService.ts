import { z } from 'zod'
import { type Schema, tryCreatePostgisPointString } from '@service-scrape/lib-db_service_scrape'
import type { Updateable } from 'kysely'
import { ILoggable } from '@observability/lib-opentelemetry'

const HomeTypeEnum: Schema.HomeTypeEnum[] = [
    'Apartment',
    'ApartmentUnitFlat',
    'BlockOfUnits',
    'DevelopmentSite',
    'Duplex',
    'FreeStanding',
    'House',
    'Land',
    'NewApartments',
    'NewHomeDesigns',
    'NewHouseLand',
    'NewLand',
    'PentHouse',
    'Retirement',
    'SemiDetached',
    'Studio',
    'Terrace',
    'Townhouse',
    'VacantLand',
    'Villa',
]

const listingsSchema = z.object({
    listingModel: z.object({
        url: z.string(),
        price: z.string(),
        address: z.object({
            street: z.string(),
            lat: z.number().nullish(),
            lng: z.number().nullish(),
        }),
        features: z.object({
            beds: z.number().catch(0),
            baths: z.number().catch(0),
            parking: z.number().catch(0),
            propertyType: z.enum(HomeTypeEnum),
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
                listingsMap: z.record(z.string(), listingsSchema),
            }),
        }),
    }),
})

export class DomainListingsService extends ILoggable {
    /**
     * @description Homes tend to sell at higher price.
     * @returns Integer price
     */
    highestPriceFromString(priceString: string) {
        const prices = priceString
            .replaceAll(/[^0-9^ ^-^$^.]+/g, '') // Expect numbers separated by '_' or ' '
            .matchAll(/[$]( )?\d+/g) // Integer price starts with $, could have a space
            .toArray()
        if (prices.length === 0) return null
        const priceList = prices.map((match) =>
            Number.parseFloat(match.toString().replaceAll('$', '')),
        )
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
            return null
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
            ) as ListingsSchemaDTO[]
            const isLastPage = lastPageNumber <= currentPageNumber
            return { listings, isLastPage }
        } catch (e) {
            this.logException('error', this.tryExtractListings, e)
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
            return {
                home_feature_table: {
                    bed_quantity: features.beds,
                    bath_quantity: features.baths,
                    car_quantity: features.parking,
                    home_type: features.propertyType,
                    is_retirement: features.isRetirement,
                } satisfies Updateable<Schema.HomeFeatureTable>,
                home_table: {
                    street_address: address.street,
                    gps: tryCreatePostgisPointString(address.lng, address.lat),
                    land_m2: features.landSize,
                    inspection_time: this.parseDatetime(listingModel.inspection.openTime),
                    auction_time: this.parseDatetime(listingModel.auction),
                } satisfies Updateable<Schema.HomeTable>,
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
            const price = this.highestPriceFromString(priceString)
            if (!priceString.match(/\d/g)) return
            if (!price) {
                const e = new Error(
                    `no price in listing.listingModel.price - "${args.listing.listingModel.price}"`,
                )
                this.logException('warn', this.tryTransformSalePrice, e)
                return null
            }
            return {
                sale_price_table: {
                    last_scrape_date: '',
                    higher_price_aud: price,
                    aud_per_bed: beds > 0 ? price / beds : 0,
                    aud_per_land_m2: land > 0 ? price / land : 0,
                } satisfies Updateable<Schema.SalePriceTable>,
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
            const price = this.highestPriceFromString(priceString)
            if (!priceString.match(/\d/g)) return
            if (!price) {
                const e = new Error(
                    `no price in listing.listingModel.price - "${args.listing.listingModel.price}"`,
                )
                this.logException('warn', this.tryTransformRentPrice, e)
                return null
            }
            return {
                rent_price_table: {
                    last_scrape_date: '',
                    weekly_rent_aud: price,
                    aud_per_bed: beds > 0 ? price / beds : 0,
                    aud_per_land_m2: land > 0 ? price / land : 0,
                } satisfies Updateable<Schema.RentPriceTable>,
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

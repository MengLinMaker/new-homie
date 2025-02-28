import { traceTryFunction } from '../instrumentation'
import { z } from 'zod'
import { dbSchema, toPgDatetime } from '@service-scrape/lib-db_service_scrape'
import { scrapeUtil } from './scrapeUtil'

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
      propertyType: z.string(),
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

/**
 * Functions for extracting data from
 */
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
   * Extract array of raw listings from Next.js JSON.
   * Detects isLastPage for looping.
   * @param nextDataJson
   */
  tryExtractListings(nextDataJson: object) {
    return traceTryFunction('domainListings.tryExtractListings', arguments, 'ERROR', async () => {
      const validNextjson = domainListings.nextDataJsonSchema.parse(nextDataJson)
      const currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage
      const lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages
      const listings = Object.values(validNextjson.props.pageProps.componentProps.listingsMap)
      const isLastPage = lastPageNumber === currentPageNumber
      return [listings, isLastPage]
    })
  },

  /**
   * @description Transform listing json data for database table inserts
   * @param listing
   * @returns Object containing tables for database inserts
   */
  tryTransformListing(listing: z.infer<typeof _listingsSchema>) {
    return traceTryFunction('domainListings.tryTransformListing', arguments, 'ERROR', async () => {
      const listingModel = listing.listingModel
      const address = listingModel.address
      const features = listingModel.features
      return {
        common_features_table: dbSchema.common_features_table.parse({
          bed_quantity: features.beds ?? 0,
          bath_quantity: features.baths ?? 0,
          car_quantity: features.parking ?? 0,
          home_type: features.propertyType as any,
          is_retirement: features.isRetirement,
          is_rural: features.isRural,
        } satisfies z.infer<typeof dbSchema.common_features_table>),
        home_table: dbSchema.home_table.parse({
          street_address: address.street,
          gps: [address.lat, address.lng],
          land_m2: features.landSize === 0 ? null : features.landSize,
          inspection_time: toPgDatetime(listingModel.inspection.openTime),
          auction_time: toPgDatetime(listingModel.auction),
        } satisfies z.infer<typeof dbSchema.home_table>),
      }
    })
  },

  /**
   * @description Get sale price info
   * @param listing
   * @returns Object containing tables for database inserts
   */
  tryTransformSalePrice(listing: z.infer<typeof _listingsSchema>) {
    return traceTryFunction('domainListings.tryTransformSalePrice', arguments, 'WARN', async () => {
      const beds = listing.listingModel.features.beds ?? 0
      const land = listing.listingModel.features.landSize
      const priceString = listing.listingModel.price
      const price = scrapeUtil.highestPriceFromString(priceString)

      if (!price) throw Error('no price in listing.listingModel.price')
      return {
        sale_price_table: dbSchema.sale_price_table.parse({
          first_scrape_date: '',
          last_scrape_date: '',
          higher_price_aud: price,
          aud_per_bed: beds > 0 ? Math.round(price / beds) : null,
          aud_per_land_m2: land > 0 ? Math.round(price / land) : null,
        } satisfies z.infer<typeof dbSchema.sale_price_table>),
      }
    })
  },

  /**
   * @description Get rent price info
   * @param listing
   * @returns Object containing tables for database inserts
   */
  tryTransformRentPrice(listing: z.infer<typeof _listingsSchema>) {
    return traceTryFunction('domainListings.tryTransformRentPrice', arguments, 'WARN', async () => {
      const beds = listing.listingModel.features.beds ?? 0
      const priceString = listing.listingModel.price
      const price = scrapeUtil.highestPriceFromString(priceString)

      if (!price) throw Error('no price in listing.listingModel.price')
      return {
        rental_price_table: dbSchema.rental_price_table.parse({
          first_scrape_date: '',
          last_scrape_date: '',
          weekly_rent_aud: price,
          aud_per_bed: beds > 0 ? Math.round(price / beds) : null,
        } satisfies z.infer<typeof dbSchema.rental_price_table>),
      }
    })
  },
}

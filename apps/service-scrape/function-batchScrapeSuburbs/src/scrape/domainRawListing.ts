import { traceTryFunction } from '../instrumentation'
import { z } from 'zod'

export const domainRawListing = {
  /**
   * Next.js json schema parser to reduce app logic
   */
  schema: z.object({
    props: z.object({
      pageProps: z.object({
        componentProps: z.object({
          currentPage: z.number().min(1),
          totalPages: z.number().min(1),
          listingsMap: z.record(
            z.string(),
            z.object({
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
            }),
          ),
        }),
      }),
    }),
  }),

  tryExtractListings(nextJson: object) {
    return traceTryFunction('domainRawListing.tryExtractListings', arguments, 'ERROR', async () => {
      const validNextjson = domainRawListing.schema.parse(nextJson)
      const currentPageNumber = validNextjson.props.pageProps.componentProps.currentPage
      const lastPageNumber = validNextjson.props.pageProps.componentProps.totalPages
      const listings = Object.values(validNextjson.props.pageProps.componentProps.listingsMap)
      const isLastPage = lastPageNumber === currentPageNumber
      return [listings, isLastPage]
    })
  },
}

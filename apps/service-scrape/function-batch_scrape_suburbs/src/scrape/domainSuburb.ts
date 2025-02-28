import { z } from 'zod'
import { traceTryFunction } from '../instrumentation'

const _boundaryGeoJsonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.array(z.number()).length(2))),
})

const _rawSuburbSchema = z.object({
  suburb: z.object({
    name: z.string(),
    state: z.string(),
    postcode: z.string(),
    statistics: z.object({
      marriedPercentage: z.number(),
      ownerOccupierPercentage: z.number(),
      population: z.number(),
      mostCommonAgeBracket: z.string(),
    }),
    schools: z.array(
      z.object({
        acaraId: z.string(),
        schoolType: z.string(),
        name: z.string(),
        gender: z.string().nullable(),
        schoolSector: z.string(),
        profile: z
          .object({
            yearRange: z.string(),
          })
          .nullable(),
      }),
    ),
  }),
  location: z.object({
    data: z.object({
      propertyCategories: z.array(
        z.object({
          bedrooms: z.number(),
          propertyCategory: z.string(),
          medianSoldPrice: z.number(),
          daysOnMarket: z.number(),
          auctionClearanceRate: z.number(),
          numberSold: z.number(),
          medianRentPrice: z.number(),
          entryLevelPrice: z.number(),
          luxuryLevelPrice: z.number(),
        }),
      ),
    }),
  }),
})

export type rawSuburb = {
  rawSuburbData: z.infer<typeof _rawSuburbSchema>
  boundaryGeoJson: z.infer<typeof _boundaryGeoJsonSchema>
}

export const domainSuburb = {
  /**
   * Next.js json schema parser to reduce app logic
   */
  nextDataJsonSchema: z.object({
    props: z.object({
      pageProps: z.object({
        __APOLLO_STATE__: z.record(z.string(), z.any()),
      }),
    }),
  }),

  /**
   * @description Extract raw objects from Next.js JSON.
   * @param nextDataJson
   * @returns object containing rawSuburbSchema
   */
  tryExtractProfile(nextDataJson: object) {
    return traceTryFunction('domainSuburb.tryExtractProfile', arguments, 'ERROR', async () => {
      const validNextjson = domainSuburb.nextDataJsonSchema.parse(nextDataJson)
      const intestingObjects = Object.values(validNextjson.props.pageProps.__APOLLO_STATE__).slice(
        0,
        2,
      )
      return {
        rawSuburbData: _rawSuburbSchema.parse({
          suburb: intestingObjects[0],
          location: intestingObjects[1],
        }),
        boundaryGeoJson: _boundaryGeoJsonSchema.parse(
          JSON.parse(
            intestingObjects[0]['suburbShape({"geometryPrecision":"high"})'].boundaryGeoJson,
          ),
        ),
      } satisfies rawSuburb
    })
  },
}

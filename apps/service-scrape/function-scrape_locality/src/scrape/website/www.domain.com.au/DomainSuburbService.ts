import { localityArgs, urlArgs } from '../../global'
import { createPostgisPolygonString } from '@service-scrape/lib-db_service_scrape'
import { z } from 'zod'
import { simplify, polygon } from '@turf/turf'
import { ILoggable } from '@observability/lib-opentelemetry'
import {
    type LocalityTableInitializer,
    stateAbbreviationEnum,
} from '@service-scrape/lib-db_service_scrape/schema'

const _boundaryGeoJsonSchema = z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number()).length(2))),
})

const _rawSuburbSchema = z.object({
    suburb: z.object({
        name: z.string(),
        state: stateAbbreviationEnum,
        postcode: z.string(),
        // statistics: z.object({
        //     marriedPercentage: z.number(),
        //     ownerOccupierPercentage: z.number(),
        //     population: z.number(),
        //     mostCommonAgeBracket: z.string(),
        // }),
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

export type DomainListingsDTO = z.infer<typeof _rawSuburbSchema> & {
    boundaryGeoJson: z.infer<typeof _boundaryGeoJsonSchema>
}

/**
 * Next.js json schema parser to reduce app logic
 */
const nextDataJsonSchema = z.object({
    props: z.object({
        pageProps: z.object({
            __APOLLO_STATE__: z.record(z.string(), z.any()),
        }),
    }),
})

/**
 * Next.js 404 json schema
 */
const nextData404JsonSchema = z.object({ page: z.literal('/404') })

export class DomainSuburbService extends ILoggable {
    /**
     * @description Extract raw objects from Next.js JSON
     * @param nextDataJson
     * @returns object containing rawSuburbSchema
     */
    tryExtractProfile(args: { nextDataJson: object }) {
        try {
            const validNextjson = nextDataJsonSchema.parse(args.nextDataJson, {
                reportInput: true,
            })
            const __APOLLO_STATE__ = validNextjson.props.pageProps.__APOLLO_STATE__
            const suburbKey = Object.keys(__APOLLO_STATE__).filter((x) => /^Suburb:/.test(x))[0]!
            const locationProfileKey = Object.keys(__APOLLO_STATE__).filter((x) =>
                /^LocationProfile:/.test(x),
            )[0]!

            return {
                ..._rawSuburbSchema.parse(
                    {
                        suburb: __APOLLO_STATE__[suburbKey],
                        location: __APOLLO_STATE__[locationProfileKey],
                    },
                    {
                        reportInput: true,
                    },
                ),
                boundaryGeoJson: _boundaryGeoJsonSchema.parse(
                    JSON.parse(
                        __APOLLO_STATE__[suburbKey]['suburbShape({"geometryPrecision":"high"})']
                            .boundaryGeoJson,
                    ),
                    {
                        reportInput: true,
                    },
                ),
            } satisfies DomainListingsDTO
        } catch (e) {
            // Debug common /404 page error with locality args
            const pageIs404 = nextData404JsonSchema.safeParse(args.nextDataJson, {
                reportInput: true,
            }).success
            if (pageIs404) {
                const pageIs404Args = { urlArgs, localityArgs } as never
                this.logExceptionArgs('error', this.tryExtractProfile, pageIs404Args, e)
                return null
            }

            this.logExceptionArgs('error', this.tryExtractProfile, args, e)
            return null
        }
    }

    /**
     * @description Transforms raw suburb data for database insertion
     * @param rawSuburbData
     * @returns Object containing tables for database inserts
     */
    tryTransformProfile(args: { rawSuburbData: DomainListingsDTO }) {
        try {
            // Simplify geo boundary to reduce storage size.
            const compressedCoordinates = simplify(
                polygon(args.rawSuburbData.boundaryGeoJson.coordinates),
                {
                    tolerance: 0.00025,
                    highQuality: true,
                },
            ).geometry.coordinates

            const boundaryCoord = createPostgisPolygonString(compressedCoordinates[0])
            if (!boundaryCoord) {
                const e = new Error('invalid locality boundary coordinate')
                throw this.logExceptionArgs('fatal', this.tryTransformProfile, args, e)
            }

            // rawSuburbData.suburb.statistics.population
            // rawSuburbData.suburb.statistics.ownerOccupierPercentage
            // rawSuburbData.suburb.statistics.marriedPercentage

            // rawSuburbData.location.data.propertyCategories
            // rawSuburbData.suburb.schools
            return {
                locality_table: {
                    postcode: args.rawSuburbData.suburb.postcode,
                    suburb_name: args.rawSuburbData.suburb.name,
                    state_abbreviation: args.rawSuburbData.suburb.state,
                    boundary_coordinates: boundaryCoord,
                } satisfies LocalityTableInitializer,
            }
        } catch (e) {
            this.logExceptionArgs('error', this.tryTransformProfile, args, e)
            return null
        }
    }
}

import {
    createPostgisPolygonString,
    enumToArray,
    Schema,
} from '@service-scrape/lib-db_service_scrape'
import { z } from 'zod'
import type { Updateable } from 'kysely'
import { simplify, polygon } from '@turf/turf'
import { ILoggable } from '@observability/lib-opentelemetry'

const _boundaryGeoJsonSchema = z.object({
    type: z.literal('Polygon'),
    coordinates: z.array(z.array(z.array(z.number()).length(2))),
})

const _rawSuburbSchema = z.object({
    suburb: z.object({
        name: z.string(),
        state: z.enum(enumToArray(Schema.StateAbbreviationEnum)),
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

export class DomainSuburbService extends ILoggable {
    /**
     * @description Extract raw objects from Next.js JSON
     * @param nextDataJson
     * @returns object containing rawSuburbSchema
     */
    tryExtractProfile(args: { nextDataJson: object }) {
        this.log('debug', this.tryExtractProfile)
        try {
            const validNextjson = nextDataJsonSchema.parse(args.nextDataJson, {
                reportInput: true,
            })
            const intestingObjects = Object.values(validNextjson.props.pageProps.__APOLLO_STATE__)
            return {
                ..._rawSuburbSchema.parse(
                    {
                        suburb: intestingObjects[0],
                        location: intestingObjects[1],
                    },
                    {
                        reportInput: true,
                    },
                ),
                boundaryGeoJson: _boundaryGeoJsonSchema.parse(
                    JSON.parse(
                        intestingObjects[0]['suburbShape({"geometryPrecision":"high"})']
                            .boundaryGeoJson,
                    ),
                    {
                        reportInput: true,
                    },
                ),
            } satisfies DomainListingsDTO
        } catch (e) {
            this.logException('error', e, 'Too large to display')
            return null
        }
    }

    /**
     * @description Transforms raw suburb data for database insertion
     * @param rawSuburbData
     * @returns Object containing tables for database inserts
     */
    tryTransformProfile(args: { rawSuburbData: DomainListingsDTO }) {
        this.log('debug', this.tryTransformProfile)
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
            if (!boundaryCoord) throw new Error('invalid locality boundary coordinate')

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
                } satisfies Updateable<Schema.LocalityTable>,
            }
        } catch (e) {
            this.logException('error', e, args)
            return null
        }
    }
}

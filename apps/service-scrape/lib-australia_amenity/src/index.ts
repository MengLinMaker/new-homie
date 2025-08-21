import z from 'zod'

import australiaAmenities from './resource/australia-amenities-final.json'
import australiaSchools from './resource/australia-schools-final.json'
import { enumToArray, Schema } from '@service-scrape/lib-db_service_scrape'

export const validAustraliaAmenities = z
    .array(
        z.object({
            name: z.string(),
            type: z.string(),
            category: z.string(),
            gps: z.tuple([z.number(), z.number()]),
        }),
    )
    .parse(australiaAmenities)

export const validAustraliaSchools = z
    .array(
        z.object({
            school_table: z.object({
                name: z.string(),
                url: z.url().nullable(),
                acara_id: z.number(),
                gps: z.object({
                    lng: z.number(),
                    lat: z.number(),
                }),
            }),
            school_feature_table: {
                primary: z.boolean(),
                secondary: z.boolean(),
                government_sector: z.boolean(),
                independent: z.boolean(),
                special_needs: z.boolean(),
            },
            locality_table: {
                suburb: z.string(),
                state: z.enum(enumToArray(Schema.StateAbbreviationEnum)),
                postcode: z.string(),
            },
        }),
    )
    .parse(australiaSchools)

import { createPostgisPointString, type SchemaWrite } from '@service-scrape/lib-db_service_scrape'
import type { Updateable } from 'kysely'
import { writeFileSync } from 'node:fs'
import { localitySchema } from '../index.ts'
import { readBrotliJson } from '../util.ts'
import z from 'zod'
import { stateAbbreviationEnumSchema } from '@service-scrape/lib-db_service_scrape/zod'

/**
 * Separate script to parse schools data - https://asl.acara.edu.au/School-Search
 */
export const extractAcaraSchools = () => {
    const schoolsData = readBrotliJson('./resource/australia-schools.json.br')
    const schema = z.array(
        z.object({
            ACARAId: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive()),
            SchoolName: z.string(),
            SchoolType: z.enum(['Pri/Sec', 'Prim', 'Sec', 'Special']),
            SchoolURL: z.string(),
            SchoolSector: z.enum(['NG', 'Gov']),
            IndependentSchool: z.enum(['Y', 'N']),
            AddressList: z
                .array(
                    z.object({
                        City: z.string(),
                        StateProvince: stateAbbreviationEnumSchema,
                        PostalCode: z.string().length(4),
                        GridLocation: z.object({
                            Latitude: z.number(),
                            Longitude: z.number(),
                        }),
                    }),
                )
                .length(1),
        }),
    )
    const validSchoolsData = schema.parse(schoolsData, { reportInput: true })
    const transformedSchoolsData = validSchoolsData
        .filter((school) => z.url().safeParse(school.SchoolURL).success)
        .map((school) => {
            const address = school.AddressList[0]
            if (!address) throw new Error(`No address found for ACARAId: ${school.ACARAId}`)
            const locality_table = localitySchema.parse({
                suburb_name: address.City,
                state_abbreviation: address.StateProvince,
                postcode: address.PostalCode,
            })
            return {
                school_table: {
                    name: school.SchoolName,
                    url: school.SchoolURL,
                    acara_id: school.ACARAId,
                    gps: createPostgisPointString(
                        address.GridLocation.Longitude,
                        address.GridLocation.Latitude,
                    ),
                },
                school_feature_table: {
                    primary: school.SchoolType === 'Prim' || school.SchoolType === 'Pri/Sec',
                    secondary: school.SchoolType === 'Sec' || school.SchoolType === 'Pri/Sec',
                    government_sector: school.SchoolSector === 'Gov',
                    independent: school.IndependentSchool === 'Y',
                    special_needs: school.SchoolType === 'Special',
                },
                locality_table,
            } satisfies {
                school_table: Updateable<SchemaWrite.SchoolTable>
                school_feature_table: Updateable<SchemaWrite.SchoolFeatureTable>
                locality_table: Updateable<SchemaWrite.LocalityTable>
            }
        })
    writeFileSync(
        './src/resource/australia-schools.json',
        JSON.stringify(transformedSchoolsData, null, 4),
    )
    console.info('Completed writing "australia-schools.json"')
    console.info('Extracted schools:', transformedSchoolsData.length, '\n')

    return transformedSchoolsData
}

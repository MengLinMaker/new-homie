import _australiaSchools from './resource/australia-schools.json' with { type: 'json' }
import _australiaLocalities from './resource/australia-localities.json' with { type: 'json' }
import type { Selectable, Updateable } from 'kysely'
import type { SchemaWrite } from '@service-scrape/lib-db_service_scrape'
import z from 'zod'
import { toUpperCaseWords } from './util.ts'
import { stateAbbreviationEnumSchema } from '@service-scrape/lib-db_service_scrape/zod'

export const localitySchema = z.object({
    suburb_name: z.string().transform(toUpperCaseWords),
    state_abbreviation: stateAbbreviationEnumSchema,
    postcode: z.string().length(4).regex(/^\d+$/),
})

export interface Locality extends z.output<typeof localitySchema> {}

export const australiaLocalities = _australiaLocalities as Omit<
    Selectable<SchemaWrite.LocalityTable>,
    'boundary_coordinates' | 'id'
>[]

export const australiaSchools = _australiaSchools as {
    school_table: Updateable<SchemaWrite.SchoolTable>
    school_feature_table: Updateable<SchemaWrite.SchoolFeatureTable>
    locality_table: Updateable<SchemaWrite.LocalityTable>
}[]

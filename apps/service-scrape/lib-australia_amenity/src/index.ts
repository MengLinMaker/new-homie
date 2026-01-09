import _australiaSchools from './resource/australia-schools.json' with { type: 'json' }
import _australiaLocalities from './resource/australia-localities.json' with { type: 'json' }
import _targetLocalities from './resource/target-localities.json' with { type: 'json' }
import type { RemoveTableIds, SchemaWrite } from '@service-scrape/lib-db_service_scrape'
import z from 'zod'
import { toUpperCaseWords } from './util.ts'
import { stateAbbreviationEnumSchema } from '@service-scrape/lib-db_service_scrape/zod'

export const localitySchema = z.object({
    suburb_name: z.string().transform(toUpperCaseWords),
    state_abbreviation: stateAbbreviationEnumSchema,
    postcode: z.string().length(4).regex(/^\d+$/),
})

export interface Locality extends z.output<typeof localitySchema> {}

export const australiaLocalities = _australiaLocalities as Locality[]
export const targetLocalities = _targetLocalities as Locality[]

export const australiaSchools = _australiaSchools as {
    school_table: RemoveTableIds<SchemaWrite.SchoolTable>
    school_feature_table: RemoveTableIds<SchemaWrite.SchoolFeatureTable>
    locality_table: Locality
}[]

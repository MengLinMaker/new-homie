import _australiaSchools from './resource/australia-schools.json'
import _australiaLocalities from './resource/australia-localities.json'
import type { Updateable } from 'kysely'
import type { Schema } from '@service-scrape/lib-db_service_scrape'

export const australiaLocalities = _australiaLocalities as Updateable<Schema.LocalityTable>[]

export const australiaSchools = _australiaSchools as {
    school_table: Updateable<Schema.SchoolTable>
    school_feature_table: Updateable<Schema.SchoolFeatureTable>
    locality_table: Updateable<Schema.LocalityTable>
}[]

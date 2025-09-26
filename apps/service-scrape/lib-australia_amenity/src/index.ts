import _australiaSchools from './resource/australia-schools.json'
import _australiaLocalities from './resource/australia-localities.json'
import type { Updateable } from 'kysely'
import type { SchemaWrite } from '@service-scrape/lib-db_service_scrape'

export const australiaLocalities = _australiaLocalities as Updateable<SchemaWrite.LocalityTable>[]

export const australiaSchools = _australiaSchools as {
    school_table: Updateable<SchemaWrite.SchoolTable>
    school_feature_table: Updateable<SchemaWrite.SchoolFeatureTable>
    locality_table: Updateable<SchemaWrite.LocalityTable>
}[]

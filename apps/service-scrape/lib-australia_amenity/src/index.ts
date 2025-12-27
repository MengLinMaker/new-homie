import _australiaSchools from './resource/australia-schools.json'
import _australiaLocalities from './resource/australia-localities.json'
import type { Selectable, Updateable } from 'kysely'
import type { SchemaWrite } from '@service-scrape/lib-db_service_scrape'

export const australiaLocalities = _australiaLocalities as Omit<
    Selectable<SchemaWrite.LocalityTable>,
    'boundary_coordinates' | 'id'
>[]

export const australiaSchools = _australiaSchools as {
    school_table: Updateable<SchemaWrite.SchoolTable>
    school_feature_table: Updateable<SchemaWrite.SchoolFeatureTable>
    locality_table: Updateable<SchemaWrite.LocalityTable>
}[]

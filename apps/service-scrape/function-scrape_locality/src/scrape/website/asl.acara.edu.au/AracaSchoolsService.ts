import { australiaSchools } from '@service-scrape/lib-australia_amenity'
import type { Updateable } from 'kysely'
import type { SchemaWrite } from '@service-scrape/lib-db_service_scrape'
import { ILoggable } from '@observability/lib-opentelemetry'
import { Locality } from '../../global'

export class AracaSchoolsService extends ILoggable {
    /**
     * Fetches schools based on locality data.
     * @param args locality data
     */
    getSchools(args: Locality) {
        const filteredSchools = australiaSchools.filter((school) => {
            const l = school.locality_table
            school.school_feature_table
            return (
                l.suburb_name?.toLowerCase() === args.suburb_name.toLowerCase() &&
                l.state_abbreviation?.toLowerCase() === args.state_abbreviation.toLowerCase() &&
                l.postcode === args.postcode
            )
        })

        return filteredSchools.map((school) => {
            return {
                school_feature_table: school.school_feature_table,
                school_table: school.school_table,
            } satisfies {
                school_feature_table: Updateable<SchemaWrite.SchoolFeatureTable>
                school_table: Updateable<SchemaWrite.SchoolTable>
            }
        })
    }
}

import { australiaSchools, type Locality } from '@service-scrape/lib-australia_amenity'
import { ILoggable } from '@observability/lib-opentelemetry'

export class AracaSchoolsService extends ILoggable {
    /**
     * Fetches schools based on locality data.
     * @param args locality data
     */
    getSchools = (args: Locality) =>
        australiaSchools.filter((school) => {
            const l = school.locality_table
            return (
                l.suburb_name === args.suburb_name &&
                l.state_abbreviation === args.state_abbreviation &&
                l.postcode === args.postcode
            )
        })
}

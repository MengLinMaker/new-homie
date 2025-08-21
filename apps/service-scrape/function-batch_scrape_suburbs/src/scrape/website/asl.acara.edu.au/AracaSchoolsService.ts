import { ILoggable } from '../../../base/ILoggable'
import { australiaSchools } from '@service-scrape/lib-australia_amenity'

export class AracaSchoolsService extends ILoggable {
    /**
     * Fetches schools based on locality data.
     * @param args locality data
     */
    getSchools(args: { suburb: string; state: string; postcode: string }) {
        this.log(
            'debug',
            this.getSchools,
            `Fetching schools for suburb: ${args.suburb}, state: ${args.state}, postcode: ${args.postcode}`,
        )
        const filteredSchools = australiaSchools.filter((school) => {
            const l = school.locality_table
            school.school_feature_table
            return (
                l.suburb_name?.toLowerCase() === args.suburb.toLowerCase() &&
                l.state_abbreviation?.toLowerCase() === args.state.toLowerCase() &&
                l.postcode === args.postcode
            )
        })

        return filteredSchools.map((school) => {
            return {
                school_feature_table: school.school_feature_table,
                school_table: school,
            }
        })
    }
}

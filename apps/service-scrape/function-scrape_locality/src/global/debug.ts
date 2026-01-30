import type { Locality } from '@service-scrape/lib-australia_amenity'

export const localityString = (locality: Locality) =>
    `${locality.suburb_name}-${locality.state_abbreviation}-${locality.postcode}`
        .replaceAll(' ', '-')
        .toLowerCase()

/**
 * For debug loggin purposes
 */
export const CURRENT_LOCALITY = {
    locality: {
        suburb_name: '',
        state_abbreviation: '',
        postcode: '',
    },
    localityUrl: '',
    saleUrl: '',
    rentUrl: '',
}

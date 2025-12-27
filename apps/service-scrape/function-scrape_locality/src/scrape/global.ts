export const localityArgs = {
    suburb_name: process.env['suburb_name'],
    state_abbreviation: process.env['state_abbreviation'],
    postcode: process.env['postcode'],
}
export const urlArgs =
    `https://www.domain.com.au/suburb-profile/${localityArgs.suburb_name}-${localityArgs.state_abbreviation}-${localityArgs.postcode}`
        .replaceAll(' ', '-')
        .toLowerCase()

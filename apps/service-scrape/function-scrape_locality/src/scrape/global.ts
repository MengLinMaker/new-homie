import z from 'zod'

export const localitySchema = z.object({
    suburb_name: z.string(),
    state_abbreviation: z.enum(['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA']),
    postcode: z.string().length(4).regex(/^\d+$/),
})

export interface Locality extends z.output<typeof localitySchema> {}

export const localityArgs = {
    suburb_name: process.env['suburb_name'],
    state_abbreviation: process.env['state_abbreviation'],
    postcode: process.env['postcode'],
}
export const urlArgs =
    `https://www.domain.com.au/suburb-profile/${localityArgs.suburb_name}-${localityArgs.state_abbreviation}-${localityArgs.postcode}`
        .replaceAll(' ', '-')
        .toLowerCase()

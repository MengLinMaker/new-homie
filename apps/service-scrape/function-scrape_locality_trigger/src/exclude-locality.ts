/**
 * Localities to exclude from scraping - does not exist
 */
const excludeLocality = [
    {
        suburb_name: 'Tarneit North',
        state_abbreviation: 'VIC',
        postcode: '3029',
    },
    // {
    //     suburb_name: 'Highett',
    //     state_abbreviation: 'VIC',
    //     postcode: '3190',
    // },
    {
        suburb_name: 'Cranbourne East',
        state_abbreviation: 'VIC',
        postcode: '3978',
    },
    {
        suburb_name: 'Geelong',
        state_abbreviation: 'VIC',
        postcode: '3219',
    },
    {
        suburb_name: 'Burwood',
        state_abbreviation: 'VIC',
        postcode: '3151',
    },
    {
        suburb_name: 'Parkville',
        state_abbreviation: 'VIC',
        postcode: '3031',
    },
    {
        suburb_name: 'Reservoir East',
        state_abbreviation: 'VIC',
        postcode: '3083',
    },
    {
        suburb_name: 'Bennettswood',
        state_abbreviation: 'VIC',
        postcode: '3125',
    },
    {
        suburb_name: 'Richmond',
        state_abbreviation: 'VIC',
        postcode: '3058',
    },
    {
        suburb_name: 'East Bentleigh',
        state_abbreviation: 'VIC',
        postcode: '3165',
    },
    {
        suburb_name: 'Frankston East',
        state_abbreviation: 'VIC',
        postcode: '3199',
    },
    {
        suburb_name: 'Southbank',
        state_abbreviation: 'VIC',
        postcode: '3205',
    },
    {
        suburb_name: 'Caulfield',
        state_abbreviation: 'VIC',
        postcode: '3161',
    },
    {
        suburb_name: 'North Geelong',
        state_abbreviation: 'VIC',
        postcode: '3214',
    },
    {
        suburb_name: 'Springvale',
        state_abbreviation: 'VIC',
        postcode: '3177',
    },
    {
        suburb_name: 'Reservoir',
        state_abbreviation: 'VIC',
        postcode: '3754',
    },
    {
        suburb_name: 'South Morang',
        state_abbreviation: 'VIC',
        postcode: '3754',
    },
    {
        suburb_name: 'East Preston',
        state_abbreviation: 'VIC',
        postcode: '3072',
    },
    // {
    //     suburb_name: 'Park Orchards',
    //     state_abbreviation: 'VIC',
    //     postcode: '3114',
    // },
    {
        suburb_name: 'Kurunjang',
        state_abbreviation: 'VIC',
        postcode: '3337',
    },
    {
        suburb_name: 'South Morang',
        state_abbreviation: 'VIC',
        postcode: '3076',
    },
    {
        suburb_name: 'Beveridge',
        state_abbreviation: 'VIC',
        postcode: '3012',
    },
    {
        suburb_name: 'Brunswick South',
        state_abbreviation: 'VIC',
        postcode: '3055',
    },
    {
        suburb_name: 'Werribee',
        state_abbreviation: 'VIC',
        postcode: '3024',
    },
    {
        suburb_name: 'Balwyn',
        state_abbreviation: 'VIC',
        postcode: '3101',
    },
    // {
    //     suburb_name: 'Geelong East',
    //     state_abbreviation: 'VIC',
    //     postcode: '3219',
    // },
    {
        suburb_name: 'Prahan',
        state_abbreviation: 'VIC',
        postcode: '3181',
    },
    {
        suburb_name: 'West Melbourne',
        state_abbreviation: 'VIC',
        postcode: '3003',
    },
    {
        suburb_name: 'Moreland',
        state_abbreviation: 'VIC',
        postcode: '3058',
    },
    {
        suburb_name: 'St Kilda',
        state_abbreviation: 'VIC',
        postcode: '3181',
    },
    {
        suburb_name: 'Albert Park',
        state_abbreviation: 'VIC',
        postcode: '3134',
    },
    {
        suburb_name: 'Fawkner',
        state_abbreviation: 'VIC',
        postcode: '3064',
    },
    {
        suburb_name: 'Melton',
        state_abbreviation: 'VIC',
        postcode: '3338',
    },
    {
        suburb_name: 'South Yarra',
        state_abbreviation: 'VIC',
        postcode: '3182',
    },
    // {
    //     suburb_name: 'Lara',
    //     state_abbreviation: 'VIC',
    //     postcode: '3212',
    // },
    {
        suburb_name: 'Lara Lake',
        state_abbreviation: 'VIC',
        postcode: '3212',
    },
    {
        suburb_name: 'Donvale',
        state_abbreviation: 'VIC',
        postcode: '3134',
    },
    {
        suburb_name: 'West Heidelberg',
        state_abbreviation: 'VIC',
        postcode: '3081',
    },
    {
        suburb_name: 'Lower Templestowe',
        state_abbreviation: 'VIC',
        postcode: '3107',
    },
    {
        suburb_name: 'Macleod West',
        state_abbreviation: 'VIC',
        postcode: '3085',
    },
    {
        suburb_name: 'Preston East',
        state_abbreviation: 'VIC',
        postcode: '3076',
    },
    {
        suburb_name: 'Epping',
        state_abbreviation: 'VIC',
        postcode: '3082',
    },
    {
        suburb_name: 'Beveridge',
        state_abbreviation: 'VIC',
        postcode: '3754',
    },
    {
        suburb_name: 'Kew East',
        state_abbreviation: 'VIC',
        postcode: '3101',
    },
    {
        suburb_name: 'Armstrong Creek',
        state_abbreviation: 'VIC',
        postcode: '3217',
    },
    {
        suburb_name: 'Tarneit',
        state_abbreviation: 'VIC',
        postcode: '3039',
    },
    {
        suburb_name: 'Albert Park',
        state_abbreviation: 'VIC',
        postcode: '3207',
    },
]

export const excludeLocalitySet = new Set(
    excludeLocality.map((locality) => JSON.stringify(locality)),
)

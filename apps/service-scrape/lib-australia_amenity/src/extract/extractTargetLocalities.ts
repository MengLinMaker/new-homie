import type { extractAcaraSchools } from './extractAcaraSchools.ts'
import type { extractAusPostLocalities } from './extractAusPostLocalities.ts'
import type { Locality } from '../index.ts'
import { writeFileSync } from 'node:fs'

const setMap = <V>(map: Map<string, V>, value: V) => map.set(JSON.stringify(value), value)

const nonExistentLocalities = new Map<string, Locality>()
{
    const localities = [
        { suburb_name: 'Bendigo', state_abbreviation: 'VIC', postcode: '3552' },
        { suburb_name: 'Brunswick South', state_abbreviation: 'VIC', postcode: '3055' },
        { suburb_name: 'Frankston East', state_abbreviation: 'VIC', postcode: '3199' },
        { suburb_name: 'Horsham', state_abbreviation: 'VIC', postcode: '3402' },
        { suburb_name: 'Kyabram', state_abbreviation: 'VIC', postcode: '3619' },
        { suburb_name: 'Shepparton', state_abbreviation: 'VIC', postcode: '3632' },
        { suburb_name: 'Seymour', state_abbreviation: 'VIC', postcode: '3661' },
        { suburb_name: 'Myrtleford', state_abbreviation: 'VIC', postcode: '3736' },
        { suburb_name: 'Moreland', state_abbreviation: 'VIC', postcode: '3058' },
        { suburb_name: 'Mildura', state_abbreviation: 'VIC', postcode: '3502' },
        { suburb_name: 'Mildura South', state_abbreviation: 'VIC', postcode: '3501' },
        { suburb_name: 'Mansfield', state_abbreviation: 'VIC', postcode: '3724' },
        { suburb_name: 'Macleod West', state_abbreviation: 'VIC', postcode: '3085' },
        { suburb_name: 'Wangaratta', state_abbreviation: 'VIC', postcode: '3676' },
        { suburb_name: 'Wodonga', state_abbreviation: 'VIC', postcode: '3689' },
    ]
    localities.map((e) => setMap(nonExistentLocalities, e))
}

/**
 * Identify localities with amenities
 */
export const extractTargetLocalities = (args: {
    localities: Awaited<ReturnType<typeof extractAusPostLocalities>>
    schools: ReturnType<typeof extractAcaraSchools>
}) => {
    const filteredLocalities = new Map<string, Locality>()

    const schoolLocalities = new Map<string, Locality>()
    args.schools.map((e) => setMap(schoolLocalities, e.locality_table))
    console.log('Number of schoolLocalities:', schoolLocalities.size)

    for (const [_, locality] of args.localities.entries()) {
        const key = JSON.stringify(locality)
        if (!schoolLocalities.has(key) || nonExistentLocalities.has(key)) continue
        setMap(filteredLocalities, locality)
    }

    writeFileSync(
        './src/resource/target-localities.json',
        JSON.stringify(Array.from(filteredLocalities.values()), null, 4),
    )
    console.info('Completed writing "target-localities.json"')
    console.info('Extracted target localities:', filteredLocalities.size, '\n')

    return filteredLocalities
}

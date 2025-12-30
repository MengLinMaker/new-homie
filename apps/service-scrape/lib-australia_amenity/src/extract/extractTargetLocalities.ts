import type { extractAcaraSchools } from './extractAcaraSchools.ts'
import type { extractAusPostLocalities } from './extractAusPostLocalities.ts'
import type { Locality } from '../index.ts'
import { writeFileSync } from 'node:fs'

const setMap = <V>(map: Map<string, V>, value: V) => map.set(JSON.stringify(value), value)

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
        if (!schoolLocalities.has(key)) continue
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

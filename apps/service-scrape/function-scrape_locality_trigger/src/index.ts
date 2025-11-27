/** biome-ignore-all lint/style/noNonNullAssertion: <assume exists> */
import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { excludeLocalitySet } from './exclude-locality'

// Setup OpenTelemetry and connections
import { LOGGER } from './global/setup'
import { metroPostcode } from './metro-postcodes'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

import { Resource } from 'sst'
import { task } from 'sst/aws/task'

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const filteredLocality = australiaLocalities.filter((locality) => {
        if (!locality.postcode) return false
        if (excludeLocalitySet.has(JSON.stringify(locality))) return false
        const postcode = parseInt(locality.postcode, 10)
        return metroPostcode.VIC.includes(postcode)
    })
    for (const locality of filteredLocality) {
        await task.run(
            // @ts-ignore somehow not defined
            Resource.ScrapeLocalityTask,
            {
                suburb_name: locality.suburb_name!,
                state_abbreviation: locality.state_abbreviation!,
                postcode: locality.postcode!,
            },
            { capacity: 'fargate' },
        )
    }

    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})

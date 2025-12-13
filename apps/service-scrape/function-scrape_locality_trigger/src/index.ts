/** biome-ignore-all lint/style/noNonNullAssertion: <assume exists> */
import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { excludeLocalitySet } from './exclude-locality'

// Setup OpenTelemetry and connections
import { LOGGER } from './global/setup'
import { metroPostcode } from './metro-postcodes'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

import { BatchClient, SubmitJobCommand } from '@aws-sdk/client-batch'
import { ENV } from './global/env'

const batchClient = new BatchClient()

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const filteredLocality = australiaLocalities
        .filter((locality) => {
            if (!locality.postcode) return false
            if (excludeLocalitySet.has(JSON.stringify(locality))) return false
            const postcode = parseInt(locality.postcode, 10)
            return metroPostcode.VIC.includes(postcode)
        })
        // TODO: remove temp test code
        .slice(5)

    for (const locality of filteredLocality) {
        const newLocality = {
            suburb_name: locality.suburb_name!,
            state_abbreviation: locality.state_abbreviation!,
            postcode: locality.postcode!,
        }
        await batchClient.send(
            new SubmitJobCommand({
                jobName:
                    `${locality.suburb_name}-${locality.state_abbreviation}-${locality.postcode}`
                        .toLowerCase()
                        .replaceAll(' ', '-'),
                jobQueue: ENV.JOB_QUEUE_ARN,
                jobDefinition: ENV.JOB_DEFINITION_ARN,
                parameters: newLocality,
                tags: newLocality,
            }),
        )
    }

    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})

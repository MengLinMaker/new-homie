/** biome-ignore-all lint/style/noNonNullAssertion: <assume exists> */
import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { targetLocalities } from '@service-scrape/lib-australia_amenity'

// Setup OpenTelemetry and connections
import { LOGGER } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

import { ENV } from './global/env'
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'

/**
 * Split single array into multiple small arrays of max chunk size
 */
const chunkArray = <T>(original: T[], chunkSize: number) => {
    const chunkedArray: T[][] = []
    for (let i = 0; i < original.length; i += chunkSize) {
        chunkedArray.push(original.slice(i, i + chunkSize))
    }
    return chunkedArray
}

const sfnClient = new SFNClient()
const CHUNK_SIZE = 6

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const filteredLocality = targetLocalities.filter((locality) => {
        return locality.state_abbreviation === 'VIC'
    })
    const chunkedFilteredLocality = chunkArray(filteredLocality, CHUNK_SIZE)

    await sfnClient.send(
        new StartExecutionCommand({
            stateMachineArn: ENV.STEP_FUNCTION_ARN,
            input: JSON.stringify(chunkedFilteredLocality),
        }),
    )

    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})

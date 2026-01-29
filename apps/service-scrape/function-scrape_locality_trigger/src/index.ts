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
const CHUNK_SIZE = 24

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const filteredLocality = targetLocalities
    const chunkedFilteredLocality = chunkArray(filteredLocality, CHUNK_SIZE)

    // Limit data chunk size to 256kb for step functions - https://aws.amazon.com/about-aws/whats-new/2020/09/aws-step-functions-increases-payload-size-to-256kb/
    const wholeData = JSON.stringify(chunkedFilteredLocality)
    const dataSize = new Blob([wholeData]).size
    const requiredBatches = Math.ceil(dataSize / 200000)
    const batchChunkLength = Math.ceil(chunkedFilteredLocality.length / requiredBatches)

    console.info(`Trigger to scrape ${filteredLocality.length} localities - ${dataSize} bytes`)
    console.info(
        `Sending ${requiredBatches} batches - ${batchChunkLength} locality chunks of size ${CHUNK_SIZE}`,
    )

    for (let i = 0; i < chunkedFilteredLocality.length; i += batchChunkLength) {
        const batchData = chunkedFilteredLocality.slice(i, i + batchChunkLength)
        await sfnClient.send(
            new StartExecutionCommand({
                stateMachineArn: ENV.STEP_FUNCTION_ARN,
                input: JSON.stringify(batchData),
            }),
        )
    }

    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})

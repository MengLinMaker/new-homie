/** biome-ignore-all lint/style/noNonNullAssertion: <assume exists> */
import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { targetLocalities } from '@service-scrape/lib-australia_amenity'

// Setup OpenTelemetry and connections
import { LOGGER } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

import { ENV } from './global/env'
import { SFNClient, StartExecutionCommand } from '@aws-sdk/client-sfn'

const sfnClient = new SFNClient()

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    const filteredLocality = targetLocalities.filter((locality) => {
        return locality.state_abbreviation === 'VIC'
    })

    await sfnClient.send(
        new StartExecutionCommand({
            stateMachineArn: ENV.STEP_FUNCTION_ARN,
            input: JSON.stringify(filteredLocality.slice(0, 1)),
        }),
    )

    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})

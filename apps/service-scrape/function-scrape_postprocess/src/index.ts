/** biome-ignore-all lint/style/noNonNullAssertion: <assume exists> */
import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

// Setup OpenTelemetry and connections
import { LOGGER, postprocessController } from './global/setup'
import { FunctionHandlerLogger } from '@observability/lib-opentelemetry'

export const handler = middy().handler(async (_event, _context) => {
    const functionHandlerLogger = new FunctionHandlerLogger(LOGGER)

    await postprocessController.refreshLatestSaleMV()
    await postprocessController.refreshLatestRentMV()
    await postprocessController.vacuumAnalyse()

    functionHandlerLogger.recordEnd()
    return { status: StatusCodes.OK }
})

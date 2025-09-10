import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { validatorMiddleware } from './global/middleware'
import { chunkArray } from './util'
import { ENV } from './global/env'

// Setup OpenTelemetry and connections
import { LOGGER, SERVICE_NAME, sqsClient, TRACER } from './global/setup'
import { SendMessageBatchCommand } from '@aws-sdk/client-sqs'
import { enforceErrorType, spanExceptionEnd } from '@observability/lib-opentelemetry'

export const handler = middy()
    .use(validatorMiddleware)
    .handler(async (event, _context) => {
        const span = TRACER.startSpan('handler')
        if (!event.success) throw spanExceptionEnd(span, `FATAL ${SERVICE_NAME} validation error`)

        const filteredLocality = australiaLocalities.filter((locality) => {
            if (!locality.postcode) return false
            const postcode = parseInt(locality.postcode, 10)
            return postcode >= 3170 && postcode <= 3180
        })

        for (const chunkLocality of chunkArray(filteredLocality, 10)) {
            try {
                await sqsClient.send(
                    new SendMessageBatchCommand({
                        QueueUrl: ENV.QUEUE_URL,
                        Entries: chunkLocality.map((locality, id) => ({
                            Id: id.toString(),
                            MessageGroupId: id.toString(),
                            MessageBody: JSON.stringify(locality),
                        })),
                    }),
                )
            } catch (e) {
                throw spanExceptionEnd(span, enforceErrorType(e))
            }
        }

        LOGGER.info({
            localityLength: filteredLocality.length,
        })
        span.end()
        return { status: StatusCodes.OK }
    })

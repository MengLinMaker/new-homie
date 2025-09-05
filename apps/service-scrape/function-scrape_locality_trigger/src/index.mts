import { StatusCodes } from 'http-status-codes'
import middy from '@middy/core'

import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { LOGGER, otelException } from '@observability/lib-opentelemetry'
import { tracerMiddleware, validatorMiddleware } from './global/middleware'
import { chunkArray } from './util'
import { ENV } from './global/env'

// Setup OpenTelemetry and connections
import './global/setup'
import { sqsClient } from './global/setup'
import { SendMessageBatchCommand } from '@aws-sdk/client-sqs'

export const handler = middy()
    .use(validatorMiddleware)
    .use(tracerMiddleware)
    .handler(async (event, _context) => {
        if (!event.success) {
            LOGGER.fatal({
                args: event.originalEvent,
                ...otelException(event.error),
            })
            return { status: StatusCodes.BAD_REQUEST }
        }
        event.data

        const filteredLocality = australiaLocalities.filter((locality) => {
            return (
                locality.suburb_name === 'Dandenong' &&
                locality.state_abbreviation === 'VIC' &&
                locality.postcode === '3175'
            )
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
                const formattedError = otelException(e)
                LOGGER.fatal(formattedError)
                return { status: StatusCodes.INTERNAL_SERVER_ERROR }
            }
        }

        LOGGER.info({
            localityLength: filteredLocality.length,
        })
        return { status: StatusCodes.OK }
    })

import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'
import { otel } from '@hono/otel'
import { StatusCodes } from 'http-status-codes'
import { australiaLocalities } from '@service-scrape/lib-australia_amenity'
import { sqsClient } from './global/setup'
import { SendMessageBatchCommand } from '@aws-sdk/client-sqs'

import { ENV } from './global/env'
import { chunkArray } from './util'

// Setup OpenTelemetry and connections
import './global/setup'
import { LOGGER, otelException } from '@observability/lib-opentelemetry'

// Middlewares
const app = new Hono().use(requestId()).use('*', otel())

// Routes
app.get('/', async (c) => {
    const filteredLocality = australiaLocalities.filter((locality) => {
        return locality.postcode === '3175'
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
            throw e
        }
    }

    return c.json(
        {
            status: 'Success',
            localityCount: filteredLocality.length,
        },
        StatusCodes.OK,
    )
})

// Test route for specific locality
app.get('/test', async (c) => {
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
            throw e
        }
    }

    return c.json(
        {
            status: 'Success',
            localityCount: filteredLocality.length,
        },
        StatusCodes.OK,
    )
})

// Enable AWS Lambda
export const handler = handle(app)

import { Hono } from 'hono'
import { handle } from 'hono/aws-lambda'
import { requestId } from 'hono/request-id'
import { prettyJSON } from 'hono/pretty-json'
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
const app = new Hono().use(requestId()).use('*', otel()).use('*', prettyJSON())

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
                        MessageBody: JSON.stringify(locality),
                    })),
                }),
            )
        } catch (e) {
            LOGGER.fatal(otelException(e))
        }
    }

    return c.body('', StatusCodes.OK)
})

// Enable AWS Lambda
export const handler = handle(app)

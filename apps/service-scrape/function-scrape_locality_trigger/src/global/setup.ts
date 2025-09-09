import { OpenTelemetry } from '@observability/lib-opentelemetry'
import { SQSClient } from '@aws-sdk/client-sqs'

export const SERVICE_NAME = 'function-scrape_locality_trigger'

const otel = new OpenTelemetry()
export const { LOGGER, TRACER } = await otel.start({
    'service.name': SERVICE_NAME,
})

export const sqsClient = new SQSClient()

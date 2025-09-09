import { OpenTelemetry } from '@observability/lib-opentelemetry'
import { SQSClient } from '@aws-sdk/client-sqs'

export const SERVICE_NAME = 'function-scrape_locality_trigger'

const otel = new OpenTelemetry()
export const { LOGGER, TRACER } = otel.start({
    'service.name': SERVICE_NAME,
})

const awsClientConfig: {
    endpoint?: string
} = {}
const endpoint = process.env['AWS_ENDPOINT_URL']
if (endpoint) awsClientConfig.endpoint = endpoint

export const sqsClient = new SQSClient(awsClientConfig)

import { OpenTelemetry } from '@observability/lib-opentelemetry'
import { SQSClient } from '@aws-sdk/client-sqs'
import { ENV } from './env'

export const SERVICE_NAME = 'function-scrape_locality_trigger'

const otel = new OpenTelemetry()
export const { LOGGER, TRACER } = await otel.start({
    'service.name': SERVICE_NAME,
})

const awsClientConfig = {
    endpoint: ENV.AWS_ENDPOINT_URL,
    region: ENV.AWS_REGION,
    credentials: {
        secretAccessKey: ENV.AWS_SECRET_ACCESS_KEY,
        accessKeyId: ENV.AWS_ACCESS_KEY_ID,
    },
} as {
    endpoint?: string
    region?: string
    credentials: {
        secretAccessKey: string
        accessKeyId: string
    }
}

export const sqsClient = new SQSClient(awsClientConfig)

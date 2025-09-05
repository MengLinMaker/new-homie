import { startOpenTelemetry } from '@observability/lib-opentelemetry'
import { SQSClient } from '@aws-sdk/client-sqs'

const SERVICE_NAME = 'function-scrape_locality'

startOpenTelemetry(SERVICE_NAME)

export const sqsClient = new SQSClient()

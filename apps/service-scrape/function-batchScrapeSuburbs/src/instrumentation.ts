import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { Resource } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { ENV } from './env'

const serviceName = 'function-batchScrapeSuburbs'

const headers: Record<string, string> = {}
ENV.OLTP_HEADERS.split(', ').map((header) => {
  const [key, val] = header.split(': ')
  if (key && val) headers[key] = val
})

const traceExporter = new OTLPTraceExporter({
  url: ENV.OLTP_URL,
  headers: headers,
})

const sdk = new NodeSDK({
  spanProcessor: new BatchSpanProcessor(traceExporter),
  resource: new Resource({
    [ATTR_SERVICE_NAME]: serviceName,
  }),
  instrumentations: [getNodeAutoInstrumentations()],
})
sdk.start()

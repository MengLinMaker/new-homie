import { pino } from 'pino'
import { NodeSDK, tracing, logs, api } from '@opentelemetry/sdk-node'
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino'

const sdk = new NodeSDK({
  spanProcessor: new tracing.SimpleSpanProcessor(new tracing.ConsoleSpanExporter()),
  logRecordProcessor: new logs.SimpleLogRecordProcessor(new logs.ConsoleLogRecordExporter()),
  instrumentations: [
    new PinoInstrumentation({
      logHook: (_span, record) => {
        record['resource.service.name'] = 'function-batchScrapeSuburbs'
      },
    }),
  ],
})
sdk.start()

/**
 * @description Distributed OpenTelemetry logger
 */
export const logger = pino(
  pino.transport({
    targets: [
      {
        target: 'pino-pretty',
      },
    ],
  }),
)
export const tracer = api.trace.getTracer('')

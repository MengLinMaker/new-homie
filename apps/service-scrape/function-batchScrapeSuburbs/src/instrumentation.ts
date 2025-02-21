import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'

import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions'
import { Resource } from '@opentelemetry/resources'
import { NodeSDK } from '@opentelemetry/sdk-node'
import { SpanStatusCode, trace } from '@opentelemetry/api'

import { ENV } from './env'

const SERVICE_NAME = 'function-batchScrapeSuburbs'

const OLTP_HEADERS: Record<string, string> = {}
ENV.OLTP_HEADERS.split(', ').map((header) => {
  const [key, val] = header.split(': ')
  if (key && val) OLTP_HEADERS[key] = val
})

// Auto detect trace spans
const sdk = new NodeSDK({
  autoDetectResources: false, // Disable useless process info
  serviceName: SERVICE_NAME,
  spanProcessor: new SimpleSpanProcessor(
    new OTLPTraceExporter({
      url: `${ENV.OLTP_BASE_URL}traces`,
      headers: OLTP_HEADERS,
    }),
  ),
})
sdk.start()

// Separate log setup for log levels
const logProvider = new LoggerProvider({
  resource: new Resource({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
  }),
})
logProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(
    new OTLPLogExporter({
      url: `${ENV.OLTP_BASE_URL}logs`,
      headers: OLTP_HEADERS,
    }),
  ),
)
export const logger = logProvider.getLogger(SERVICE_NAME)

const tracer = trace.getTracer(SERVICE_NAME)

/**
 * @description Adds tracing to lambda function with success indicator
 * @param functionName
 * @param arguments 'arguments' object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
 * @param errorLogLevel
 * @param callback
 */
export const traceTryFunction = async <T>(
  functionName: string,
  _arguments: IArguments,
  errorLogLevel: 'WARN' | 'ERROR' | 'FATAL',
  callback: () => Promise<T>,
): Promise<[value: T, success: true] | [value: null, success: false]> => {
  return await new Promise((resolve, _reject) => {
    // Only tracer.startActiveSpan callback creates child span
    tracer.startActiveSpan(functionName, async (span) => {
      // Catch errors to ensure trace logs are always sent
      try {
        const value = await callback()
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        resolve([value, true])
      } catch (e) {
        const error =
          e instanceof Error
            ? e
            : Error(
                'Non-error exception: "https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript"',
              )
        logger.emit({
          severityText: errorLogLevel,
          body: error.stack,
          attributes: {
            'code.function.name': functionName,
            'code.function.arguments': JSON.stringify(Object.values(_arguments)),
            'error.message': error.message,
          },
        })
        span.setStatus({ code: SpanStatusCode.ERROR })
        span.end()
        resolve([null, false])
      }
    })
  })
}

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { MeterProvider, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { HostMetrics } from '@opentelemetry/host-metrics'
import { ENV } from './env'
import { SpanStatusCode, trace } from '@opentelemetry/api'

const SERVICE_NAME = 'function-batchScrapeSuburbs'

const OLTP_HEADERS: Record<string, string> = {}
ENV.OLTP_HEADERS.split(', ').map((header) => {
  const [key, val] = header.split(': ')
  if (key && val) OLTP_HEADERS[key] = val
})

// Collect CPU and RAM load for system and process
const hostMetrics = new HostMetrics({
  meterProvider: new MeterProvider({
    readers: [
      new PeriodicExportingMetricReader({
        exportIntervalMillis: 5000,
        exporter: new OTLPMetricExporter({
          url: `${ENV.OLTP_BASE_URL}metrics`,
          headers: OLTP_HEADERS,
        }),
      }),
    ],
  }),
})
hostMetrics.start()

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
): Promise<[value: T | null, success: boolean]> => {
  return await new Promise((resolve, _reject) => {
    // Only tracer.startActiveSpan callback creates child span
    tracer.startActiveSpan(functionName, async (span) => {
      try {
        const value = await callback()
        span.setStatus({ code: SpanStatusCode.OK })
        span.end()
        resolve([value, true])
      } catch (e) {
        span.recordException(
          e instanceof Error // Not all exceptions are Error type
            ? e
            : Error(
                'Non-error exception: "https://kentcdodds.com/blog/get-a-catch-block-error-message-with-typescript"',
              ),
        )
        span.setAttributes({
          'log.level': errorLogLevel,
          'code.function.name': functionName,
          'code.function.arguments': JSON.stringify(Object.values(_arguments)),
        })
        span.setStatus({ code: SpanStatusCode.ERROR })
        span.end()
        resolve([null, false])
      }
    })
  })
}

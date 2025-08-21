import { NodeSDK } from '@opentelemetry/sdk-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import {
    ATTR_EXCEPTION_MESSAGE,
    ATTR_EXCEPTION_STACKTRACE,
    ATTR_EXCEPTION_TYPE,
    ATTR_SERVICE_NAME,
    ATTR_SERVICE_VERSION,
} from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

import { ENV } from './env'
import pino from 'pino'

const OLTP_HEADERS: Record<string, string> = {}
ENV.OLTP_HEADERS.split(', ').forEach((header) => {
    const [key, val] = header.split(': ')
    if (key && val) OLTP_HEADERS[key] = val
})

export const SERVICE_NAME = 'function-batch_scrape_suburbs'

const sdk = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: SERVICE_NAME,
        [ATTR_SERVICE_VERSION]: '1.0',
    }),
    traceExporter: new OTLPTraceExporter({
        url: `${ENV.OLTP_BASE_URL}/v1/traces`,
        headers: OLTP_HEADERS,
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${ENV.OLTP_BASE_URL}/v1/metrics`,
            headers: OLTP_HEADERS,
        }),
    }),
    logRecordProcessors: [
        new SimpleLogRecordProcessor(
            new OTLPLogExporter({
                url: `${ENV.OLTP_BASE_URL}/v1/logs`,
                headers: OLTP_HEADERS,
            }),
        ),
    ],
    instrumentations: [getNodeAutoInstrumentations()],
    autoDetectResources: false,
})
sdk.start()

export const LOGGER = pino({
    level: ENV.LOG_LEVEL,
    transport: {
        target: 'pino-opentelemetry-transport',
    },
})

export const otelException = (e: Error) => {
    return {
        [ATTR_EXCEPTION_TYPE]: e.name,
        [ATTR_EXCEPTION_MESSAGE]: e.message,
        [ATTR_EXCEPTION_STACKTRACE]: e.stack,
    }
}

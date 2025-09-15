import { NodeSDK } from '@opentelemetry/sdk-node'
import { trace } from '@opentelemetry/api'
import { type LogAttributes, logs } from '@opentelemetry/api-logs'

import { type DetectedResourceAttributes, resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { ATTR_SERVICE_NAMESPACE } from '@opentelemetry/semantic-conventions/incubating'

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

import { ENV, type LogLevel } from './env.ts'
import { commitId } from './../dist/commitId.ts'
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base'

export type Logger = (level: LogLevel, attributes: LogAttributes, msg?: string) => void

interface InputResourceAttributes extends DetectedResourceAttributes {
    [ATTR_SERVICE_NAME]: string
}

interface MandatoryResourceAttributes extends InputResourceAttributes {
    [ATTR_SERVICE_NAMESPACE]: string
    [ATTR_SERVICE_VERSION]: string
}

// Headers need to be parsed into a record
const OLTP_HEADERS: Record<string, string> = {}
ENV.OTEL_EXPORTER_OTLP_HEADERS.split(', ').forEach((header) => {
    const [key, val] = header.split(': ')
    if (key && val) OLTP_HEADERS[key] = val
})

/**
 * Wrapper to setup OpenTelemetry SDK for Nodejs
 *
 * Note: requires otel env variables to be set
 * @requires OTEL_EXPORTER_OTLP_ENDPOINT
 * @requires OTEL_EXPORTER_OTLP_HEADERS
 * @requires OTEL_EXPORTER_OTLP_ENDPOINT
 *
 * @example
 * const attributes = {
 *     'service.name': 'lib-opentelemetry'
 * }
 * const otel = new OpenTelemetry()
 * const { LOGGER } = await otel.start(attributes)
 */
export class OpenTelemetry {
    private startAutoInstrumentation(attributes: MandatoryResourceAttributes) {
        const sdk = new NodeSDK({
            resource: resourceFromAttributes(attributes),
            spanProcessors: [
                new SimpleSpanProcessor(
                    new OTLPTraceExporter({
                        url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
                        headers: OLTP_HEADERS,
                    }),
                ),
            ],
            metricReader: new PeriodicExportingMetricReader({
                exporter: new OTLPMetricExporter({
                    url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/metrics`,
                    headers: OLTP_HEADERS,
                }),
            }),
            logRecordProcessors: [
                new SimpleLogRecordProcessor(
                    new OTLPLogExporter({
                        url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
                        headers: OLTP_HEADERS,
                    }),
                ),
            ],
            instrumentations: [getNodeAutoInstrumentations()],
            autoDetectResources: false,
        })
        sdk.start()
        return sdk
    }

    private createLogger(globalAttributes: MandatoryResourceAttributes) {
        const logger = logs.getLogger(
            globalAttributes[ATTR_SERVICE_NAME],
            globalAttributes[ATTR_SERVICE_VERSION],
            {
                scopeAttributes: globalAttributes as never,
            },
        )
        return (level: LogLevel, attributes: LogAttributes, msg?: string) =>
            logger.emit({
                severityText: level,
                attributes,
                body: msg,
            })
    }

    /**
     * Starts opentelemetry NodeSDK
     * @returns SDK - Otel NodeSDK
     * @returns LOGGER - pino logger
     * @returns TRACER - @opentelemetry/api tracer
     */
    public start(resourceAttributes: InputResourceAttributes) {
        const attributes = {
            [ATTR_SERVICE_NAMESPACE]: 'NewHomie',
            [ATTR_SERVICE_VERSION]: commitId,
            ...resourceAttributes,
        }
        return {
            SDK: this.startAutoInstrumentation(attributes),
            LOGGER: this.createLogger(attributes),
            TRACER: trace.getTracer(
                attributes[ATTR_SERVICE_NAME],
                attributes[ATTR_SERVICE_VERSION],
            ),
        }
    }
}

import { NodeSDK } from '@opentelemetry/sdk-node'
import { trace } from '@opentelemetry/api'

import { type DetectedResourceAttributes, resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

import pino from 'pino'
import 'pino-opentelemetry-transport'

import { ENV } from './env'
import { commitId } from './commitId'

interface ResourceAttributes extends DetectedResourceAttributes {
    [ATTR_SERVICE_NAME]: string
}

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
    /**
     *  Starts opentelemetry NodeSDK
     *  @returns TRACER - @opentelemetry/api tracer
     *  @returns LOGGER - pino logger
     */
    public async start(resourceAttributes: ResourceAttributes) {
        // Headers need to be parsed into a record
        const OLTP_HEADERS: Record<string, string> = {}
        ENV.OTEL_EXPORTER_OTLP_HEADERS.split(', ').forEach((header) => {
            const [key, val] = header.split(': ')
            if (key && val) OLTP_HEADERS[key] = val
        })
        const attributes = {
            [ATTR_SERVICE_VERSION]: commitId,
            ...resourceAttributes,
        }

        const sdk = new NodeSDK({
            resource: resourceFromAttributes(attributes),
            traceExporter: new OTLPTraceExporter({
                url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/traces`,
                headers: OLTP_HEADERS,
            }),
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
            autoDetectResources: true,
        })
        sdk.start()

        return {
            TRACER: trace.getTracer(attributes[ATTR_SERVICE_NAME]),
            LOGGER: pino(
                pino.transport({
                    level: ENV.OTEL_LOG_LEVEL,
                    target: 'pino-opentelemetry-transport',
                    options: {
                        loggerName: attributes[ATTR_SERVICE_NAME],
                        serviceVersion: attributes[ATTR_SERVICE_VERSION],
                        resourceAttributes: attributes,
                        logRecordProcessorOptions: [
                            {
                                recordProcessorType: 'simple',
                                exporterOptions: {
                                    protocol: 'http',
                                    httpExporterOptions: {
                                        url: `${ENV.OTEL_EXPORTER_OTLP_ENDPOINT}/v1/logs`,
                                        headers: OLTP_HEADERS,
                                    },
                                },
                            },
                        ],
                    },
                }),
            ),
        }
    }
}

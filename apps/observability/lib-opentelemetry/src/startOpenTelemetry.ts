import { NodeSDK } from '@opentelemetry/sdk-node'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'

import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics'
import { SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-proto'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'

import { ENV } from './util/env'
import { commitId } from './util/commitId'

export const startOpenTelemetry = (serviceName: string, serviceVersion: string = '') => {
    // Headers need to be parsed into a record
    const OLTP_HEADERS: Record<string, string> = {}
    ENV.OTEL_EXPORTER_OTLP_HEADERS.split(', ').forEach((header) => {
        const [key, val] = header.split(': ')
        if (key && val) OLTP_HEADERS[key] = val
    })

    const sdk = new NodeSDK({
        resource: resourceFromAttributes({
            [ATTR_SERVICE_NAME]: serviceName,
            [ATTR_SERVICE_VERSION]: `${serviceVersion}+${commitId}`,
        }),
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
}

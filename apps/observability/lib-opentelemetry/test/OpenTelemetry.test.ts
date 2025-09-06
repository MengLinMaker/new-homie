import { describe, it } from 'vitest'
import { suiteNameFromFileName } from './util'
import { OpenTelemetry } from '../src'
import type { Span } from '@opentelemetry/api'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, async () => {
    const otel = new OpenTelemetry()
    const { LOGGER, TRACER } = await otel.start({
        'service.name': '@observabilitylib-opentelemetry',
    })

    it('should log', () => {
        LOGGER.fatal('fatal')
        LOGGER.error('error')
        LOGGER.warn('warn')
        LOGGER.info('info')
        LOGGER.debug('debug')
        LOGGER.trace('trace')
        LOGGER.flush()
    })

    it('should trace', () => {
        const spans: Span[] = []
        const numSpans = 10

        for (let i = 0; i < numSpans; i++) {
            const span = TRACER.startSpan(i.toString())
            spans.unshift(span)
        }
        spans.forEach((span) => {
            span.end()
        })
    })
})

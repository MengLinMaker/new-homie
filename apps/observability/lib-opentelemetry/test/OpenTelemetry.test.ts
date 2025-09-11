import { describe, it } from 'vitest'
import { LOGGER, suiteNameFromFileName, TRACER } from './util'
import type { Span } from '@opentelemetry/api'

const testSuiteName = suiteNameFromFileName(import.meta.filename)
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe(testSuiteName, async () => {
    it('should log', () => {
        const span = TRACER.startSpan('test.context')
        const attributes = {
            'custom.attribute': 'custom.attribute'
        }
        LOGGER('fatal', attributes, 'fatal')
        LOGGER('error', attributes, 'error')
        LOGGER('warn', attributes, 'warn')
        LOGGER('info', attributes, 'info')
        LOGGER('debug', attributes, 'debug')
        LOGGER('trace', attributes, 'trace')
        span.end()
    })

    it('should trace', async () => {
        const spans: Span[] = []
        const numSpans = 10

        for (let i = 0; i < numSpans; i++) {
            const span = TRACER.startSpan(i.toString())
            spans.push(span)
            await sleep(10)
        }
        spans.forEach(async (span) => {
            span.end()
            await sleep(10)
        })
    })
})

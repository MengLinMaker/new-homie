import { describe, it, expect } from 'vitest'
import { suiteNameFromFileName } from './util'
import { otelException } from '../src/otelException'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    const stacktraceRegex = /at .+\/otelException.test.ts/

    it('should parse error', () => {
        const exception_message = 'exception_message'
        class error_type extends Error {}

        const result = otelException(new error_type(exception_message))
        expect(result['exception.message']).toBe(exception_message)
        // Note: error type is still Error after extending
        expect(result['exception.type']).toBe(Error.name)
        expect(result['exception.stacktrace']).toMatch(stacktraceRegex)
    })

    it('should parse error substitute', () => {
        const errorSubstitute = {
            name: 'ErrorSubstitute',
            message: 'Message',
        }

        const result = otelException(errorSubstitute)
        expect(result['exception.message']).toBe(errorSubstitute.message)
        expect(result['exception.type']).toBe(errorSubstitute.name)
        expect(result['exception.stacktrace']).not.toBeDefined()
    })

    it('should parse object', () => {
        const errorObject = { msg: 'Hello' }
        const result = otelException(errorObject)
        expect(result['exception.message']).toBe(JSON.stringify(errorObject))
        expect(result['exception.type']).toBe(Error.name)
        expect(result['exception.stacktrace']).toMatch(stacktraceRegex)
    })

    it('should parse un-JSON.stringfy()-able', () => {
        // Circular object
        type A = {
            a: A
        }
        const a: A = {
            a: '',
        } as never
        a.a = a

        const result = otelException(a)
        expect(result['exception.message']).toBe('[object Object]')
        expect(result['exception.type']).toBe(Error.name)
        expect(result['exception.stacktrace']).toMatch(stacktraceRegex)
    })
})

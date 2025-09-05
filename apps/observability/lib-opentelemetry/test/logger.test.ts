import { describe, it, expect } from 'vitest'
import { suiteNameFromFileName } from './util'
import { cleanStackTrace, enforceErrorType } from '../src/logger'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    describe('enforceErrorType', () => {
        it('should parse error', () => {
            const result = enforceErrorType(new Error('Error'))
            expect(result.message).toBeDefined()
            expect(result.name).toBeDefined()
            expect(result.stack).toBeDefined()
        })

        it('should parse object', () => {
            const result = enforceErrorType({ message: 'Error' })
            expect(result.message).toBeDefined()
            expect(result.name).toBeDefined()
            expect(result.stack).toBeDefined()
        })

        it('should parse undefined', () => {
            const result = enforceErrorType(undefined)
            expect(result.message).toBeDefined()
            expect(result.name).toBeDefined()
            expect(result.stack).toBeDefined()
        })
    })

    describe('cleanStackTrace', () => {
        const fileRegex = /logger.test.ts:[0-9]+:[0-9]+/

        it('should return undefined for undefined', () => {
            const result = cleanStackTrace(undefined)
            expect(result).toBe(undefined)
        })

        it('should clean stack trace', () => {
            const error = new Error('Error')
            const result = cleanStackTrace(error.stack)
            expect(result).toMatch(fileRegex)
        })

        it('should clean multiple stack trace', () => {
            const error = new Error('Error')
            const result = cleanStackTrace(`${error.stack}\n${error.stack}`)
            expect(result).toMatch(fileRegex)
        })
    })
})

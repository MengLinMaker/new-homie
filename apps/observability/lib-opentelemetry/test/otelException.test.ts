import { describe, it, expect } from 'vitest'
import { suiteNameFromFileName } from './util'
import { otelException } from '../src/otelException'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    it('should parse error', () => {
        const result = otelException(new Error('Error'))
        expect(result).toBeDefined()
    })

    it('should parse object', () => {
        const result = otelException({ message: 'Error' })
        expect(result).toBeDefined()
    })

    it('should parse undefined', () => {
        const result = otelException(undefined)
        expect(result).toBeDefined()
    })
})

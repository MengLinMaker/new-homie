import { describe, it, expect } from 'vitest'
import { LOGGER, suiteNameFromFileName } from '../util'
import { ILoggable } from '../../src/base/ILoggable'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    const loggable = new ILoggable(LOGGER)

    it('should not throw with stringifiable non-error', () => {
        const stringifiableObject = { msg: 'stringifiable' }
        JSON.stringify(stringifiableObject)
        loggable.logException('trace', stringifiableObject, null)
    })

    it('should not throw with non-stringifiable non-error', () => {
        const invalidObject = { a: null } as { a: unknown }
        invalidObject.a = { b: invalidObject }
        expect(() => {
            JSON.stringify(invalidObject)
        }).toThrow()
        loggable.logException('trace', invalidObject, null)
    })
})

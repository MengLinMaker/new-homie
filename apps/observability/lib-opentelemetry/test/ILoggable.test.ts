import { describe, it, expect } from 'vitest'
import { LOGGER, suiteNameFromFileName } from './util'
import { ILoggable } from '../src/ILoggable'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    it('should prevent direct usage', () => {
        expect(() => new ILoggable(LOGGER)).toThrow()
    })

    class Loggable extends ILoggable {
        public test_log() {
            this.log('debug', this.test_log, 'this.log')
        }
        public test_logException() {
            const error = new Error('test_logException')
            this.logException('debug', this.test_logException, error)
        }
        public test_logExceptionArgs() {
            const error = new Error('test_logExceptionArgs')
            this.logException('debug', this.test_logExceptionArgs, error)
        }
    }
    const loggable = new Loggable(LOGGER)

    it('should log', () => {
        loggable.test_log()
    })

    it('should logException', () => {
        loggable.test_logException()
    })

    it('should logExceptionArgs', () => {
        loggable.test_logExceptionArgs()
    })
})

import { describe, it, expect } from 'vitest'
import { suiteNameFromFileName } from './util'
import z from 'zod'
import { parseEnvSchema } from '../src'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    it('should parse when there is default', () => {
        parseEnvSchema(
            z.object({
                SOME_RANDOM_ENV_VARIABLE: z.string().default(''),
            }),
        )
    })

    it('should fail when there is no default', () => {
        expect(() => {
            parseEnvSchema(
                z.object({
                    SOME_RANDOM_ENV_VARIABLE: z.string(),
                }),
            )
        }).toThrowError()
    })
})

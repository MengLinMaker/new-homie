import { describe, expect, it } from 'vitest'
import { parseJsonFile } from '../util'
import { domainSuburb } from '../../src/scrape/domainSuburb'

const testSuiteName = 'domainSuburb'
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
    describe('tryExtractProfile', () => {
        it.for(['suburb-profile.dandenong-vic-3175'])(
            'should extract suburb info from %s',
            async (fileSuffix) => {
                const inputObject = parseJsonFile(`${resourcePath}/raw.${fileSuffix}.json`)
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryExtractProfile.${fileSuffix}.json`,
                )

                const [value, success] = await domainSuburb.tryExtractProfile(inputObject)
                if (!success) return expect(success).toBe(true)
                expect(value).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', async () => {
            const [resultObject, success] = await domainSuburb.tryExtractProfile({})
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })

    describe('tryTransformProfile', () => {
        // it.for(['suburb-profile.dandenong-vic-3175'])(
        //   'should extract suburb info from %s',
        //   async (fileSuffix) => {
        //     const inputObject = parseJsonFile(`${resourcePath}/tryExtractProfile.${fileSuffix}.json`)
        //     const expectedObject = parseJsonFile(
        //       `${resourcePath}/tryTransformProfile.${fileSuffix}.json`,
        //     )

        //     const [value, success] = await domainSuburb.tryTransformProfile(inputObject)
        //     if (!success) return expect(success).toBe(true)
        //     expect(value).toStrictEqual(expectedObject)
        //   },
        // )

        it('should not extract invalid input', async () => {
            const [resultObject, success] = await domainSuburb.tryTransformProfile({} as any)
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })
})

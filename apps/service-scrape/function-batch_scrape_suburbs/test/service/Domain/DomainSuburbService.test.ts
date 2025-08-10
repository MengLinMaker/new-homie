import { describe, expect, it } from 'vitest'
import { LOGGER, parseJsonFile } from '../../util'
import {
    type DomainListingsDTO,
    DomainSuburbService,
} from '../../../src/service/Domain/DomainSuburbService'

const testSuiteName = 'DomainSuburbService'
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
    const domainSuburbService = new DomainSuburbService(LOGGER)

    describe('tryExtractProfile', () => {
        it.for(['suburb-profile.dandenong-vic-3175'])(
            'should extract suburb info from %s',
            async (fileSuffix) => {
                const inputObject = parseJsonFile(
                    `${resourcePath}/raw.${fileSuffix}.json`,
                ) as object
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryExtractProfile.${fileSuffix}.json`,
                ) as unknown

                const [value, success] = await domainSuburbService.tryExtractProfile(inputObject)
                if (!success) return expect(success).toBe(true)
                expect(value).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', async () => {
            const [resultObject, success] = await domainSuburbService.tryExtractProfile({})
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })

    describe('tryTransformProfile', () => {
        it.for(['suburb-profile.dandenong-vic-3175'])(
            'should transform suburb info from %s',
            async (fileSuffix) => {
                const inputObject = parseJsonFile(
                    `${resourcePath}/tryExtractProfile.${fileSuffix}.json`,
                ) as DomainListingsDTO
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryTransformProfile.${fileSuffix}.json`,
                ) as unknown

                const [value, success] = await domainSuburbService.tryTransformProfile(inputObject)
                if (!success) return expect(success).toBe(true)
                expect(value).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', async () => {
            const [resultObject, success] = await domainSuburbService.tryTransformProfile(
                {} as DomainListingsDTO,
            )
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })
})

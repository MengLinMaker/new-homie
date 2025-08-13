import { describe, expect, it } from 'vitest'
import { LOGGER, parseJsonFile } from '../../../util'
import {
    type DomainListingsDTO,
    DomainSuburbService,
} from '../../../../src/scrape/website/www.domain.com.au/DomainSuburbService'

const testSuiteName = 'DomainSuburbService'
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
    const domainSuburbService = new DomainSuburbService(LOGGER)

    describe('tryExtractProfile', () => {
        it.for(['suburb-profile.dandenong-vic-3175'])(
            'should extract suburb info from %s',
            (fileSuffix) => {
                const inputObject = parseJsonFile(
                    `${resourcePath}/raw.${fileSuffix}.json`,
                ) as object
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryExtractProfile.${fileSuffix}.json`,
                ) as unknown

                const value = domainSuburbService.tryExtractProfile({ nextDataJson: inputObject })
                if (!value) return expect(value).toBeNull()
                expect(value).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', () => {
            const value = domainSuburbService.tryExtractProfile({} as never)
            expect(value).toBeNull()
        })
    })

    describe('tryTransformProfile', () => {
        it.for(['suburb-profile.dandenong-vic-3175'])(
            'should transform suburb info from %s',
            (fileSuffix) => {
                const inputObject = parseJsonFile(
                    `${resourcePath}/tryExtractProfile.${fileSuffix}.json`,
                ) as DomainListingsDTO
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryTransformProfile.${fileSuffix}.json`,
                ) as unknown

                const value = domainSuburbService.tryTransformProfile({
                    rawSuburbData: inputObject,
                })
                if (!value) return expect(value).toBeNull()
                expect(value).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', () => {
            const value = domainSuburbService.tryTransformProfile({} as never)
            expect(value).toBeNull()
        })
    })
})

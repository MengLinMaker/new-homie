import { describe, expect, it } from 'vitest'
import {
    DomainListingsService,
    type ListingsSchemaDTO,
} from '../../../src/service/Domain/DomainListingsService'
import { LOGGER, parseJsonFile } from '../../util'

const testSuiteName = 'DomainListingsService'
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
    const domainListingsService = new DomainListingsService(LOGGER)

    describe('tryExtractListing', () => {
        it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
            'should extract listings from %s',
            (fileSuffix) => {
                const inputObject = parseJsonFile(
                    `${resourcePath}/raw.${fileSuffix}.json`,
                ) as object
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
                ) as unknown

                const result = domainListingsService.tryExtractListings({
                    nextDataJson: inputObject,
                })
                if (!result) return expect(result).toBeNull()
                expect(result.isLastPage).toBeDefined()
                expect(result.listings).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', () => {
            const result = domainListingsService.tryExtractListings({ nextDataJson: {} })
            expect(result).toBeNull()
        })
    })

    describe('tryTransformListing', () => {
        it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
            'should transform listings from %s',
            (fileSuffix) => {
                const inputListings = parseJsonFile(
                    `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
                ) as ListingsSchemaDTO[]
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryTransformListing.${fileSuffix}.json`,
                ) as never[]

                inputListings.map((input, i) => {
                    const databaseInserts = domainListingsService.tryTransformListing({
                        listing: input,
                    })
                    if (!databaseInserts) return expect(databaseInserts).toBe(true)
                    expect(databaseInserts).toStrictEqual(expectedObject[i])
                })
            },
        )

        it('should not transform invalid input', () => {
            const databaseInserts = domainListingsService.tryTransformListing({} as never)
            expect(databaseInserts).toBeNull()
        })
    })

    describe('tryTransformSalePrice', () => {
        it.for(['sale.dandenong-vic-3175'])('should transform listings from %s', (fileSuffix) => {
            const inputListings = parseJsonFile(
                `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
            ) as ListingsSchemaDTO[]
            const expectedObject = parseJsonFile(
                `${resourcePath}/tryTransformSalePrice.${fileSuffix}.json`,
            ) as unknown[]

            inputListings.map((input, i) => {
                const databaseInserts = domainListingsService.tryTransformSalePrice({
                    listing: input,
                })
                if (databaseInserts) expect(databaseInserts).toStrictEqual(expectedObject[i])
            })
        })

        it('should not transform invalid input', () => {
            const databaseInserts = domainListingsService.tryTransformSalePrice({} as never)
            expect(databaseInserts).toBeNull()
        })
    })

    describe('tryTransformRentPrice', () => {
        it.for(['rent.dandenong-vic-3175'])('should transform listings from %s', (fileSuffix) => {
            const inputListings = parseJsonFile(
                `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
            ) as ListingsSchemaDTO[]
            const expectedObject = parseJsonFile(
                `${resourcePath}/tryTransformRentPrice.${fileSuffix}.json`,
            ) as unknown[]

            inputListings.map((input, i) => {
                const databaseInserts = domainListingsService.tryTransformRentPrice({
                    listing: input,
                })
                if (databaseInserts) expect(databaseInserts).toStrictEqual(expectedObject[i])
            })
        })

        it('should not transform invalid input', () => {
            const databaseInserts = domainListingsService.tryTransformRentPrice({} as never)
            expect(databaseInserts).toBeNull()
        })
    })
})

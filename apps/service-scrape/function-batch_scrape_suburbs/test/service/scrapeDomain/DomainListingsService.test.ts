import { describe, expect, it } from 'vitest'
import {
    DomainListingsService,
    type ListingsSchemaDTO,
} from '../../../src/service/scrapeDomain/DomainListingsService'
import { LOGGER, parseJsonFile } from '../../util'

const testSuiteName = 'DomainListingsService'
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
    const domainListingsService = new DomainListingsService(LOGGER)

    describe('tryExtractListing', () => {
        it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
            'should extract listings from %s',
            async (fileSuffix) => {
                const inputObject = parseJsonFile(
                    `${resourcePath}/raw.${fileSuffix}.json`,
                ) as object
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
                ) as unknown

                const [value, success] = await domainListingsService.tryExtractListings(inputObject)
                if (!success) return expect(success).toBe(true)
                const [resultObject, _isLastpage] = value
                expect(resultObject).toStrictEqual(expectedObject)
            },
        )

        it('should not extract invalid input', async () => {
            const [resultObject, success] = await domainListingsService.tryExtractListings({})
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })

    describe('tryTransformListing', () => {
        it.for(['rent.dandenong-vic-3175', 'sale.dandenong-vic-3175'])(
            'should transform listings from %s',
            async (fileSuffix) => {
                const inputListings = parseJsonFile(
                    `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
                ) as ListingsSchemaDTO[]
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryTransformListing.${fileSuffix}.json`,
                ) as unknown[]

                inputListings.map(async (input, i) => {
                    const [databaseInserts, success] =
                        await domainListingsService.tryTransformListing(input)
                    if (!success) return expect(success).toBe(true)
                    expect(databaseInserts).toStrictEqual(expectedObject[i])
                })
            },
        )

        it('should not transform invalid input', async () => {
            const [resultObject, success] = await domainListingsService.tryTransformListing(
                {} as ListingsSchemaDTO,
            )
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })

    describe('tryTransformSalePrice', () => {
        it.for(['sale.dandenong-vic-3175'])(
            'should transform listings from %s',
            async (fileSuffix) => {
                const inputListings = parseJsonFile(
                    `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
                ) as ListingsSchemaDTO[]
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryTransformSalePrice.${fileSuffix}.json`,
                ) as unknown[]

                inputListings.map(async (input, i) => {
                    const [databaseInserts, success] =
                        await domainListingsService.tryTransformSalePrice(input)
                    if (success) expect(databaseInserts).toStrictEqual(expectedObject[i])
                })
            },
        )

        it('should not transform invalid input', async () => {
            const [resultObject, success] = await domainListingsService.tryTransformListing(
                {} as ListingsSchemaDTO,
            )
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })

    describe('tryTransformRentPrice', () => {
        it.for(['rent.dandenong-vic-3175'])(
            'should transform listings from %s',
            async (fileSuffix) => {
                const inputListings = parseJsonFile(
                    `${resourcePath}/tryExtractListings.${fileSuffix}.json`,
                ) as ListingsSchemaDTO[]
                const expectedObject = parseJsonFile(
                    `${resourcePath}/tryTransformRentPrice.${fileSuffix}.json`,
                ) as unknown[]

                inputListings.map(async (input, i) => {
                    const [databaseInserts, success] =
                        await domainListingsService.tryTransformRentPrice(input)
                    if (success) expect(databaseInserts).toStrictEqual(expectedObject[i])
                })
            },
        )

        it('should not transform invalid input', async () => {
            const [resultObject, success] = await domainListingsService.tryTransformListing(
                {} as ListingsSchemaDTO,
            )
            expect(success).toBe(false)
            expect(resultObject).toBeInstanceOf(Error)
        })
    })
})

import { describe, expect, it } from 'vitest'
import {
    DomainListingsService,
    type ListingsSchemaDTO,
} from '../../../../src/scrape/website/www.domain.com.au/DomainListingsService'
import { LOGGER, parseJsonFile, suiteNameFromFileName } from '../../../util'

const testSuiteName = suiteNameFromFileName(import.meta.filename)
const resourcePath = `${import.meta.dirname}/${testSuiteName}`

describe(testSuiteName, () => {
    const domainListingsService = new DomainListingsService(LOGGER)

    describe('expectedNoMatchingPrice', () => {
        it('should return true for non-matching prices', () => {
            const inputs = [
                'No number',
                'Contact agent 0400 400 400',
                'Auction 12345',
                'Expressions of Interest 12345',
                'Call agent 12345',
                'Offers over 12345',
                '5pm',
                '5:30pm',
                '11am',
                '11:30am',
                '30/09/2025',
                '30-09-2025',
            ]
            for (const input of inputs)
                expect(domainListingsService.expectedNoMatchingPrice(input)).toBe(true)
        })

        it('should return false for matching prices', () => {
            const inputs = [
                '$580,000 - $638,999',
                '$580000 - $638999',
                '$580,000',
                '$580000',
                '$580k - $638k',
                '$580k',
                'From $580,000',
                'Up to $638,999',
                '$580pw - $638pw',
                '$580pw',
                '$580 per week',
                'From $580 per week',
                'Up to $638 per week',
            ]
            for (const input of inputs)
                expect(domainListingsService.expectedNoMatchingPrice(input)).toBe(false)
        })
    })

    describe('highestSalePriceFromString', () => {
        it('should extract highest 6-7 digit numbers', () => {
            const expected = 638999
            const inputs = [
                '580000-638999',
                '580000 638999',
                '580,000-638,999',
                '580,000 638,999',
                '638999',
                '638,999',
            ]
            for (const input of inputs)
                expect(domainListingsService.highestSalePriceFromString(input)).toBe(expected)
        })

        it('should extract 5 and 7 digit numbers', () => {
            expect(domainListingsService.highestSalePriceFromString('12345')).toBe(12345)
            expect(domainListingsService.highestSalePriceFromString('1234567')).toBe(1234567)
        })

        it('should ignore invalid numbers', () => {
            const inputs = [
                '5pm',
                '5:30pm',
                '11am',
                '11:30am',
                '30/09/2025',
                '30-09-2025',
                '040 4404 0404',
                '04044040404',
            ]
            for (const input of inputs)
                expect(domainListingsService.highestSalePriceFromString(input)).toBeNull()
        })
    })

    describe('highestRentPriceFromString', () => {
        it('should extract 3 and 4 digit numbers', () => {
            expect(domainListingsService.highestRentPriceFromString('123')).toBe(123)
            expect(domainListingsService.highestRentPriceFromString('1234')).toBe(1234)
        })

        it('should ignore invalid numbers', () => {
            const inputs = [
                '5pm',
                '5:30pm',
                '11am',
                '11:30am',
                '30/09/2025',
                '30-09-2025',
                '040 4404 0404',
                '04044040404',
            ]
            for (const input of inputs)
                expect(domainListingsService.highestRentPriceFromString(input)).toBeNull()
        })
    })

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

        it('should not extract invalid input - invalid record', () => {
            const result = domainListingsService.tryExtractListings({
                nextDataJson: {
                    props: {
                        pageProps: {
                            componentProps: {
                                currentPage: 1,
                                totalPages: 1,
                                listingsMap: {
                                    invalid: { invalid: 'data' },
                                },
                            },
                        },
                    },
                },
            })
            expect(result).toStrictEqual({
                isLastPage: true,
                listings: [],
            })
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

                inputListings.forEach((input, i) => {
                    const databaseInserts = domainListingsService.tryTransformListing({
                        listing: input,
                    })
                    if (databaseInserts) expect(databaseInserts).toStrictEqual(expectedObject[i])
                    expect(databaseInserts).toBeDefined()
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

            inputListings.forEach((input, i) => {
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

            inputListings.forEach((input, i) => {
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

    describe('tryExtractSalesPage', () => {
        it.for(['sale.dandenong-vic-3175'])('should extract listings from %s', (fileSuffix) => {
            const nextDataJson = parseJsonFile(`${resourcePath}/raw.${fileSuffix}.json`) as object

            const result = domainListingsService.tryExtractSalesPage({ nextDataJson })
            if (!result) return expect(result).toBeDefined()
            expect(result.isLastPage).toBeDefined()
            expect(result.salesInfo.length).toBeGreaterThan(0)
        })

        it('should not extract invalid input', () => {
            const result = domainListingsService.tryExtractSalesPage({ nextDataJson: {} })
            expect(result).toBeNull()
        })
    })

    describe('tryExtractRentsPage', () => {
        it.for(['rent.dandenong-vic-3175'])('should extract listings from %s', (fileSuffix) => {
            const nextDataJson = parseJsonFile(`${resourcePath}/raw.${fileSuffix}.json`) as object

            const result = domainListingsService.tryExtractRentsPage({ nextDataJson })
            if (!result) return expect(result).toBeDefined()
            expect(result.isLastPage).toBeDefined()
            expect(result.rentsInfo.length).toBeGreaterThan(0)
        })

        it('should not extract invalid input', () => {
            const result = domainListingsService.tryExtractRentsPage({ nextDataJson: {} })
            expect(result).toBeNull()
        })
    })
})

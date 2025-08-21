import { describe, expect, it } from 'vitest'
import { LOGGER, suiteNameFromFileName } from '../../../util'
import { AracaSchoolsService } from '../../../../src/scrape/website/asl.acara.edu.au/AracaSchoolsService'

const testSuiteName = suiteNameFromFileName(import.meta.filename)

describe(testSuiteName, () => {
    const scrapeUtilService = new AracaSchoolsService(LOGGER)
    const locality = {
        suburb: 'dandenong',
        state: 'VIC',
        postcode: '3175',
    }

    describe('getSchools', () => {
        it('should parse next.js html successfully', async () => {
            const resultObject = scrapeUtilService.getSchools(locality)
            expect(resultObject.length).toBeGreaterThan(0)
        })

        it('should return empty array for non-existent locality', async () => {
            const result = scrapeUtilService.getSchools({
                suburb: 'nonexistent',
                state: 'XXX',
                postcode: '0000',
            })
            expect(result).toStrictEqual([])
        })
    })
})

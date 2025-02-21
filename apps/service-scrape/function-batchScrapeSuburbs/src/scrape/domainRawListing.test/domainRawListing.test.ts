import { describe, expect, it } from 'vitest'
import { domainRawListing } from '../domainRawListing'
import { readFileSync } from 'node:fs'

describe('domainRawListing', () => {
  describe('tryExtractListings', () => {
    it('should extract listings successfully', async () => {
      const inputFile = 'raw.rent.dandenong-vic-3175.json'
      const expectedFile = 'tryExtractListings.rent.dandenong-vic-3175.json'
      const inputObject = JSON.parse(readFileSync(`${import.meta.dirname}/${inputFile}`).toString())
      const expectedObject = JSON.parse(
        readFileSync(`${import.meta.dirname}/${expectedFile}`).toString(),
      )

      const [[resultObject, _isLastpage], success] =
        await domainRawListing.tryExtractListings(inputObject)
      expect(success).toBe(true)
      expect(resultObject).toStrictEqual(expectedObject)
    })

    it('should not extract invalid input', async () => {
      const [resultObject, success] = await domainRawListing.tryExtractListings({})
      expect(success).toBe(false)
      expect(resultObject).toBeInstanceOf(Error)
    })
  })
})

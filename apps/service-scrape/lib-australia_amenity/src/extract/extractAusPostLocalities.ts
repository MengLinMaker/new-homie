import { PDFParse } from 'pdf-parse'
import { type Locality, localitySchema } from '../index.ts'
import { writeFileSync } from 'node:fs'

/**
 * Parse localities from AusPost Standard Postcode File (PC001) - https://postcode.auspost.com.au/free_display.html?id=1
 */
export const extractAusPostLocalities = async () => {
    const localities = new Map<string, Locality>()

    const textResult = await new PDFParse({
        url: './resource/standard_postcode_file.pdf',
    }).getText()
    const startId = textResult.text.indexOf('AARONS PASS NSW 2850')
    const endId = textResult.text.indexOf('-- 39 of 40 --')
    const text = textResult.text
        .slice(startId, endId)
        // Remove page indicators
        .replaceAll(/\n-- \d+ of \d+ --\n\n/g, '')
        .replaceAll(/Page .+\n.+\n/g, '')
        // Remove Australia Post abbreviations
        .replaceAll(/[ \n](BC|CPA|DC|DF|GPO|MC|MILPO|PO)[ \n]/g, '\n')

    // ? or debugging
    // writeFileSync('./src/resource/pdf-localities.txt', text)

    const localityRegex = /([A-Z]{2,}[- \n])+(ACT|NSW|NT|QLD|SA|TAS|VIC|WA) +\d{4}/g
    const localityMatch = text.matchAll(localityRegex)

    const statePostcodeRegex = /(ACT|NSW|NT|QLD|SA|TAS|VIC|WA) \d{4}/
    const suburbNameRegex = /[A-Z]{2,}(([- ][A-Z]{2,})+)?/
    const stateAbbreviationRegex = /(ACT|NSW|NT|QLD|SA|TAS|VIC|WA)/
    const postcodeRegex = /\d{4}/

    for (const [_localityText] of localityMatch) {
        const localityText = _localityText.replaceAll('\n', ' ')
        const statePostcode = localityText.match(statePostcodeRegex)!
        const locality = localitySchema.parse({
            suburb_name: localityText.slice(0, statePostcode.index).match(suburbNameRegex)![0],
            state_abbreviation: statePostcode[0].match(stateAbbreviationRegex)![0],
            postcode: statePostcode[0].match(postcodeRegex)![0],
        })
        localities.set(JSON.stringify(locality), locality)
    }

    writeFileSync(
        './src/resource/australia-localities.json',
        JSON.stringify(Array.from(localities.values()), null, 4),
    )
    console.info('Completed writing "australia-localities.json"')
    console.info(`Extracted ${localities.size} localities\n`)

    return localities
}

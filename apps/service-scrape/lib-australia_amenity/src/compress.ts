import { writeFileSync } from 'node:fs'
import { notInAustralia, readBrotliJson, roundPlaces, tryCatchError } from './util.ts'
import z from 'zod'
import '@service-scrape/lib-db_service_scrape'
import { enumToArray, Schema } from '@service-scrape/lib-db_service_scrape'

/**
 * GENERATE AUSTRALIAN AMENITIES JSON IN THIS FORMAT
 */
const newAmenitiesData: {
    name: string
    type: string
    category: string
    gps: [number, number]
}[] = []
const finalAmenitiesFilePath = './src/resource/australia-amenities-final.json'

/**
 * SPECIFY BROTLI COMPRESSED DATA URL SOURCE
 * WRAP IN {} TO COLLAPSE IN IDE
 */

// From raw amenity data -https://hub.arcgis.com/datasets/b4e6461dacd946ea854115570ee4ea68_0/about
{
    const amenitiesData = readBrotliJson('./resource/australia-amenities.json.br')
    /**
     * Filter low quality and irrelevant data
     * {'oldType': ['newType', 'category']}
     */
    const amenitiesCategoryFilter = {
        fuel: ['petrol station', 'fuel'],
        charging_station: ['charge station', 'fuel'],

        bank: ['bank', 'misc'],
        veterinary: ['vet', 'misc'],
        post_office: ['post', 'misc'],
        fire_station: ['fire station', 'misc'],

        clinic: ['clinic', 'medical'],
        doctors: ['clinic', 'medical'],
        // Info not detailed
        // hospital: ['hospital', 'medical'],
        dentist: ['dentist', 'medical'],
        pharmacy: ['pharmacy', 'medical'],

        childcare: ['childcare', 'education'],
        kindergarten: ['childcare', 'education'],
        // Info incomplete
        // school: ['school', 'education'],
        // college: ['college', 'education'],
        university: ['university', 'education'],
        // Info not detailed
        // marketplace: ['market', 'shop'],
    }
    for (const amenities of amenitiesData.features) {
        tryCatchError(() => {
            // An unamed place + outside of australia would be useless.
            if (!amenities.properties.name) return
            const coordinate = amenities.geometry.coordinates
            if (notInAustralia(coordinate)) return

            // @ts-expect-error
            const amenityType = amenitiesCategoryFilter[amenities.properties.amenity]
            if (!amenityType) return

            newAmenitiesData.push({
                name: amenities.properties.name,
                type: amenityType[0],
                category: amenityType[1],
                gps: [roundPlaces(coordinate[1], 7), roundPlaces(coordinate[0], 7)],
            })
        })
    }
}

// From raw hospital data - https://hub.arcgis.com/datasets/16fc2fab6beb4331b3d6b6844cb35bcc_0/about
// Ignore the low clinic data
{
    const hospitalsData = readBrotliJson('./resource/australia-hospitals.json.br')
    for (const hospital of hospitalsData.features) {
        tryCatchError(() => {
            if (!hospital.properties.name) return
            const coordinate = hospital.geometry.coordinates[0][0]
            if (notInAustralia(coordinate)) return
            if (hospital.properties.amenity !== 'hospital') return

            newAmenitiesData.push({
                name: hospital.properties.name,
                type: 'hospital',
                category: 'medical',
                gps: [roundPlaces(coordinate[1], 7), roundPlaces(coordinate[0], 7)],
            })
        })
    }
}

// From raw shops data - https://hub.arcgis.com/datasets/988071da24954be5b250a5d2a6bc6cab_0/about
{
    /**
     * Rename shop categories
     * {'oldType': 'newType'}
     */
    const shopCategoryFilter = {
        convenience: 'convenience',
        supermarket: 'supermarket',
        greengrocer: 'grocer',
    }
    const shopsData = readBrotliJson('./resource/australia-shops.json.br')
    for (const shop of shopsData.features) {
        tryCatchError(() => {
            if (!shop.properties.name) return
            const coordinate = shop.geometry.coordinates
            if (notInAustralia(coordinate)) return

            // @ts-expect-error
            if (!shopCategoryFilter[shop.properties.shop]) return

            newAmenitiesData.push({
                name: shop.properties.name,
                // @ts-expect-error
                type: shopCategoryFilter[shop.properties.shop],
                category: 'shop',
                gps: [roundPlaces(coordinate[1], 7), roundPlaces(coordinate[0], 7)],
            })
        })
    }
}

writeFileSync(finalAmenitiesFilePath, JSON.stringify(newAmenitiesData, null, 4))
console.info('Completed writing "australia-amenities-final.json"')

/**
 * Separate script to parse schools data - https://asl.acara.edu.au/School-Search
 */
{
    const schoolsData = readBrotliJson('./resource/australia-schools.json.br')
    const schema = z.array(
        z.object({
            ACARAId: z.preprocess((a) => parseInt(z.string().parse(a), 10), z.number().positive()),
            SchoolName: z.string(),
            SchoolType: z.enum(['Pri/Sec', 'Prim', 'Sec', 'Special']),
            SchoolURL: z.url().nullable().catch(null),
            SchoolSector: z.enum(['NG', 'Gov']),
            IndependentSchool: z.enum(['Y', 'N']),
            AddressList: z
                .array(
                    z.object({
                        City: z.string(),
                        StateProvince: z.enum(enumToArray(Schema.StateAbbreviationEnum)),
                        PostalCode: z.string().length(4),
                        GridLocation: z.object({
                            Latitude: z.number(),
                            Longitude: z.number(),
                        }),
                    }),
                )
                .length(1),
        }),
    )
    const validSchoolsData = schema.parse(schoolsData, {
        reportInput: true,
    })
    const localities = new Set()
    const transformedSchoolsData = validSchoolsData.map((school) => {
        const address = school.AddressList[0]
        if (!address) throw new Error(`No address found for ACARAId: ${school.ACARAId}`)
        const locality_table = {
            suburb: address.City,
            state: address.StateProvince,
            postcode: address.PostalCode,
        }
        localities.add(locality_table)
        return {
            school_table: {
                name: school.SchoolName,
                url: school.SchoolURL,
                acara_id: school.ACARAId,
                gps: {
                    lng: address.GridLocation.Longitude,
                    lat: address.GridLocation.Latitude,
                },
            },
            school_feature_table: {
                primary: school.SchoolType === 'Prim' || school.SchoolType === 'Pri/Sec',
                secondary: school.SchoolType === 'Sec' || school.SchoolType === 'Pri/Sec',
                government_sector: school.SchoolSector === 'Gov',
                independent: school.IndependentSchool === 'Y',
                special_needs: school.SchoolType === 'Special',
            },
            locality_table,
        }
    })
    writeFileSync(
        './src/resource/australia-schools-final.json',
        JSON.stringify(transformedSchoolsData, null, 4),
    )
    console.info('Completed writing "australia-schools-final.json"')

    writeFileSync(
        './src/resource/australia-localities.json',
        JSON.stringify(Array.from(localities), null, 4),
    )
    console.info('Completed writing "australia-localities-final.json"')
}

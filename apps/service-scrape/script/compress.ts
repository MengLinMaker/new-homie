import { writeFileSync } from 'node:fs'
import { notInAustralia, readBrotliJson, roundPlaces } from './util.ts'

/**
 * GENERATE AUSTRALIAN AMENITIES JSON IN THIS FORMAT
 */
const newAmenitiesData: {
  name: string
  type: string
  category: string
  gps: [number, number]
}[] = []
const finalAmenitiesFilePath = './script/australia-amenities-final.json'

/**
 * SPECIFY BROTLI COMPRESSED DATA URL SOURCE
 * WRAP IN {} TO COLLAPSE IN IDE
 */

// From raw amenity data -https://hub.arcgis.com/datasets/b4e6461dacd946ea854115570ee4ea68_0/about
{
  const amenitiesData = readBrotliJson('./script/australia-amenities.json.br')
  /**
   * Filter low quality and irrelevant data
   * old type: [new type, category]
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
    try {
      // An unamed place + outside of australia would be useless.
      if (!amenities.properties.name) continue
      const coordinate = amenities.geometry.coordinates
      if (notInAustralia(coordinate)) continue

      // @ts-expect-error
      const amenityType = amenitiesCategoryFilter[amenities.properties.amenity]
      if (!amenityType) continue

      newAmenitiesData.push({
        name: amenities.properties.name,
        type: amenityType[0],
        category: amenityType[1],
        gps: [roundPlaces(coordinate[1], 7), roundPlaces(coordinate[0], 7)],
      })
    } catch (error) {
      console.error(error)
    }
  }
}

// From raw hospital data - https://hub.arcgis.com/datasets/16fc2fab6beb4331b3d6b6844cb35bcc_0/about
// Ignore the low clinic data
{
  const hospitalsData = readBrotliJson('./script/australia-hospitals.json.br')
  for (const hospital of hospitalsData.features) {
    try {
      if (!hospital.properties.name) continue
      const coordinate = hospital.geometry.coordinates[0][0]
      if (notInAustralia(coordinate)) continue
      if (hospital.properties.amenity !== 'hospital') continue

      newAmenitiesData.push({
        name: hospital.properties.name,
        type: 'hospital',
        category: 'medical',
        gps: [roundPlaces(coordinate[1], 7), roundPlaces(coordinate[0], 7)],
      })
    } catch (error) {
      console.error(error)
    }
  }
}

// From raw shops data - https://hub.arcgis.com/datasets/988071da24954be5b250a5d2a6bc6cab_0/about
{
  /**
   * Filter
   * old type: [new type, category]
   */
  const shopCategoryFilter = {
    convenience: 'convenience',
    supermarket: 'supermarket',
    greengrocer: 'grocer',
  }
  const shopsData = readBrotliJson('./script/australia-shops.json.br')
  for (const shop of shopsData.features) {
    try {
      if (!shop.properties.name) continue
      const coordinate = shop.geometry.coordinates
      if (notInAustralia(coordinate)) continue

      // @ts-expect-error
      if (!shopCategoryFilter[shop.properties.shop]) continue

      newAmenitiesData.push({
        name: shop.properties.name,
        // @ts-expect-error
        type: shopCategoryFilter[shop.properties.shop],
        category: 'shop',
        gps: [roundPlaces(coordinate[1], 7), roundPlaces(coordinate[0], 7)],
      })
    } catch (error) {
      console.error(error)
    }
  }
}

writeFileSync(finalAmenitiesFilePath, JSON.stringify(newAmenitiesData, null, 2))
console.info('Completed writing final amenities file')

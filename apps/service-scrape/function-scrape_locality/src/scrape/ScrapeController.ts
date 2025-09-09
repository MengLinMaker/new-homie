import { IDatabased } from '../global/IDatabased'
import { DomainListingsService } from './website/www.domain.com.au/DomainListingsService'
import { ScrapeUtilService } from './website/ScrapeUtilService'
import type { BrowserService } from './website/BrowserService'
import type { Logger } from 'pino'
import type { Kysely } from 'kysely'
import type { Schema } from '@service-scrape/lib-db_service_scrape'
import { DomainSuburbService } from './website/www.domain.com.au/DomainSuburbService'
import { ScrapeModel } from './website/ScrapeModel'
import { AracaSchoolsService } from './website/asl.acara.edu.au/AracaSchoolsService'

export class ScrapeController extends IDatabased {
    readonly browserService
    constructor(logger: Logger, db: Kysely<Schema.DB>, browserService: BrowserService) {
        super(logger, db)
        this.browserService = browserService
    }

    scrapeUtilService = new ScrapeUtilService(this.LOGGER)
    domainListingsService = new DomainListingsService(this.LOGGER)
    domainSuburbService = new DomainSuburbService(this.LOGGER)
    aracaSchoolsService = new AracaSchoolsService(this.LOGGER)
    scrapeModel = new ScrapeModel(this.LOGGER, this.DB)

    sharedSearchparams = {
        // Restrictions reduce amount of data scraped
        ptype: 'apartment-unit-flat,block-of-units,duplex,free-standing,new-apartments,new-home-designs,new-house-land,pent-house,semi-detached,studio,terrace,town-house,villa',
        bedrooms: '1-5',
        bathrooms: '1-5',
        // Only scrape specific suburb for classification purposes
        ssubs: '0',
        // Prioritise processing lowest prices first
        sort: 'price-asc',
    }

    /**
     * Scrape suburb and update database
     * @returns localityId from database
     */
    async tryExtractSuburbPage(args: {
        suburb: string
        state: string | Schema.StateAbbreviationEnum
        postcode: string
    }) {
        try {
            const { suburb, state, postcode } = args
            const url = new URL(
                `https://www.domain.com.au/suburb-profile/${suburb}-${state}-${postcode}`.toLowerCase(),
            )
            const html = await this.browserService.getHTML(url.toString())
            if (!html) return null
            const nextDataJson = this.scrapeUtilService.tryExtractNextJson({ html })
            if (!nextDataJson) return null
            const rawSuburbData = this.domainSuburbService.tryExtractProfile({ nextDataJson })
            if (!rawSuburbData) return null
            const suburbData = this.domainSuburbService.tryTransformProfile({ rawSuburbData })
            if (!suburbData) return null

            const returnedData = await this.scrapeModel.tryUpdateSuburb({ suburbData })
            if (!returnedData) return null
            return returnedData.id
        } catch (e) {
            this.logExceptionArgs('error', this.tryExtractSuburbPage, args, e)
            return null
        }
    }

    async tryExtractSchools(args: {
        suburb: string
        state: string | Schema.StateAbbreviationEnum
        postcode: string
        localityId: number
    }) {
        try {
            const schools = this.aracaSchoolsService.getSchools(args)
            for (const schoolData of schools) {
                await this.scrapeModel.tryUpdateSchool({ schoolData, localityId: args.localityId })
            }
            return true
        } catch (e) {
            this.logExceptionArgs('error', this.tryExtractSchools, args, e)
            return false
        }
    }

    async tryExtractRentsPage(args: {
        suburb: string
        state: string | Schema.StateAbbreviationEnum
        postcode: string
        page: number
        localityId: number
    }) {
        try {
            const { suburb, state, postcode, page } = args
            const url = new URL(
                `https://www.domain.com.au/rent/${suburb}-${state}-${postcode}`.toLowerCase(),
            )
            url.search = new URLSearchParams({
                ...this.sharedSearchparams,
                excludedeposittaken: 1,
                price: '0-1000',
                page,
            } as never).toString()
            const html = await this.browserService.getHTML(url.toString())
            if (!html) return null
            const nextDataJson = this.scrapeUtilService.tryExtractNextJson({ html })
            if (!nextDataJson) return null
            const rentsData = this.domainListingsService.tryExtractRentsPage({ nextDataJson })
            if (!rentsData) return null

            for (const rentData of rentsData.rentsInfo) {
                await this.scrapeModel.tryUpdateRentListing({
                    rentData,
                    localityId: args.localityId,
                })
            }
            return rentsData
        } catch (e) {
            this.logExceptionArgs('error', this.tryExtractRentsPage, args, e)
            return null
        }
    }

    async tryExtractSalesPage(args: {
        suburb: string
        state: string | Schema.StateAbbreviationEnum
        postcode: string
        page: number
        localityId: number
    }) {
        try {
            const { suburb, state, postcode, page } = args
            const url = new URL(
                `https://www.domain.com.au/sale/${suburb}-${state}-${postcode}`.toLowerCase(),
            )
            url.search = new URLSearchParams({
                ...this.sharedSearchparams,
                excludeunderoffer: 1,
                price: '0-1000000',
                page,
            } as never).toString()
            const html = await this.browserService.getHTML(url.toString())
            if (!html) return null
            const nextDataJson = this.scrapeUtilService.tryExtractNextJson({ html })
            if (!nextDataJson) return null
            const salesData = this.domainListingsService.tryExtractSalesPage({ nextDataJson })
            if (!salesData) return null

            for (const saleData of salesData.salesInfo) {
                await this.scrapeModel.tryUpdateSaleListing({
                    saleData,
                    localityId: args.localityId,
                })
            }
            return salesData
        } catch (e) {
            this.logExceptionArgs('error', this.tryExtractSalesPage, args, e)
            return null
        }
    }
}

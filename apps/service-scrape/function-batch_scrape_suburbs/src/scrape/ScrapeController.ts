import { IDatabased } from '../global/IDatabased'
import { DomainListingsService } from './website/www.domain.com.au/DomainListingsService'
import { ScrapeUtilService } from './website/ScrapeUtilService'
import type { BrowserService } from './website/BrowserService'
import type { Logger } from 'pino'
import type { Kysely } from 'kysely'
import type { Schema } from '@service-scrape/lib-db_service_scrape'
import { DomainSuburbService } from './website/www.domain.com.au/DomainSuburbService'

export class ScrapeController extends IDatabased {
    readonly browserService
    constructor(logger: Logger, db: Kysely<Schema.DB>, browserService: BrowserService) {
        super(logger, db)
        this.browserService = browserService
    }

    scrapeUtilService = new ScrapeUtilService(this.LOGGER)
    domainListingsService = new DomainListingsService(this.LOGGER)
    domainSuburbService = new DomainSuburbService(this.LOGGER)

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

    async tryExtractSuburbPage(args: { suburb: string; state: string; postcode: number }) {
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
            return this.domainSuburbService.tryTransformProfile({ rawSuburbData })
        } catch (e) {
            this.logException('error', e, args)
            return null
        }
    }

    async tryExtractRentsPage(args: {
        suburb: string
        state: string
        postcode: number
        page: number
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
            return this.domainListingsService.tryExtractRentsPage({ nextDataJson })
        } catch (e) {
            this.logException('error', e, args)
            return null
        }
    }

    async tryExtractSalesPage(args: {
        suburb: string
        state: string
        postcode: number
        page: number
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
            return this.domainListingsService.tryExtractSalesPage({ nextDataJson })
        } catch (e) {
            this.logException('error', e, args)
            return null
        }
    }
}

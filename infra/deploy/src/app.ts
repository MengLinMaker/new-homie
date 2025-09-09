import * as cdk from 'aws-cdk-lib'
import { StackServiceScrapeQuery } from '../../../apps/service-scrape/stack-service_scrape_query/src/StackServiceScrapeQuery.ts'
import { StackServiceScrapePipeline } from '../../../apps/service-scrape/stack-service_scrape_pipeline/src/StackServiceScrapePipeline.ts'

const appSettings = {
    production: true,
    env: {
        region: 'ap-southeast-2',
    },
    tags: {
        app: 'NewHomie',
        stage: 'production',
    },
}

const app = new cdk.App()

new StackServiceScrapeQuery(app, 'NewHomie-StackServiceScrapeQuery-Production', appSettings)
new StackServiceScrapePipeline(app, 'NewHomie-StackServiceScrapePipeline-Production', appSettings)

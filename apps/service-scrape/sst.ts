import { DB_SERVICE_SCRAPE } from './lib-db_service_scrape/src/index'
import { commonArgs } from '../sst'

const dlq_scrape_locality = new sst.aws.Queue('queue_scrape_locality_dlq', {
    fifo: {
        contentBasedDeduplication: true,
    },
})

const queue_scrape_locality = new sst.aws.Queue('queue_scrape_locality', {
    fifo: {
        contentBasedDeduplication: true,
    },
    visibilityTimeout: '15 minutes',
    dlq: {
        queue: dlq_scrape_locality.arn,
        retry: 3,
    },
})

const function_scrape_locality_trigger = new sst.aws.Function('function_scrape_locality_trigger', {
    handler: './apps/service-scrape/function-scrape_locality_trigger/src/index.handler',
    ...commonArgs.Function,
    timeout: '15 minute',
    concurrency: {
        reserved: 1,
    },
    link: [queue_scrape_locality],
})

const function_scrape_locality = new sst.aws.Function('function_scrape_locality', {
    handler: './apps/service-scrape/function-scrape_locality/src/index.handler',
    ...commonArgs.Function,
    memory: '1769 MB',
    timeout: '15 minute',
    concurrency: {
        reserved: 1,
    },
    layers: ['arn:aws:lambda:ap-southeast-2:585946893245:layer:chromium-v138-0-2-layer-arm64:1'],
    nodejs: {
        install: ['@sparticuz/chromium'],
    },
    link: [queue_scrape_locality],
})

// 1. Trigger scraper weekly 8am Sat AEST - 10pm Sat UTC
new sst.aws.Cron('cron_scrape_locality_trigger', {
    // 2. Function determines which localities to scrape - { suburb, state, postcode }
    function: function_scrape_locality_trigger.arn,
    schedule: 'cron(15 10 * * ? *)',
})

// 3. Persist scraping progress in a queue - handles scrape worker failures
function_scrape_locality_trigger.addEnvironment({
    QUEUE_URL: queue_scrape_locality.url,
})

// 4. 1x scraper worker with throttled queue to slow scraping speed
queue_scrape_locality.subscribe(function_scrape_locality.arn, {
    batch: {
        size: 1,
    },
})

// 5. Persist scraped data to postgis database
function_scrape_locality.addEnvironment({
    DB_SERVICE_SCRAPE,
})

export { function_scrape_locality_trigger, function_scrape_locality }

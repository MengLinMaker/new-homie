/// <reference path="../../.sst/platform/config.d.ts" />

import { OTEL_ENV } from '../infra-common'
import { DB_SERVICE_SCRAPE } from './lib-db_service_scrape/src/index'
import path from 'node:path'

const dirname = './apps/service-scrape'

/**
 * 1. Trigger scrape pipeline 1am WED and SAT AEST
 */
const QueueScrapeLocality = new sst.aws.Queue('QueueScrapeLocality', {
    fifo: { contentBasedDeduplication: true },
    visibilityTimeout: '20 minutes', // Above lambda timeout
})
const FunctionScrapeLocalityTrigger = new sst.aws.Function('FunctionScrapeLocalityTrigger', {
    handler: path.join(dirname, './function-scrape_locality_trigger/src/index.handler'),
    architecture: 'arm64',
    runtime: 'nodejs22.x',
    memory: '1769 MB',
    timeout: '5 seconds',
    concurrency: { reserved: 1 },
    link: [QueueScrapeLocality],
    environment: {
        ...OTEL_ENV,
        QUEUE_URL: QueueScrapeLocality.url,
    },
})
new sst.aws.Cron(`ScrapeLocalityTrigger`, {
    // UTC 15:00 = AEST 1am next day
    schedule: `cron(0 15 ? * TUE,FRI *)`,
    function: FunctionScrapeLocalityTrigger.arn,
    enabled: $app.stage === 'production',
})

/**
 * 2. Chromium asset stored in S3 for faster cold start and smaller package size
 */
const BucketChromeAsset =
    $app.stage === 'production'
        ? new sst.aws.Bucket('BucketChromeAsset')
        : sst.aws.Bucket.get(
              'BucketChromeAsset',
              'new-homie-production-bucketchromeassetbucket-mdosnrof',
          )
// Use same bucket and key - manually chrome tar upload
const BucketChromeAssetKey = 'chromium-v138.0.2-pack.arm64.tar'

/**
 * 3. Jobs processed in FunctionScrapeLocality and stored in DB_SERVICE_SCRAPE
 */
const FunctionScrapeLocality = new sst.aws.Function('FunctionScrapeLocality', {
    handler: path.join(dirname, './function-scrape_locality/src/index.handler'),
    architecture: 'arm64',
    runtime: 'nodejs22.x',
    memory: '1769 MB',
    timeout: '15 minutes',
    concurrency: { reserved: 1 },
    link: [BucketChromeAsset, QueueScrapeLocality],
    environment: {
        ...OTEL_ENV,
        DB_SERVICE_SCRAPE,
        CHROME_PUPPETEER_ASSET_URL: $interpolate`https://useless_string_for_compatibility/${BucketChromeAsset.name}/${BucketChromeAssetKey}`,
    },
})
QueueScrapeLocality.subscribe(FunctionScrapeLocality.arn, {
    batch: { size: 1 },
})

/// <reference path="../../.sst/platform/config.d.ts" />

import { OTEL_ENV } from '../infra-common'
import { DB_SERVICE_SCRAPE } from './lib-db_service_scrape/src/index'
import path from 'node:path'

const dirname = './apps/service-scrape'

/**
 * 3. ECS Fargate task to run the scrape job
 */
const ScrapeLocalityTask = new sst.aws.Task('ScrapeLocalityTask', {
    cluster: new sst.aws.Cluster('ScrapeLocalityCluster', {
        vpc: new sst.aws.Vpc('ServiceScrapePipelineVpc'),
    }),
    architecture: 'arm64',
    cpu: '1 vCPU',
    memory: '2 GB',
    image: {
        context: './function-scrape_locality',
        dockerfile: 'Dockerfile',
    },
    environment: {
        ...OTEL_ENV,
        DB_SERVICE_SCRAPE,
    },
    dev: {
        command: 'node dist/index.js',
    },
})

/**
 * 2. Lambda function to trigger the ECS Fargate task
 */
const FunctionScrapeLocalityTrigger = new sst.aws.Function('FunctionScrapeLocalityTrigger', {
    handler: path.join(dirname, './function-scrape_locality_trigger/src/index.handler'),
    architecture: 'arm64',
    runtime: 'nodejs22.x',
    memory: '1769 MB',
    timeout: '5 seconds',
    concurrency: { reserved: 1 },
    environment: {
        ...OTEL_ENV,
    },
    link: [ScrapeLocalityTask],
    url: $app.stage !== 'production',
})

/**
 * 1. Trigger scrape pipeline 1am WED and SAT AEST
 */
new sst.aws.Cron(`ScrapeLocalityTrigger`, {
    // UTC 15:00 = AEST 1am next day
    schedule: `cron(0 15 ? * TUE,FRI *)`,
    function: FunctionScrapeLocalityTrigger.arn,
    enabled: $app.stage === 'production',
})

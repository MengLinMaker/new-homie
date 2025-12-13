/// <reference path="../../.sst/platform/config.d.ts" />

import { createImage, OTEL_ENV } from '../infra-common'
import { DB_SERVICE_SCRAPE } from './lib-db_service_scrape/src/index'
import path from 'node:path'
import * as pulumi from '@pulumi/pulumi'
import { RoleBatchEcs } from './infra-aws_batch_roles'

const dirname = './apps/service-scrape'

/**
 * Expands key value map for AWS format - https://docs.aws.amazon.com/batch/latest/APIReference/API_KeyValuePair.html
 * @param envMap key value map
 */
const expandEnv = (envMap: { [k: string]: string }) => {
    const expanded: { name: string; value: string }[] = []
    for (const [name, value] of Object.entries(envMap)) expanded.push({ name, value })
    return expanded
}

/**
 * 3. AWS Batch for fault tolerant scraping on cheap fargate spot instances
 */
const Vpc = new sst.aws.Vpc('Vpc', { az: 3 })
const ComputeEnvironment = new aws.batch.ComputeEnvironment('ComputeEnvironment', {
    computeResources: {
        maxVcpus: 1,
        securityGroupIds: Vpc.securityGroups,
        subnets: Vpc.publicSubnets,
        type: 'FARGATE_SPOT',
    },
    type: 'MANAGED',
})
const ImageScrapeLocality = createImage(
    'ImageScrapeLocality',
    path.join(dirname, './function-scrape_locality'),
)
const JobDefinitionScrapeLocality = new aws.batch.JobDefinition('JobDefinitionScrapeLocality', {
    type: 'container',
    platformCapabilities: ['FARGATE'],
    timeout: {
        attemptDurationSeconds: 60 * 30,
    },
    containerProperties: pulumi.jsonStringify({
        executionRoleArn: RoleBatchEcs.arn,
        image: ImageScrapeLocality.imageUri,
        runtimePlatform: { cpuArchitecture: 'ARM64' },
        command: ['node', '/app/index.js'],
        resourceRequirements: [
            { type: 'VCPU', value: '1' },
            { type: 'MEMORY', value: '2048' },
        ],
        networkConfiguration: { assignPublicIp: 'ENABLED' },
        environment: expandEnv({
            DB_SERVICE_SCRAPE,
            ...OTEL_ENV,
            // Default testing inputs
            suburb_name: 'Test',
            state_abbreviation: 'VIC',
            postcode: '0000',
        }),
    }),
})
const JobQueueScrapeLocality = new aws.batch.JobQueue('JobQueueScrapeLocality', {
    state: 'ENABLED',
    priority: 1,
    computeEnvironmentOrders: [{ computeEnvironment: ComputeEnvironment.arn, order: 1 }],
})

/**
 * 3. ECS Fargate task to run the scrape job
 */
const ScrapeLocalityTask = new sst.aws.Task('ScrapeLocalityTask', {
    cluster: new sst.aws.Cluster('ScrapeLocalityCluster', { vpc: Vpc }),
    architecture: 'arm64',
    cpu: '1 vCPU',
    memory: '2 GB',
    image: {
        context: path.join(dirname, './function-scrape_locality'),
        dockerfile: 'dockerfile',
    },
    environment: {
        ...OTEL_ENV,
        DB_SERVICE_SCRAPE,
        suburb_name: 'TEST',
        state_abbreviation: 'VIC',
        postcode: '0000',
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
    environment: { ...OTEL_ENV },
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

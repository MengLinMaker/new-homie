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
    const expanded: { Name: string; Value: string }[] = []
    for (const [Name, Value] of Object.entries(envMap)) expanded.push({ Name, Value })
    return expanded
}

/**
 * 3. AWS Batch for fault tolerant scraping on cheap fargate spot instances
 */
const Vpc = new sst.aws.Vpc('Vpc', { az: 3 })
const ComputeEnvironment = new aws.batch.ComputeEnvironment('ComputeEnvironment', {
    computeResources: {
        maxVcpus: 8,
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
    timeout: { attemptDurationSeconds: 60 * 30 },
    retryStrategy: { attempts: 3 },
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
 * Step function to orchestrate data pipeline
 */
const StepScrapeLocality = sst.aws.StepFunctions.task({
    name: 'StepScrapeLocality',
    resource: 'arn:aws:states:::batch:submitJob.sync',
    arguments: {
        // Follow JSONata syntax - https://www.youtube.com/watch?v=kVWxJoO_zc8&t=87s
        JobName:
            "{% $replace($states.input.suburb_name, ' ', '-') & '-' & $states.input.state_abbreviation & '-' & $states.input.postcode %}",
        JobQueue: JobQueueScrapeLocality.arn,
        JobDefinition: JobDefinitionScrapeLocality.arn,
        ContainerOverrides: {
            Environment: expandEnv({
                suburb_name: '{% $states.input.suburb_name %}',
                state_abbreviation: '{% $states.input.state_abbreviation %}',
                postcode: '{% $states.input.postcode %}',
            }),
        },
    },
    permissions: [
        {
            actions: ['batch:SubmitJob', 'batch:TagResource'],
            resources: [JobDefinitionScrapeLocality.arn, JobQueueScrapeLocality.arn],
        },
    ],
})
const StepMapScrapeLocality = sst.aws.StepFunctions.map({
    name: 'StepMapScrapeLocality',
    processor: StepScrapeLocality,
    items: '{% $states.input %}',
})
const StepDone = sst.aws.StepFunctions.succeed({ name: 'StepDone' })
const StepFunctionsScrapePipeline = new sst.aws.StepFunctions('StepFunctionsScrapePipeline', {
    definition: StepMapScrapeLocality.next(StepDone),
})

/**
 * 2. Lambda function to trigger the ECS Fargate task
 */
const FunctionScrapeLocalityTrigger = new sst.aws.Function('FunctionScrapeLocalityTrigger', {
    handler: path.join(dirname, './function-scrape_locality_trigger/src/index.handler'),
    architecture: 'arm64',
    runtime: 'nodejs22.x',
    memory: '1024 MB',
    timeout: '15 minutes',
    concurrency: { reserved: 1 },
    environment: {
        ...OTEL_ENV,
        STEP_FUNCTION_ARN: StepFunctionsScrapePipeline.arn,
    },
    link: [StepFunctionsScrapePipeline],
})

/**
 * 1. Trigger scrape pipeline 1am WED and SAT AEST
 */
new sst.aws.Cron(`ScrapeLocalityTrigger`, {
    // UTC 14:00 = AEST 12am / AEDT 1am next day
    schedule: `cron(0 14 ? * TUE,FRI *)`,
    function: FunctionScrapeLocalityTrigger.arn,
    enabled: $app.stage === 'production',
})

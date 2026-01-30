/// <reference path="../../.sst/platform/config.d.ts" />

import { createImage, OTEL_ENV } from '../infra-common'
import { DB_SERVICE_SCRAPE } from './lib-db_service_scrape/src/index'
import path from 'node:path'
import pulumi from '@pulumi/pulumi'
import { RoleBatchEcs } from './infra-aws_batch_roles'
import { SecurityGroup, Subnets } from './infra-service_scrape_vpc'

const DIRNAME = './apps/service-scrape'
const SCRAPE_VCPU = 1
const SCRAPE_CONCURRENCY = 4
const SCRAPE_MB = 2048

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
 * 5. Postprocess - update materialised views
 */
const FunctionScrapePostprocess = new sst.aws.Function('FunctionScrapePostprocess', {
    handler: path.join(DIRNAME, './function-scrape_postprocess/src/index.handler'),
    architecture: 'arm64',
    runtime: 'nodejs22.x',
    memory: '1024 MB',
    timeout: '30 seconds',
    concurrency: { reserved: 1 },
    environment: {
        ...OTEL_ENV,
        DB_SERVICE_SCRAPE,
    },
})
const StepScrapePostprocess = sst.aws.StepFunctions.lambdaInvoke({
    name: 'StepScrapeLocalityPostprocess',
    function: FunctionScrapePostprocess,
})

/**
 * 4. AWS Batch for fault tolerant scraping on cheap fargate spot instances
 */
const ComputeEnvironment = new aws.batch.ComputeEnvironment('ServiceScrapeComputeEnvironment', {
    computeResources: {
        maxVcpus: SCRAPE_CONCURRENCY * SCRAPE_VCPU,
        securityGroupIds: [SecurityGroup.id],
        subnets: Subnets,
        type: 'FARGATE_SPOT',
    },
    type: 'MANAGED',
})
const ImageScrapeLocality = createImage(
    'ImageScrapeLocality',
    path.join(DIRNAME, './function-scrape_locality'),
)
const JobDefinitionScrapeLocality = new aws.batch.JobDefinition(
    'ServiceScrapeJobDefinitionScrapeLocality',
    {
        type: 'container',
        platformCapabilities: ['FARGATE'],
        timeout: { attemptDurationSeconds: 60 * 60 },
        retryStrategy: { attempts: 2 },
        deregisterOnNewRevision: false, // Do not break running pipeline
        containerProperties: pulumi.jsonStringify({
            executionRoleArn: RoleBatchEcs.arn,
            image: ImageScrapeLocality.imageUri,
            runtimePlatform: { cpuArchitecture: 'ARM64' },
            command: ['node', '/app/index.js'],
            resourceRequirements: [
                { type: 'VCPU', value: `${SCRAPE_VCPU}` },
                { type: 'MEMORY', value: `${SCRAPE_MB}` },
            ],
            networkConfiguration: { assignPublicIp: 'ENABLED' },
            environment: expandEnv({
                ...OTEL_ENV,
                DB_SERVICE_SCRAPE,
                // Default testing inputs
                LOCALITIES: JSON.stringify([
                    {
                        suburb_name: 'Test',
                        state_abbreviation: 'VIC',
                        postcode: '0000',
                    },
                ]),
            }),
        }),
    },
)
const JobQueueScrapeLocality = new aws.batch.JobQueue('ServiceScrapeJobQueueScrapeLocality', {
    state: 'ENABLED',
    priority: 1,
    computeEnvironmentOrders: [{ computeEnvironment: ComputeEnvironment.arn, order: 1 }],
})

/**
 * 3. Step function to orchestrate data pipeline
 */
const StepScrapeLocality = sst.aws.StepFunctions.task({
    name: 'StepScrapeLocality',
    resource: 'arn:aws:states:::batch:submitJob.sync',
    arguments: {
        // Follow JSONata syntax - https://www.youtube.com/watch?v=kVWxJoO_zc8&t=87s
        JobName:
            "{% $replace($states.input[0].suburb_name, ' ', '-') & '-' & $states.input[0].state_abbreviation & '-' & $states.input[0].postcode %}",
        JobQueue: JobQueueScrapeLocality.arn,
        JobDefinition: JobDefinitionScrapeLocality.arn,
        ContainerOverrides: {
            Environment: expandEnv({
                LOCALITIES: '{% $string($states.input) %}',
            }),
        },
    },
    permissions: [
        {
            actions: ['batch:SubmitJob', 'batch:TagResource'],
            resources: [JobDefinitionScrapeLocality.arn, JobQueueScrapeLocality.arn],
        },
    ],
    // Disable output - not needed
    output: {},
})
const StepMapScrapeLocality = sst.aws.StepFunctions.map({
    name: 'StepMapScrapeLocality',
    processor: StepScrapeLocality,
    items: '{% $states.input %}',
    // Limit
    maxConcurrency: SCRAPE_CONCURRENCY * 2,
    mode: 'standard',
})
const StepFunctionsScrapePipeline = new sst.aws.StepFunctions('StepFunctionsScrapePipeline', {
    definition: StepMapScrapeLocality.next(StepScrapePostprocess),
})

/**
 * 2. Lambda function calculates which localities to scrape
 */
const FunctionScrapeLocalityTrigger = new sst.aws.Function('FunctionScrapeLocalityTrigger', {
    handler: path.join(DIRNAME, './function-scrape_locality_trigger/src/index.handler'),
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
 * 1. Trigger scrape pipeline - at UTC 0:00 (AEST 10:00 / AEDT 11:00) - Tue and Fri
 * UTC 0:00 maximises deadline - Javascript Date.now() is UTC
 */
new sst.aws.Cron(`ScrapeLocalityTrigger`, {
    schedule: `cron(0 0 ? * TUE,FRI *)`,
    function: FunctionScrapeLocalityTrigger.arn,
    enabled: $app.stage === 'production',
})

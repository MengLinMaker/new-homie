import path from 'node:path'
import { NagSuppressions } from 'cdk-nag'
import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
import type { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as batch from 'aws-cdk-lib/aws-batch'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'

import { DB_SERVICE_SCRAPE } from '@service-scrape/lib-db_service_scrape'
import { functionDefaults } from '@infra/common'

export class StackServiceScrapePipeline extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        NagSuppressions.addStackSuppressions(this, [
            { id: 'Serverless-EventBusDLQ', reason: 'Failures cannot be handled' },
            { id: 'Serverless-SQSRedrivePolicy', reason: 'Not all errors need redrive' },
            {
                id: 'Serverless-LambdaEventSourceMappingDestination',
                reason: 'Failures are expected, not handled',
            },
            { id: 'Serverless-LambdaDLQ', reason: 'Failures are expected, not handled' },
            {
                id: 'Serverless-LambdaAsyncFailureDestination',
                reason: 'Failures are expected, not handled',
            },
            { id: 'AwsSolutions-IAM4', reason: 'Use default IAM permission for now' },
            { id: 'AwsSolutions-IAM5', reason: 'Use default IAM permission for now' },
        ])

        const scrapeLocalityVPC = new ec2.Vpc(this, 'ScrapeLocalityVPC', {
            maxAzs: 99,
            subnetConfiguration: [
                {
                    // Only need 1 machine for batch webscraping
                    name: 'batch',
                    cidrMask: 28,
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
                },
            ],
        })

        const scrapeLocalityComputeEnv = new batch.ManagedEc2EcsComputeEnvironment(
            this,
            'ScrapeLocalityComputeEnv',
            {
                vpc: scrapeLocalityVPC as never,
                // Compute optimised, high bandwidth 1vCPU 2GB instance for webscraping
                instanceTypes: [
                    ec2.InstanceType.of(ec2.InstanceClass.C6G, ec2.InstanceSize.MEDIUM),
                ],
                useOptimalInstanceClasses: false,
                // Scrape with one instance at a time
                maxvCpus: 1,
                minvCpus: 0,
                // Choose spot instance if possible
                allocationStrategy: batch.AllocationStrategy.SPOT_PRICE_CAPACITY_OPTIMIZED,
                spot: true,
                spotBidPercentage: 50,
            },
        )

        const scrapeLocalityJobQueue = new batch.JobQueue(this, 'ScrapeLocalityJobQueue', {
            priority: 10,
            computeEnvironments: [
                {
                    computeEnvironment: scrapeLocalityComputeEnv as never,
                    order: 1,
                },
            ],
        })

        // Define a Job Definition
        const repo = ecr.Repository.fromRepositoryName(
            this,
            'MyEcrRepo',
            'your-docker-image-repo-name',
        ) // Replace with your ECR repo name

        const jobDefinition = new batch.EcsJobDefinition(this, 'MyJobDefinition', {
            container: new batch.EcsEc2ContainerDefinition(this, '', {
                image: ecs.ContainerImage.fromEcrRepository(repo), // Use your Docker image tag
                memory: cdk.Size.gibibytes(2),
                cpu: 1,
            }),
            retryStrategies: [
                batch.RetryStrategy.of(batch.Action.EXIT, batch.Reason.CANNOT_PULL_CONTAINER),
                batch.RetryStrategy.of(batch.Action.RETRY, batch.Reason.NON_ZERO_EXIT_CODE),
                batch.RetryStrategy.of(batch.Action.RETRY, batch.Reason.SPOT_INSTANCE_RECLAIMED),
            ],
            retryAttempts: 3,
        })

        // Main SQS Queue for batch scraping
        const scrapeLocalityQueue = new sqs.Queue(this, 'ScrapeLocalityQueue', {
            queueName: 'ScrapeLocalityQueue',
            enforceSSL: true,
            // Duration of AWS lambda
            visibilityTimeout: cdk.Duration.minutes(15),
            // No plans to process failed requests
            deadLetterQueue: {
                queue: new sqs.Queue(this, 'ScrapeLocalityDLQ', {
                    queueName: 'ScrapeLocalityQueue-DLQ',
                    enforceSSL: true,
                }),
                maxReceiveCount: 2,
            },
        })

        // Batch Trigger Lambda Function - 1x smallest instance for slow trigger
        const scrapeLocalityTriggerFunction = new NodejsFunction(this, 'ScrapeLocalityTrigger', {
            ...functionDefaults,
            memorySize: 128,
            entry: path.join(
                import.meta.dirname,
                '../../function-scrape_locality_trigger/src/index.mts',
            ),
            timeout: cdk.Duration.seconds(60),
            reservedConcurrentExecutions: 1,
            environment: {
                ...functionDefaults.environment,
                QUEUE_URL: scrapeLocalityQueue.queueUrl,
            },
        })
        scrapeLocalityQueue.grantSendMessages(scrapeLocalityTriggerFunction)

        // Schedule trigger at 8am Saturday AEST
        new events.Rule(this, 'ScrapeLocalityTriggerEvent', {
            schedule: events.Schedule.cron({
                minute: '0',
                hour: '22',
                weekDay: '6',
            }),
            targets: [new targets.LambdaFunction(scrapeLocalityTriggerFunction)],
        })

        const scrapeChromePuppeteerAsset = new Asset(this, 'ScrapeChromePuppeteerAsset', {
            path: path.join(
                import.meta.dirname,
                '../../function-scrape_locality/src/asset/chromium-v138.0.2-pack.arm64.tar',
            ),
        })

        // Batch Scrape Suburbs Lambda Function - 1x 1vCPU for max duration
        const scrapeLocalityFunction = new NodejsFunction(this, 'ScrapeLocality', {
            ...functionDefaults,
            entry: path.join(import.meta.dirname, '../../function-scrape_locality/src/index.mts'),
            memorySize: 1769,
            timeout: cdk.Duration.seconds(900),
            reservedConcurrentExecutions: 2,
            retryAttempts: 0,
            environment: {
                ...functionDefaults.environment,
                DB_SERVICE_SCRAPE,
                CHROME_PUPPETEER_ASSET_URL: scrapeChromePuppeteerAsset.httpUrl,
            },
            events: [
                new lambdaEventSources.SqsEventSource(scrapeLocalityQueue, {
                    batchSize: 1,
                    maxConcurrency: 2,
                }),
            ],
        })
        scrapeChromePuppeteerAsset.grantRead(scrapeLocalityFunction)
    }
}

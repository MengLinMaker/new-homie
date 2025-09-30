import path from 'node:path'
import { NagSuppressions } from 'cdk-nag'
import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
import type { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'

import { DB_SERVICE_SCRAPE } from '@service-scrape/lib-db_service_scrape'
import { functionDefaults } from '@infra/lib-common'

interface StackServiceScrapePipelineProps extends cdk.StackProps {
    production: boolean
}

export class StackServiceScrapePipeline extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: StackServiceScrapePipelineProps) {
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

        // Main SQS Queue for batch scraping
        const QueueScrapeLocality = new sqs.Queue(this, 'QueueScrapeLocality', {
            enforceSSL: true,
            // Duration of AWS lambda
            visibilityTimeout: cdk.Duration.minutes(15),
            // No plans to process failed requests
            deadLetterQueue: {
                queue: new sqs.Queue(this, 'ScrapeLocalityDLQ', {
                    enforceSSL: true,
                }),
                maxReceiveCount: 2,
            },
        })

        // Batch Trigger Lambda Function - 1x smallest instance for slow trigger
        const FunctionScrapeLocalityTrigger = new NodejsFunction(
            this,
            'FunctionScrapeLocalityTrigger',
            {
                ...functionDefaults,
                memorySize: 1769,
                entry: path.join(
                    import.meta.dirname,
                    '../../function-scrape_locality_trigger/src/index.ts',
                ),
                timeout: cdk.Duration.seconds(60),
                reservedConcurrentExecutions: 1,
                environment: {
                    ...functionDefaults.environment,
                    QUEUE_URL: QueueScrapeLocality.queueUrl,
                },
            },
        )
        QueueScrapeLocality.grantSendMessages(FunctionScrapeLocalityTrigger)

        // Schedule trigger at 1am Saturday AEST
        new events.Rule(this, 'ScrapeLocalityTriggerEvent', {
            enabled: props?.production ?? false,
            schedule: events.Schedule.cron({
                minute: '0',
                hour: '15',
                weekDay: 'FRI',
            }),
            targets: [new targets.LambdaFunction(FunctionScrapeLocalityTrigger)],
        })

        // Schedule trigger at 1am Wednesday AEST
        new events.Rule(this, 'ScrapeLocalityTriggerEvent', {
            enabled: props?.production ?? false,
            schedule: events.Schedule.cron({
                minute: '0',
                hour: '15',
                weekDay: 'TUE',
            }),
            targets: [new targets.LambdaFunction(FunctionScrapeLocalityTrigger)],
        })

        const AssetScrapeChromePuppeteer = new Asset(this, 'AssetScrapeChromePuppeteer', {
            path: path.join(
                import.meta.dirname,
                '../../function-scrape_locality/src/asset/chromium-v138.0.2-pack.arm64.tar',
            ),
        })

        // Batch Scrape Suburbs Lambda Function - 1x 1vCPU for max duration
        const FunctionScrapeLocality = new NodejsFunction(this, 'FunctionScrapeLocality', {
            ...functionDefaults,
            entry: path.join(import.meta.dirname, '../../function-scrape_locality/src/index.ts'),
            memorySize: 1769,
            timeout: cdk.Duration.seconds(900),
            reservedConcurrentExecutions: 2,
            retryAttempts: 0,
            environment: {
                ...functionDefaults.environment,
                DB_SERVICE_SCRAPE,
                CHROME_PUPPETEER_ASSET_URL: AssetScrapeChromePuppeteer.httpUrl,
            },
            events: [
                new lambdaEventSources.SqsEventSource(QueueScrapeLocality, {
                    batchSize: 1,
                    maxConcurrency: 2,
                }),
            ],
        })
        FunctionScrapeLocality.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
        AssetScrapeChromePuppeteer.grantRead(FunctionScrapeLocality)
    }
}

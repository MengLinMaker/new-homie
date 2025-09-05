import path from 'node:path'
import { NagSuppressions } from 'cdk-nag'
import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
// import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import type { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Asset } from 'aws-cdk-lib/aws-s3-assets'

import { DB_SERVICE_SCRAPE } from '@service-scrape/lib-db_service_scrape'
import { functionDefaults } from '@infra/common'

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
            enabled: props?.production ?? false,
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
        scrapeLocalityFunction.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN)
        scrapeChromePuppeteerAsset.grantRead(scrapeLocalityFunction)

        // const api = new apigateway.RestApi(this, 'ServiceScrapeApi')
        // const lambdaIntegration = new apigateway.LambdaIntegration(scrapeLocalityFunction, {
        //     timeout: cdk.Duration.seconds(29),
        // })
        // api.root.addProxy({
        //     defaultIntegration: lambdaIntegration,
        // })
        // api.root.addMethod('GET', lambdaIntegration)
        // new cdk.CfnOutput(this, 'ServiceScrapeApiPath', {
        //     value: api.root.path,
        // })

        // Read Public Lambda Function (if it exists)
        // Note: This function doesn't exist in the current structure, so commenting out
        // const readPublicFunction = new NodejsFunction(this, 'ReadPublic', {
        //   runtime: lambda.Runtime.NODEJS_22_X,
        //   architecture: lambda.Architecture.ARM_64,
        //   entry: './function-read_public/src/index.mts',
        //   timeout: cdk.Duration.seconds(3),
        //   memorySize: 1769,
        //   reservedConcurrentExecutions: 10,
        //   bundling,
        // });

        // API Gateway for public read endpoint (if needed)
        // const api = new apigateway.RestApi(this, 'ServiceScrapeApi');
        // api.root.addProxy({
        //   defaultIntegration: new apigateway.LambdaIntegration(readPublicFunction),
        //   anyMethod: false,
        // });
        // api.root.addMethod('GET', new apigateway.LambdaIntegration(readPublicFunction));
    }
}

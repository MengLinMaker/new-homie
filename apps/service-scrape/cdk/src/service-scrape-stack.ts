import * as cdk from 'aws-cdk-lib'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
import type { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

import { functionDefaults, NODE_OPTIONS } from './util/functionDefaults.ts'

export class ServiceScrapeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // Main SQS Queue for batch scraping
        const scrapeLocalityQueue = new sqs.Queue(this, 'ScrapeLocalityQueue', {
            queueName: 'ScrapeLocalityQueue',
            // No plans to process failed requests
            deadLetterQueue: {
                queue: new sqs.Queue(this, 'ScrapeLocalityDLQ', {
                    queueName: 'ScrapeLocalityQueue-DLQ',
                }),
                maxReceiveCount: 2,
            },
        })

        // Batch Trigger Lambda Function - 1x smallest instance for slow trigger
        const scrapeLocalityTriggerFunction = new NodejsFunction(this, 'ScrapeLocalityTrigger', {
            ...functionDefaults,
            entry: '../function-scrape_locality_trigger/src/index.mts',
            timeout: cdk.Duration.seconds(60),
            reservedConcurrentExecutions: 1,
            environment: {
                NODE_OPTIONS,
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
        }).addTarget(new targets.LambdaFunction(scrapeLocalityTriggerFunction))

        // Batch Scrape Suburbs Lambda Function - 1x 1vCPU for max duration
        const scrapeLocalityFunction = new NodejsFunction(this, 'ScrapeLocality', {
            ...functionDefaults,
            entry: '../function-scrape_locality/src/index.mts',
            memorySize: 1769,
            timeout: cdk.Duration.seconds(900),
            reservedConcurrentExecutions: 1,
            environment: { NODE_OPTIONS },
        })
        scrapeLocalityFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(scrapeLocalityQueue, {
                batchSize: 1,
                maxConcurrency: 2,
            }),
        )

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

        // Outputs
        new cdk.CfnOutput(this, 'ScrapeLocalityQueueUrl', {
            value: scrapeLocalityQueue.queueUrl,
            description: 'URL of the batch scrape suburbs queue',
        })
    }
}

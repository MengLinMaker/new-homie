import * as cdk from 'aws-cdk-lib'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as events from 'aws-cdk-lib/aws-events'
import * as targets from 'aws-cdk-lib/aws-events-targets'
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
import type { Construct } from 'constructs'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

import { bundling, NODE_OPTIONS } from './constructs/functionDefaults'

export class ServiceScrapeStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)

        // Dead Letter Queue for failed messages
        const scrapeLocalityDLQ = new sqs.Queue(this, 'ScrapeLocalityDLQ', {
            queueName: 'ScrapeLocalityQueue-DLQ',
        })

        // Main SQS Queue for batch scraping
        const scrapeLocalityQueue = new sqs.Queue(this, 'ScrapeLocalityQueue', {
            queueName: 'ScrapeLocalityQueue',
            deadLetterQueue: {
                queue: scrapeLocalityDLQ,
                maxReceiveCount: 3,
            },
        })

        // Batch Trigger Lambda Function
        const scrapeLocalityTriggerFunction = new NodejsFunction(this, 'ScrapeLocalityTrigger', {
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            entry: './function-scrape_locality_trigger/src/index.mts',
            timeout: cdk.Duration.seconds(60),
            reservedConcurrentExecutions: 1,
            environment: {
                NODE_OPTIONS,
                BATCHSCRAPESUBURBSQUEUE_QUEUE_NAME: scrapeLocalityQueue.queueName,
                BATCHSCRAPESUBURBSQUEUE_QUEUE_ARN: scrapeLocalityQueue.queueArn,
                BATCHSCRAPESUBURBSQUEUE_QUEUE_URL: scrapeLocalityQueue.queueUrl,
            },
            bundling,
        })

        // Grant permissions to send messages to SQS
        scrapeLocalityQueue.grantSendMessages(scrapeLocalityTriggerFunction)

        // Schedule the batch trigger for Fridays at 10pm UTC (8am Saturday AEST)
        const scrapeLocalityTriggerRule = new events.Rule(this, 'ScrapeLocalityTriggerEvent', {
            schedule: events.Schedule.cron({
                minute: '0',
                hour: '22',
                weekDay: '6', // Saturday (0=Sunday, 6=Saturday)
            }),
        })
        scrapeLocalityTriggerRule.addTarget(
            new targets.LambdaFunction(scrapeLocalityTriggerFunction),
        )

        // Batch Scrape Suburbs Lambda Function
        const scrapeLocalityFunction = new NodejsFunction(this, 'ScrapeLocality', {
            runtime: lambda.Runtime.NODEJS_22_X,
            architecture: lambda.Architecture.ARM_64,
            entry: './function-scrape_locality/src/index.mts',
            timeout: cdk.Duration.seconds(900),
            memorySize: 1500,
            reservedConcurrentExecutions: 1,
            environment: { NODE_OPTIONS },
            bundling,
        })

        // Connect SQS to Lambda
        scrapeLocalityFunction.addEventSource(
            new lambdaEventSources.SqsEventSource(scrapeLocalityQueue, {
                batchSize: 1,
                enabled: false, // Initially disabled as per SAM template
                maxConcurrency: 2,
            }),
        )

        // Read Public Lambda Function (if it exists)
        // Note: This function doesn't exist in the current structure, so commenting out
        // const readPublicFunction = new NodejsFunction(this, 'ReadPublic', {
        //   runtime: lambda.Runtime.NODEJS_22_X,
        //   handler: 'handler',
        //   entry: './function-read_public/src/index.mts',
        //   architecture: lambda.Architecture.ARM_64,
        //   timeout: cdk.Duration.seconds(3),
        //   memorySize: 1769,
        //   reservedConcurrentExecutions: 10,
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

        new cdk.CfnOutput(this, 'ScrapeLocalityQueueArn', {
            value: scrapeLocalityQueue.queueArn,
            description: 'ARN of the batch scrape suburbs queue',
        })
    }
}

import { NagSuppressions } from 'cdk-nag'
import * as cdk from 'aws-cdk-lib'
import type { Construct } from 'constructs'
// import path from 'node:path'
// import * as sqs from 'aws-cdk-lib/aws-sqs'
// import * as events from 'aws-cdk-lib/aws-events'
// import * as targets from 'aws-cdk-lib/aws-events-targets'
// import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources'
// import * as apigateway from 'aws-cdk-lib/aws-apigateway'
// import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
// import { Asset } from 'aws-cdk-lib/aws-s3-assets'

// import { DB_SERVICE_SCRAPE } from '@service-scrape/lib-db_service_scrape'
// import { functionDefaults } from '@infra/common'

export class StackServiceScrapeQuery extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        NagSuppressions.addStackSuppressions(this, [])

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

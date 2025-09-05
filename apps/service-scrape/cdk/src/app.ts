#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { ServiceScrapeStack } from './service-scrape-stack.ts'
import { Aspects } from 'aws-cdk-lib'
import { AwsSolutionsChecks, ServerlessChecks } from 'cdk-nag'

const app = new cdk.App()

// Lint app
const cdkNagger = Aspects.of(app)
cdkNagger.add(new ServerlessChecks({ verbose: true }))
cdkNagger.add(new AwsSolutionsChecks({ verbose: true }))

new ServiceScrapeStack(app, 'NewHomie-ServiceScrape-Dev', {
    env: {
        // Deploy to Melbourne region
        region: 'ap-southeast-4',
    },
    tags: {
        app: 'NewHomie',
        stage: 'dev',
    },
})

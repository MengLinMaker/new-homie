#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { Aspects } from 'aws-cdk-lib'
import { AwsSolutionsChecks, ServerlessChecks } from 'cdk-nag'
import { StackServiceScrapeQuery } from './StackServiceScrapeQuery.ts'

const app = new cdk.App()

// Lint app
const cdkNagger = Aspects.of(app)
cdkNagger.add(new ServerlessChecks({ verbose: true }))
cdkNagger.add(new AwsSolutionsChecks({ verbose: true }))

new StackServiceScrapeQuery(app, 'NewHomie-StackServiceScrapeQuery-Dev', {
    env: {
        region: 'ap-southeast-2',
    },
    tags: {
        app: 'NewHomie',
        stage: 'dev',
    },
})

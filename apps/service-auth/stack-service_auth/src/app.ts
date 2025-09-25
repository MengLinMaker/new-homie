#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { Aspects } from 'aws-cdk-lib'
import { AwsSolutionsChecks, ServerlessChecks } from 'cdk-nag'
import { StackServiceAuth } from './StackServiceAuth.ts'

const app = new cdk.App()

// Lint app
const cdkNagger = Aspects.of(app)
cdkNagger.add(new ServerlessChecks({ verbose: true }))
cdkNagger.add(new AwsSolutionsChecks({ verbose: true }))

new StackServiceAuth(app, 'NewHomie-StackServiceAuth-Dev', {
    production: false,
    env: {
        region: 'ap-southeast-2',
    },
    tags: {
        app: 'NewHomie',
        stage: 'dev',
    },
})

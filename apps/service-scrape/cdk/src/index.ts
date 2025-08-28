#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { ServiceScrapeStack } from './service-scrape-stack.ts'

const app = new cdk.App()
new ServiceScrapeStack(app, 'ServiceScrapeStack')

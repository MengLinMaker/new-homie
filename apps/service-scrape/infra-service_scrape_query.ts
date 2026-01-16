/// <reference path="../../.sst/platform/config.d.ts" />

import { ApiGatewayV2, OTEL_ENV } from '../infra-common'
import { basePath } from './function-query_freemium/src'
import { DB_SERVICE_SCRAPE } from './lib-db_service_scrape/src/index'
import path from 'node:path'

const dirname = './apps/service-scrape'

const FunctionQueryFreemium = new sst.aws.Function('FunctionQueryFreemium', {
    handler: path.join(dirname, './function-query_freemium/src/index.handler'),
    architecture: 'arm64',
    runtime: 'nodejs22.x',
    timeout: '3 seconds',
    concurrency: { reserved: 10 },
    environment: { ...OTEL_ENV, DB_SERVICE_SCRAPE },
})

ApiGatewayV2.route(
    `ANY ${basePath}/{proxy+}`,
    FunctionQueryFreemium.arn,
    // {
    //     auth: { iam: true },
    // },
)

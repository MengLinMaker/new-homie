/// <reference path="../../.sst/platform/config.d.ts" />

import path from 'node:path'
import { ApiGatewayV2, subdomain } from '../infra-common'

const dirname = './apps/frontend'

new sst.aws.StaticSite('WebApp', {
    build: {
        command: 'npm run build',
        output: './dist',
    },
    path: path.join(dirname, './web'),
    router: subdomain('www'),
    environment: {
        VITE_API_URL: ApiGatewayV2.url,
    },
})

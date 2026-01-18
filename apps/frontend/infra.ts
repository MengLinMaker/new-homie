/// <reference path="../../.sst/platform/config.d.ts" />

import path from 'node:path'
import { ApiGatewayV2, subdomain } from '../infra-common'

const DIRNAME = './apps/frontend'

new sst.aws.StaticSite('WebApp', {
    build: {
        command: 'npm run build',
        output: './dist',
    },
    path: path.join(DIRNAME, './web'),
    router: subdomain('www'),
    environment: {
        VITE_API_URL: ApiGatewayV2.url,
        VITE_CLERK_PUBLISHABLE_KEY: 'pk_test_ZW5oYW5jZWQtZ29zaGF3ay02Ni5jbGVyay5hY2NvdW50cy5kZXYk',
    },
})

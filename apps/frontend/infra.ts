/// <reference path="../../.sst/platform/config.d.ts" />

import path from 'node:path'
import { domain, router } from '../infra-common'

const dirname = './apps/frontend'
const subdomainSuffix = $app.stage === 'production' ? '' : `-${$app.stage}`

new sst.aws.StaticSite('WebApp', {
    domain: `www${subdomainSuffix}.newhomie.org`,
    build: {
        command: 'npm run build',
        output: path.join(dirname, './web/dist'),
    },
    path: path.join(dirname, './web'),
    router: {
        instance: router,
        domain: `www.${domain}`,
    },
})

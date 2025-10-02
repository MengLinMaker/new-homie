/// <reference path="../../../.sst/platform/config.d.ts" />

import path from 'node:path'

const dirname = './apps/web/app'
const subdomainSuffix = $app.stage === 'production' ? '' : `-${$app.stage}`

new sst.aws.StaticSite('WebApp', {
    domain: `www${subdomainSuffix}.newhomie.org`,
    build: {
        command: 'npm run build',
        output: path.join(dirname, './dist'),
    },
})

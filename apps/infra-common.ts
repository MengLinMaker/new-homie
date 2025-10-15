import { ENV as OTEL_ENV } from './observability/lib-opentelemetry/src/env'

export { OTEL_ENV }

// Domain layout inspired by https://sst.dev/docs/configure-a-router
const domain = $app.stage === 'production' ? 'newhomie.com' : 'dev.newhomie.com'
// : $app.stage === 'dev'
//     ? 'dev.newhomie.com'
//     : `${$app.stage}.dev.newhomie.com`

const router = new sst.aws.Router('Router', {
    domain: {
        name: domain,
        aliases: [`*.${domain}`],
    },
})

export const subdomain = (sub: string) => ({
    instance: router,
    domain: `${sub}.${domain}`,
})

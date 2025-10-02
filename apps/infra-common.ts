import { ENV as OTEL_ENV } from './observability/lib-opentelemetry/src/env'

export { OTEL_ENV }

export const domain =
    $app.stage === 'production'
        ? 'newhomie.com'
        : $app.stage === 'dev'
          ? 'dev.newhomie.com'
          : undefined

export const router = new sst.aws.Router('Router', {
    domain: {
        name: domain,
        aliases: [`*.${domain}`],
    },
})

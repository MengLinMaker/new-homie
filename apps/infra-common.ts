import { ENV as OTEL_ENV } from './observability/lib-opentelemetry/src/env'

const router = new sst.aws.Router('Router', {
    domain: {
        name: 'newhomie.org',
        aliases: ['*.newhomie.com'],
    }
})

export { OTEL_ENV, router }

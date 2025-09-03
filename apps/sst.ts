import { ENV as OTEL_ENV } from './observability/lib-opentelemetry/src/env'

/**
 * Common arguments for sst setup
 */
// biome-ignore lint/suspicious/noExplicitAny: <assume typesafe>
export const commonArgs: any = {
    Function: {
        architecture: 'arm64',
        timeout: '3 seconds',
        // logging: false,
        versioning: true,
        environment: {
            NODE_OPTIONS: '--enable-source-maps',
            ...OTEL_ENV,
        },
        // TODO: remove after testing
        url: true,
    },
}

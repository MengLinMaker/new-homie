import { ENV as OTEL_ENV } from './observability/lib-opentelemetry/src/env'

export { OTEL_ENV }

// Domain layout inspired by https://sst.dev/docs/configure-a-router
const domain = $app.stage === 'production' ? 'newhomie.com' : 'dev.newhomie.com'
const permanentDomain = ['production', 'dev'].includes($app.stage)

export const Router = permanentDomain
    ? new sst.aws.Router('Router', {
          domain: {
              name: domain,
              aliases: [`*.${domain}`],
          },
      })
    : // Get existing 'dev' router for non-production stages
      sst.aws.Router.get('Router', 'E138HCJ1KMO4FO')

export const subdomain = (sub: string) => ({
    instance: Router,
    domain: `${sub}.${domain}`,
})

export const ApiGatewayV2 = new sst.aws.ApiGatewayV2('ApiGatewayV1', {
    domain: `api.${domain}`,
    cors: {
        allowOrigins: [
            `https://www.${domain}`,
            $app.stage === 'production' ? '' : 'http://localhost:5000',
        ],
    },
})

import path from 'node:path'
import { ENV as OTEL_ENV } from './observability/lib-opentelemetry/src/env'

export { OTEL_ENV }

// Domain layout inspired by https://sst.dev/docs/configure-a-router
const domain = $app.stage === 'production' ? 'newhomie.com' : `${$app.stage}.dev.newhomie.com`
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

export const ApiGatewayV2 = new sst.aws.ApiGatewayV2('ApiGatewayV2', {
    domain: `api.${domain}`,
    cors: {
        allowOrigins: [
            `https://www.${domain}`,
            $app.stage === 'production' ? '' : 'http://localhost:5000',
        ],
    },
})

const Repository = new awsx.ecr.Repository('new-homie-repository', {
    forceDelete: true,
})
export const createImage = (name: string, contextPath: string) =>
    new awsx.ecr.Image(name, {
        repositoryUrl: Repository.url,
        platform: 'linux/arm64',
        dockerfile: path.join('../../', contextPath, 'dockerfile'),
        context: path.join('../../', contextPath),
    })

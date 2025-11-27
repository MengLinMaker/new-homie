import type { paths } from './schema'
import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
// import { Resource } from 'sst/resource'

// console.log('API Gateway URL:', Resource.ApiGatewayV1.url)

export const $api = createClient(
    createFetchClient<paths>({
        // baseUrl: Resource.ApiGatewayV1.url,
        baseUrl: 'https://www.dev.newhomie.com',
    }),
)

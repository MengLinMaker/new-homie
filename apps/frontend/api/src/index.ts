import createFetchClient from 'openapi-fetch'
import createClient from 'openapi-react-query'
import type { paths } from './schema'

export const $api = createClient(
    createFetchClient<paths>({
        baseUrl: '',
    }),
)

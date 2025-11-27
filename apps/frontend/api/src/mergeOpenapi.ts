import { merge, isErrorResult } from 'openapi-merge'
import {
    basePath as BasePath_query_freemium,
    Openapi_query_freemium,
} from '@service-scrape/function-query_freemium'
import { exit } from 'node:process'
import { writeFileSync } from 'node:fs'

const mergeResult = merge([
    {
        oas: Openapi_query_freemium as never,
        pathModification: {
            prepend: BasePath_query_freemium,
        },
    },
])

if (isErrorResult(mergeResult)) {
    console.error(`${mergeResult.message} (${mergeResult.type})`)
    exit(1)
}
writeFileSync('src/openapi.json', JSON.stringify(mergeResult.output))

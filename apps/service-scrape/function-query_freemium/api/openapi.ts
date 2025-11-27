import { OpenAPIGenerator } from '@orpc/openapi'
import { ZodToJsonSchemaConverter } from '@orpc/zod/zod4'
import { router } from '../src/routes.ts'
import { commitId } from '@observability/lib-opentelemetry'
import { writeFileSync } from 'node:fs'

const generator = new OpenAPIGenerator({
    schemaConverters: [new ZodToJsonSchemaConverter()],
})

const spec = await generator.generate(router, {
    info: {
        title: 'function-query_freemium',
        version: commitId,
    },
})

writeFileSync('api/openapi.json', JSON.stringify(spec))

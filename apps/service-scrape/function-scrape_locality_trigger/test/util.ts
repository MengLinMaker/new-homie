import { OpenTelemetry } from '@observability/lib-opentelemetry'
import path from 'node:path'

export const suiteNameFromFileName = (filePath: string) =>
    // biome-ignore lint/style/noNonNullAssertion: <will exist>
    path.basename(filePath).split('.').shift()!

const otel = new OpenTelemetry()
export const { LOGGER } = otel.start({
    'service.name': '@service-scrape/function-scrape_locality_trigger/test',
})

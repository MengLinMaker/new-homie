import path from 'node:path'
import { OpenTelemetry } from '../src/OpenTelemetry'

export const suiteNameFromFileName = (filePath: string) =>
    // biome-ignore lint/style/noNonNullAssertion: <will exist>
    path.basename(filePath).split('.').shift()!

const otel = new OpenTelemetry()
export const { LOGGER, TRACER } = otel.start({
    'service.name': '@observabilitylib-opentelemetry',
})

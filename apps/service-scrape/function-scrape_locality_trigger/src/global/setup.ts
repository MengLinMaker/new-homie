import { OpenTelemetry } from '@observability/lib-opentelemetry'

export const SERVICE_NAME = 'function-scrape_locality_trigger'

const otel = new OpenTelemetry()
export const { LOGGER } = otel.start({
    'service.name': SERVICE_NAME,
})

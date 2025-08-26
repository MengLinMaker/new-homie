import { startOpenTelemetry } from '@observability/lib-opentelemetry'

export const SERVICE_NAME = 'function-scrape_locality'

startOpenTelemetry(SERVICE_NAME)

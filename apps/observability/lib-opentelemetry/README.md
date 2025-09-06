# @service-scrape/lib-opentelemetry
A library to setup opentelemetry for node.js servers

### ENV secrets
These [OTLP exporter config variables](https://opentelemetry.io/docs/languages/sdk-configuration/otlp-exporter/) are required in production:
- `OTEL_EXPORTER_OTLP_ENDPOINT`
- `OTEL_EXPORTER_OTLP_HEADERS`
- `OTEL_LOG_LEVEL`

The default values point to the local Grafana LGTM docker instance.

### Design
Service versioning uses git commit id to potentially locate where errors are introduced.

As JavaScript errors can throw anything, this should be handled internally messaging. By default, conventions are handled too.

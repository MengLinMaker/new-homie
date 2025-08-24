# @observability/root
Observabiliy (metrics, logs and traces) is used debug errors in production.

### Observability tech stack
The [Grafana LGTM](https://grafana.com/blog/2025/07/08/observability-in-under-5-seconds-reflecting-on-a-year-of-grafana/otel-lgtm/) stack is chosen for observability:
- able to run locally through docker-compose
- dashboards can exported and imported as json
- observability infrastructure can be outsourced to Grafana cloud
- Extensive use and proven scalability

### OpenTelemetry standard
OTel is the industry standard for collecting observability data.
Here is a quick [OTel overview for Node.js](https://www.youtube.com/watch?v=NbVVZlSsvvM)

All metrics, logs and traces are named according to [OTel semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/).

AWS lambda functions can be instrumented with [OTel Lambda Layers](https://opentelemetry.io/docs/languages/js/serverless/).

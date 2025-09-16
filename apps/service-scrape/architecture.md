# @service-scrape
Service for scraping and serving property and amenities data.

## TODO
- Create read functions using hono.

## Architecture
### Observability
Grafana is used to track scraping progress and errors. [This dashboard snapshot](https://menglinmaker.grafana.net/dashboard/snapshot/wBuTNydyAvyK4VNUV9YjPakuzfWzlkzN?var-heatmap_interval=30s&orgId=0&from=2025-09-15T14:30:00.000Z&to=2025-09-15T20:00:00.000Z&timezone=browser&var-log_level=error&var-log_level=warn&var-log_level=fatal&var-service_name=function-scrape_locality_trigger&var-service_name=function-scrape_locality&refresh=1m) demonstrates how errors are captured and correlated with heatmaps for the type of errors and location and scrape worker duration.

### Shared library
`lib-db_service_scrape`
- Postgis database query builder, allowing spatial queries - Chosen over MySQL limited spatial support and MSSQLSpatial for open source and reliability.
- Kysley query builder chosen for query flexibility and typesafety.

`lib-australia_amenity`
- Reformats amenity data into exportable json files.

### Infra stacks
CQRS pattern is used to address the different architectural characteristics required for read and write:

`stack-service_scrape_pipeline` - requires progress persistence and ease of operation.
- `function-scrape_locality_trigger`
    - Batch send localities that need to be scraped to queue.
- [AWS SQS](https://aws.amazon.com/sqs/) queue:
    - Persists progress, limit speed (min concurrent 2 receivers) and configure retry.
    - Alternatively, [AWS Batch](https://aws.amazon.com/batch/) is more cost efficient, without IP rotation.
- `function-scrape_locality`
    - Scraper worker processes raw data and writes to database.
    - Is idempotent for the day - idempotency handled in database.

`stack-service_scrape_query` - requires fast reads.
    - TBA

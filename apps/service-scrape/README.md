# Scrape service
Service for scraping and serving property and amenities data.

### Architecture
CQRS pattern for different read/write requirements:
**write: easy to operate**
  - Error handling: error as values with continue/retry for reliability
  - persist progress in an SQS queue
  - Limit speed with single worker
**read: fast**
  - Error handling: global error as values to keep things simple
  - caching successful GET requests in cdn to reduce load and cost (no need for redis)

Logging with OTel distributed tracing and Serilog to identify erroneous input to functions.

### 0. Script
Scripts is used to initialise amenities data that does not change often into the database.

### 1. BatchTrigger function
Localities as unit of progress. Scrapes Australian localities, then sendMesageBatch() to SQS queue for persistence.

### 2. BatchScrapeSuburbs function
Single concurrency scraper worker that processes raw data and writes to database.

Hono.js TypeScript is chosen due to the flexibility of `fetch` without compromising type safety.

### 3. Postgres database
We require complex spatial and time series queries. SQL is prefered for complex queries:
  - Postgres has postgis extension for spatial queries.
  - MySQL does have spatial data types. But not as featureful. Side note: [5.5 has issues - does not follow SQL standard closely](https://vimeo.com/43536445#t=293s).
  - SQL Server is licenced.

Postgres extensions to consider:
  - postgis: well maintained geography features
  - pg_partman: partition tables (especially time series)
  - pg_stat_statements: track query performance

Lower level ORM is prefered to ensure good SQL queries are used: Dapper with DbUp.

### 4. ReadOLTP function
Hono is used due to simplicity and edge focused.

### Misc
  - Drizzle orm: keep low level control, prefer to process where the data is (postgres db)

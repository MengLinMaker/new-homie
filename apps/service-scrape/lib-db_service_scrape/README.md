# @service-scrape/lib-db_service_scrape
Australian property database for mostly OLTP and some OLAP workloads.
Database logic will be shared between separate serverless functions.

### Chosen database - Posgres with Postgis
We require complex spatial and time series queries. SQL is prefered for complex queries:
  - Postgres has postgis extension for spatial queries.
  - MySQL does have spatial data types. But not as featureful. Side note: [5.5 has issues - does not follow SQL standard closely](https://vimeo.com/43536445#t=293s).
  - SQL Server is licenced.

Postgres extensions to consider:
  - postgis: well maintained geography features
  - pg_partman: partition tables (especially time series)
  - pg_stat_statements: track query performance

### Choosing an SQL query builder - Kysely
As performance and flexibility are top priority, a query builder is prefered over ORM.

Ideally the query builder should provide linting capabilities through eslint plugins or type checking. Libraries considered:

  - Drizzle: Restrictive codegen migrations with  limited type safety (despite the claims). [Rollback has yet to be implemented](https://github.com/drizzle-team/drizzle-orm/discussions/1339)
  - Kysely: Sparse documentation, [better type safety](https://github.com/thetutlage/meta/discussions/8) with more traditional migration scripts. Not declarative.

### Database uri dependency injection
Allow different uris for unit testing and integration testing.
[Testcontainer](https://node.testcontainers.org/features/images/) is used to spin up a PostGis container. The "postgis.dockerfile" image can be used in all "service-scrape" sub packages.

### Export DB_SERVICE_SCRAPE env variable
This export standardises the database uri shared among multiple services.

### Design guide
The database design follows to these guidelines:
 - Design guide: https://wiki.postgresql.org/wiki/Don't_Do_This
 - Use int() instead of serial() for SQL standard compliance: https://www.enterprisedb.com/blog/postgresql-10-identity-columns-explained
 - Use text() and prefer text constraint: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS

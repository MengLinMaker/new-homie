# lib-db_service_scrape
Australian property database for mostly OLTP and some OLAP workloads.
Database logic will be shared between separate serverless functions.

### Choosing an SQL query builder - Kysely
As performance and flexibility are top priority, a query builder is prefered over ORM.

Ideally the query builder should provide linting capabilities through eslint plugins or type checking. Libraries considered:

  - Drizzle: Restrictive codegen migrations with  limited type safety (despite the claims). [Rollback has yet to be implemented](https://github.com/drizzle-team/drizzle-orm/discussions/1339)
  - Kysely: Sparse documentation, [better type safety](https://github.com/thetutlage/meta/discussions/8) with more traditional migration scripts. Not declarative.

### Database uri dependency injection
Allow different uris for unit testing and integration testing.
Docker-compose is used to spin up a PostGis container - Testcontainer does not support PostGis for Arm64.

### Export DB_SERVICE_SCRAPE env variable
This export standardises the database uri shared among multiple services.

### Design guide
The database design follows to these guidelines:
 - Design guide: https://wiki.postgresql.org/wiki/Don't_Do_This
 - Use int() instead of serial() for SQL standard compliance: https://www.enterprisedb.com/blog/postgresql-10-identity-columns-explained
 - Use text() and prefer text constraint: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS

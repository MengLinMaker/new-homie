# lib-db_service_scrape
Database for home info.

### Why a separate library?
Database logic will be shared between separate serverless functions. This package also acts as an abstraction layer for testing purposes.

### Choosing an ORM
As performance an storage size are top priority, a lower level query builder is prefered.

Ideally the query builder should provide linting capabilities through eslint plugins or type checking.

  - Drizzle: Featureful with more convoluted query building and restrictive migrations. Limited type safety (despite the claims)
  - Kysely: Sparse documentation, but otherwise capable with more manual work

Kysely is a much better choice for:
  - type safety: https://github.com/thetutlage/meta/discussions/8
  - Drizzle cannot migrate down: https://github.com/drizzle-team/drizzle-orm/discussions/1339

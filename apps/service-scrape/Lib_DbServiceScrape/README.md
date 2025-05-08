# Lib_DbServiceScrape
Database for home info.

### Why a separate library?
Database logic will be shared between separate serverless functions. This package also acts as an abstraction layer for testing purposes.

### Choosing an ORM
As performance an storage size are top priority, a lower level query builder is prefered.

Ideally the query builder should provide linting capabilities through eslint plugins or type checking.

  - Drizzle: Restrictive codegen migrations with  limited type safety (despite the claims). [Rollback has yet to be implemented](https://github.com/drizzle-team/drizzle-orm/discussions/1339)
  - Kysely: Sparse documentation, [better type safety](https://github.com/thetutlage/meta/discussions/8) with more manual work for migrations. State of database schema is more difficult to grasp. Not declarative.

[Drizzle to Kysely converter](https://github.com/drizzle-team/drizzle-kysely) by the Drizzle team could solve the issue.

### Design guide
The database design follows to these guidelines:
 - Design guide: https://wiki.postgresql.org/wiki/Don't_Do_This
 - Use int() instead of serial() for SQL standard compliance: https://www.enterprisedb.com/blog/postgresql-10-identity-columns-explained
 - Use text() and prefer text constraint: https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-CHECK-CONSTRAINTS

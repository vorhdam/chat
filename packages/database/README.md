# Database

This package exports a Prisma client which is used for accessing the database.

Prisma is an ORM which basically allows us to create a typesafe connection between our code and an SQL database (in our case Postgres). While it is a bit slower than DrizzleORM it allows us to create schemas and use huge abstractions that can speed up development.

Prisma methods should only be used from the server! That is why this package imports `server-only`, a package that prevents Prisma being bundled into the client.

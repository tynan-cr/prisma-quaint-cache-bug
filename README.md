# Prisma Quaint Cache Bug Reproduction

## Summary
This repository has a minimal reproduction of a bug in Prisma 4.2.1 where Quaint (one library used in the Prisma query engine) will cache a version of the SQL query in such a way that subsequent usages will fail in a very non-obvious way.

To see the symptoms, run:
```
1. nvm use
2. yarn install
3. npx prisma generate
4. npx prisma migrate dev
5. docker-compose up -d
6. yarn build
7. yarn start
```

You will see the Rust code that powers the Prisma query engine throw an error. If you switch the order of lines 14 and 15 in main.ts the error goes away.

This is because when the SQL query is first made, the query and parameter types are passed down to tokio_postgres and tokio_postgres returns the types that the prepared statement parameter substitution should use (in this case, it thinks parameter 1 should be of type `UUID`, when `undefined` is passed via the JS client).

In `src/connector/postgres.rs:633` in the `prisma/quaint` library, this parameter type is cached, so when the next request (with type `string[]` for the parameter is passed from JS), then the following error is thrown:
```
Couldn't serialize value `Some([Text(Some("..."))])` into a `uuid`. Value is a list but `uuid` is not.'
```

If you switch lines 14 and 15 in `main.ts` then the cache is hydrated with type `Array[Text]` and the next call with undefined goes through without error due to casting.

This behavior leads to bizarre nondeterministic runtime failures in Quaint if the same query text is used with different parameter types in response to non-deterministic input (such as responding to network queries)





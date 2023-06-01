# authjs-edgedb
Bare implementation of a [auth.js](https://authjs.dev/) adapter using [edgedb](https://www.edgedb.com/). I don't have any plans to make this a proper package, but if you want to make a pull request for one, do so.
## Setup
1. Copy contents of the [default.esdl](/default.esdl) to your own edgedb schema
2. Run an edgedb [migration](https://www.edgedb.com/docs/cli/edgedb_migration/index)
3. npm i @auth/core
4. [Generate typescript files](https://www.edgedb.com/docs/clients/js/generation#running-a-generator) for edgeql-js
5. Copy and change the contents of [adapter.ts](/adapter.ts) to point the generated files.
6. Import and use like any other auth.js adapter
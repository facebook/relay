---
id: prerequisites
title: Prerequisites
---

To get started building Relay applications, you will need two things:

### A GraphQL Schema

A description of your data model with an associated set of resolve methods that know how to fetch any data your application could ever need.

GraphQL is designed to support a wide range of data access patterns. In order to understand the structure of an application's data, Relay requires that you follow certain conventions when defining your schema. These are documented in the [GraphQL Relay Specification](graphql-relay-specification.html).

- **[graphql-js](https://github.com/graphql/graphql-js)** on [npm](https://www.npmjs.com/package/graphql)

  General-purpose tools for building a GraphQL schema using JavaScript

- **[graphql-relay-js](https://github.com/graphql/graphql-relay-js)** on [npm](https://www.npmjs.com/package/graphql-relay)

  JavaScript helpers for defining connections between data, and mutations, in a way that smoothly integrates with Relay.

### A GraphQL Server

Any server can be taught to load a schema and speak GraphQL. Our [examples](https://github.com/relayjs/relay-examples) use Express.

- **[express-graphql](https://github.com/graphql/express-graphql)** on [npm](https://www.npmjs.com/package/express-graphql)
- **[graphql-up](https://github.com/graphcool/graphql-up)** on [npm](https://www.npmjs.com/package/graphql-up)
- **[Graphcool](https://www.graph.cool/)** ([Quickstart tutorial](https://www.graph.cool/docs/quickstart/))

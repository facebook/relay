---
id: getting-started
title: Getting Started
layout: docs
category: Quick Start
permalink: docs/getting-started.html
next: tutorial
---

To get started building Relay applications, you will need three things:

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

### Relay

Relay speaks to GraphQL servers through a network layer. The [network layer](https://facebook.github.io/relay/docs/guides-network-layer.html) that ships with Relay is compatible with express-graphql out of the box, and will continue to evolve as we add new features to the transport.

The best way to get started right now is to take a look at how these three parts come together to form a working example. The tutorial on the next page will lead you through an example application, using the [Relay Starter Kit](https://github.com/facebook/relay-starter-kit), to give you an idea of how you can start using Relay on yours.

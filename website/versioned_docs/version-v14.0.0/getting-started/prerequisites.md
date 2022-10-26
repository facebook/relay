---
id: prerequisites
title: Prerequisites
slug: /getting-started/prerequisites/
description: Prerequisites for setting up Relay
keywords:
- prerequisites
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';


Before getting started with Relay, bear in mind that we assume that the following infrastructure has already been set up, as well as some level of familiarity with the topics below.

## JavaScript

Relay is a framework built in JavaScript, so we assume familiarity with the JavaScript language.

## React

Relay is a framework for data management with the primary supported binding for React applications, so we assume that you are already familiar with [React](https://reactjs.org/).

## GraphQL

We also assume basic understanding of [GraphQL](http://graphql.org/learn/). In order to start using Relay, you will also need:

### A GraphQL Schema

A description of your data model with an associated set of resolve methods that know how to fetch any data your application could ever need.

GraphQL is designed to support a wide range of data access patterns. In order to understand the structure of an application's data, Relay requires that you follow certain conventions when defining your schema. These are documented in the [GraphQL Server Specification](../../guides/graphql-server-specification).

-   **[graphql-js](https://github.com/graphql/graphql-js)** on [npm](https://www.npmjs.com/package/graphql)

    General-purpose tools for building a GraphQL schema using JavaScript

-   **[graphql-relay-js](https://github.com/graphql/graphql-relay-js)** on [npm](https://www.npmjs.com/package/graphql-relay)

    JavaScript helpers for defining connections between data, and mutations, in a way that smoothly integrates with Relay.

### A GraphQL Server

Any server can be taught to load a schema and speak GraphQL. Our [examples](https://github.com/relayjs/relay-examples) use Express.

-   **[express-graphql](https://github.com/graphql/express-graphql)** on [npm](https://www.npmjs.com/package/express-graphql)


<DocsRating />

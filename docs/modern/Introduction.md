---
id: relay-modern
title: Introduction to Relay Modern
layout: docs
category: Relay Modern
permalink: docs/relay-modern.html
next: new-in-relay-modern
---

Relay Modern is a new version of Relay designed from the ground up to be easier to use, more extensible and, most of all, able to improve performance on mobile devices. Relay Modern accomplishes this with static queries and ahead-of-time code generation.

## Getting Started

### Upgrade to react-relay v1.0.0

Relay v1.0 introduces the Relay Modern API. To get the release-candidate for Relay v1.0, install the `@dev` build:

```sh
yarn add react-relay@dev
```

When upgrading an existing Relay app, replace all `require('react-relay')` with `require('react-relay/classic')` to continue to import the Relay Classic API.

### Set up babel-plugin-relay

Relay Modern requires a Babel plugin to convert GraphQL to runtime artifacts:

```sh
yarn add --dev babel-plugin-relay@dev
```

Add `"relay"` to the list of plugins your .babelrc file. See [the docs](./babel-plugin-relay.html) if upgrading an existing Relay app.

### Set up relay-compiler

Relay Modern's ahead-of-time compilation requires the new Relay Compiler:

```sh
yarn add --dev relay-compiler@dev
```

Run the Relay Compiler after making changes to any GraphQL in your Relay application. It may be helpful to add it as a `yarn script`. Add an entry to `"scripts"` in your package.json file.

```js
"relay": "relay-compiler --src ./src --schema path/schema.graphql"
```

Then after making edits to your application files, just run `yarn run relay` to generate new files, or `yarn run relay -- --watch` to run the compiler as a long-lived process which automatically generates new files whenever you save.


## Migrating to Relay Modern

Migrating a Relay Classic app to Relay Modern doesn't require rewriting from
scratch. Instead, convert one component at a time to the Relay Modern API while
continuing to have a working app. Once all components have been converted, the
smaller and faster Relay Modern runtime can be used.

During this migration, use the [Relay Compat](./relay-compat.html) tools and APIs to work with both Relay Classic and Relay Modern.


## Idea

[React](https://facebook.github.io/react/) allows views to be defined as components where every component is responsible for rendering a part of the UI. Composing other components is how to build complex UIs. Each React component doesn't need to know the inner workings of the composed components.

Relay couples React with GraphQL and develops the idea of encapsulation further. It allows components to specify what data they need and the Relay framework provides the data. This makes the data needs of inner components opaque and allows composition of those needs. Thinking about what data an app needs becomes localized to the component making it easier to reason about what fields are needed or no longer needed.

## Terminology

### Container

Relay Modern containers take a usual React component (UI) and the collocated GraphQL queries (data requirements), and return a higher order React component. The basic container is the generic [fragment container](./FragmentContainer.html). Relay Modern also provides more advanced containers for dynamic use cases (which were previously handled in Relay Classic via `setVariables`):

### Refetch Container ("See More")

[`createRefetchContainer`](./RefetchContainer.html) addresses the "see more" use case, where you have an initial view that shows a subset of the available data, and you wish to fetch additional information — or re-issue the original query with some new variables — and then redisplay the component.

### Pagination Container

This is a specialization of the general-purpose refetch container that is tailored for the common scenario of paginating through a collection of items by fetching successively more pages of data. See [`createPaginationContainer`](./PaginationContainer.html) for details.

### Query Renderer

`QueryRenderer` manages the execution of the GraphQL query. It sends the query with given parameters, parses the response, saves the data to the internal store, and finally renders the view. [More details](./QueryRenderer.html).

### Relay Environment

The Relay Environment is a self-contained environment with its own in-memory cache, and exports public APIs of Relay core. It can be accessed via `this.props.relay.environment`. Most of the time, you don't need to interact with this lower level API, but you will need it [when doing a mutation](./mutations.html). For more details about the Environment, see [this page](./relay-environment.html).

## Workflow

One of the big ideas behind the new API is that execution can be made a lot more efficient by moving work ahead-of-time: from to runtime of the app to the build-time. As such, changes to GraphQL fragments require a build step to regenerate a set of artifacts. More on [the Relay Compiler](./relay-compiler.html).

## The difference between Relay Classic and Relay Modern

### Everything is static and persistable

The updated Relay engine uses only static GraphQL queries — that is, queries that can be known at build-time — and doesn't do any dynamic query construction at runtime. Because the queries can be statically determined, they can also be persisted on the server ahead of time: this means that request size can be drastically reduced by sending an ID for a previously persisted query rather than the full query text.

### Mutation is imperative

Mutation — performing updates to the data — is an intrinsically imperative, mutative operation. Relay Classic provides a declarative API for mutation and does the dirty work behind the scenes. However, the amount of "magic" involved made it confusing and hard to debug, especially for connection fields. Thus, in Relay Modern, we provide a set of imperative APIs and let the engineers take full control over the data. Check out the [Optimistic Updates](#) section and see how it works.

### Built in Flow support

The build step for the new API automatically creates (optional) [Flow](https://flow.org/) types for the structure of the props enabling auto-completion in Flow-aware tools and type-safety checks.

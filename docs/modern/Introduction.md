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
scratch. Instead, you can convert one component at a time to the Relay Modern API while
continuing to have a working app. Once all components have been converted, the
smaller and faster Relay Modern runtime can be used.

During this migration, use the [Relay Compat](./relay-compat.html) tools and APIs to work with both Relay Classic and Relay Modern.


## Idea

[React](https://facebook.github.io/react/) allows views to be defined as components where every component is responsible for rendering a part of the UI. Composing other components is how to build complex UIs. Each React component doesn't need to know the inner workings of the composed components.

Relay couples React with GraphQL and develops the idea of encapsulation further. It allows components to specify what data they need and the Relay framework provides the data. This makes the data needs of inner components opaque and allows composition of those needs. Thinking about what data an app needs becomes localized to the component making it easier to reason about what fields are needed or no longer needed.

## Terminology

### Container

Relay Modern containers combine standard React components with a description of their data requirements, expressed as one or more GraphQL fragments. Each container is itself a standard React component that can be rendered using the standard React API (e.g. `<YourComponent prop={...} />`). When rendered, a container will read the data for its fragment from the Relay cache. As the fragment data changes - for example due to a mutation, subscription, or updated query response - the container will automatically re-render the component.

[`createFragmentContainer`](./fragment-container.html) returns a basic container that cannot fetch additional data beyond what is declared in its fragment(s). Relay Modern also provides more advanced containers for dynamic use cases (which were previously handled in Relay Classic via `setVariables`):

#### Refetching Data (aka "See More")

[`createRefetchContainer`](./refetch-container.html) is a variation of `createFragmentContainer` that addresses the "see more" use case, where a subset of data is rendered initially and then additional data is fetched on demand. Refetch containers initially fetch data for their fragments just like fragment containers, but also offer a `refetch()` method by which additional data can be fetched, or the container can be re-rendered to read data using different variables.

### Pagination Container

This is a specialization of the general-purpose refetch container that is tailored for the common scenario of paginating through a collection of items by fetching successively more pages of data. See [`createPaginationContainer`](./pagination-container.html) for details.

### Query Renderer

[`QueryRenderer`](./query-renderer.html) manages the execution of the GraphQL query. It sends the query with given variables, parses the response, saves the data to the internal cache, and finally renders the view.

### Relay Environment

An instance of a [Relay Environment](./environment.html) encapsulates an in-memory cache of GraphQL data and a network layer that provides access to your GraphQL server. The Environment object is typically not used by developers directly, instead it is passed to each [`QueryRenderer`](./query-renderer.html), which uses the environment to access, modify, and fetch data. Within a container, the current environment can be accessed via `this.props.relay.environment`. This is most commonly used to [execute a mutation](./mutations.html).

### Network layer

Applications must supply a [Network Layer](./network-layer.html) when creating an instance of a Relay Environment. The network layer is an object confirming to a simple interface through which Relay can execute queries, mutations, and subscriptions. Essentially, this object teaches Relay how to talk to your GraphQL server.

## Workflow

One of the big ideas behind the new API is that execution can be made a lot more efficient by moving work ahead-of-time: from the runtime of the app to the build-time. As such, changes to GraphQL fragments require a build step to regenerate a set of artifacts. More on [the Relay Compiler](./relay-compiler.html).

## Comparing Relay Classic and Relay Modern

Relay Modern enables a variety of new features. Some are available via the Compat API, while others require upgrading fully to the Modern runtime. See [what's new in Relay Modern](./new-in-relay-modern.html) for more details.

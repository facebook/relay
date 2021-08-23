---
id: glossary
title: Glossary
slug: /glossary/
description: Relay terms glossary
keywords:
- glossary
---

import DocsRating from '@site/src/core/DocsRating';
import {FbInternalOnly, OssOnly} from 'internaldocs-fb-helpers';

## 3D

Data-Driven Dependencies. Facebook's way of including the code to render a particular component if and only if it will actually be rendered. Canonical use cases are

* **Fields that are typically null**, and which are only rendered when not null.
* **Unions**. For example, the core news feed item has many different variants, each of which is a separate React component. Which one we render depends on the data (i.e. is "data-driven"). On a given feed, it is likely that most variants will not be rendered, and need not be downloaded.
* **Component can have different rendering strategies, depending on the data.**

<FbInternalOnly>

See the [@match](#match) directive, [@module](#module) directive and [the 3D guide](../guides/data-driven-dependencies).

</FbInternalOnly>

<OssOnly>

See the [@match](#match) directive and the [@module](#module) directive.

</OssOnly>

## Abstract Type

See [interface](#interface-graphql).

## Abstract Type Refinement

See [type refinement](#type-refinement). If type refinement is a way of conditionally including fields if a type implements a particular concrete type (such as `... on User { name }`), abstract type refinement refers to conditionally including fields if a type implements a particular abstract type (i.e. interface). So, `... on Actor { field }`.

## @arguments

A [directive](#directive) that modifies a [fragment spread](#fragment-spread) and is used to pass arguments (defined with [`@argumentDefinitions`](#argumentdefinitions)) to that fragment.

```graphql
...Story_story @arguments(storyId: "1234")
```

## @argumentDefinitions

A directive that modifies a fragment definition and defines the names of the local arguments that the fragment can take, as well as their type.

```graphql
fragment Store_story on Story
  @argumentDefinitions(storyId: {type: "ID!"}) {
  # etc
}
```

If a variable is used in a fragment but not included in an `@argumentDefinitions` directive, Relay will require that the fragment is only spread in queries which declare these variables, or in fragments which ultimately are spread in such a query.

<!-- TODO fix this link -->
Compare with [variables](#variables) and see the [relevant section](../guided-tour/rendering/variables) in the guided tour.

## AST

Abstract Syntax Tree. In Relay, the AST typically refers to the full Javascript object that Relay needs in order to be able to work with a query, subscription, mutation or fragment, though typically "the AST" will refer to a query, mutation or subscription AST.

A Relay AST can be one of two types: a `ConcreteRequest` (representing a query, mutation or subscription), or a `ReaderFragment` (representing a fragment.)

The default export of a `.graphql.js` file is an AST.

## Availability

The concept of availability refers to whether there is enough non-stale, non-invalidated data in the store to fulfill a particular request immediately, or whether a request to server needs to be made in order to fulfill that request.

## Babel Transform

A build-time transformation of the Javascript codebase, which turns calls to

```javascript
graphql`...`
```

into query ASTs (concrete requests.)

## Client Schema Extension

TODO

## CacheConfig

A value used to control how a query's response may be cached. Ultimately passed to `environment.execute`.

## Check

One of the core functions of the store. Given an operation, determines whether the store has all of the data necessary to render that operation. Calls `DataChecker.check`, which synchronously starts with the root node associated with the operation and walks the data in the store.

In practice, exposed as a method on `environment`.

In conjunction with the fetch policy, used by `loadQuery` (and other methods) to determine whether it is necessary to make a network request call to fulfill a query.

## Commit

After receiving a network response, the payload is committed, or written to the store.

Commit is also the verb used to describe initiating a mutation and writing its data to the store.

## Compiler

The piece of code which scans your Javascript files for `graphql` tagged nodes and generates the appropriate files (`.graphql.js` files, `$Parameters.js` files, etc.)

The generated output from the compiler is committed and checked into the repository.

## Concrete Request

An Abstract Syntax Tree representing a query, subscription or mutation.

The default export of a `.graphql.js` file corresponding to a query, subscription or mutation.

In addition, calls to `graphql`...`` are turned into concrete requests at build time via the Relay Babel transform.

**See the important safety notes at Preloadable Concrete Request.**

## Config

A file or javascript object which controls, among other things, which files are scanned by the Relay [compiler](#compiler) for your project.

## @connection

A directive which declares that a field implements the [connection](#connection) spec.

## Connection

<FbInternalOnly>
A field implementing the connection spec. See <a href="https://www.internalfb.com/intern/wiki/Graphql-connections-for-hack-developers/Connection-spec/">here</a> for more details on the spec, and the section of the guided tour on <a href="../guided-tour/list-data/pagination/">rendering list data and pagination</a>.
</FbInternalOnly>

<OssOnly>
A field implementing the connection spec. See the section of the guided tour on <a href="../guided-tour/list-data/pagination/">rendering list data and pagination</a>.
</OssOnly>

See also [`usePaginationFragment`](../api-reference/use-pagination-fragment).

## Container

A term for a higher order component that provided a child component with the data from queries and fragments. Associated with Relay Modern.

You should use the Relay hooks API when possible.

## Data Checker

A class exposing a single method, `check`, which synchronously starts with the root node associated with the operation and walks the data in the store. It determines whether the data in the store suffices to fulfill a given operation.

Called by `store.check`.

## DataID

The globally-unique identifier of a record. Can be generated on the client with [missing field handlers](#missing-field-handler). Usually corresponds to an Ent's ID (if available), but guaranteed to equal the value of the `__id` field.

[`updater`](#updater) and [`optimisticUpdater`](#optimisticupdater) functions are passed instances of [`RelaySourceSelectorProxy`](#recordproxy). Calling `.get(id)` with the DataID on a `RelaySourceSelectorProxy` will look up that item in the store, and return a proxy of it.

## Data Masking

Refers to the idea that a component should not be able to access any data it does declare in its fragment or query, even inadvertently. This prevents accidental coupling of data between components, and means that every component can be refactored in isolation. It negates the risk that removing a field in a child component will accidentally break a different component, allowing components to *move fast, with stable infrastructure*.

Also refers to the practice of hiding the data of child components from their parents, in keeping with the idea.

In Relay, a query declared like `query FooQuery { viewer { ...subcomponent_``viewer_name } }` will not be able to access the data declared by `subcomponent_viewer_name` without access to the `ReaderFragment` representing the `subcomponent_viewer_name` fragment.

See the [Thinking in Relay guide](../principles-and-architecture/thinking-in-relay#data-masking).

## @defer

A directive which can be added to a fragment spread to avoid blocking on that fragment's data.

See the [documentation](https://www.internalfb.com/intern/wiki/Relay/Web/incremental-data-delivery-defer-stream/#defer).

## Descriptor

Can refer to an `OperationDescriptor` or `RequestDescriptor`. Descriptors are types used internally to the Relay codebase, and generally, refer to an object containing the minimum amount of information needed to uniquely identify an operation or request, such as (for a `RequestIdentifier`), a node, identifier and variables.

## DevTools

An awesome Chrome extension for debugging Relay network requests, the Relay store and Relay events. Helpful for answering questions like "Why am I not seeing the data I expect to see?" "Why did this component suspend?" etc.

See the [documentation](https://www.internalfb.com/intern/wiki/Relay/Debugging_Guides/Relay_DevTools_Guide_For_Users/).

## Document

TODO

## Directive

A special instruction, starting with `@` and contained in a `graphql` literal or graphql file, which provides special instructions to the relay compiler. Examples include `@defer`, `@stream` and `@match`.

## Disposable

Any object which contains a `.dispose` method which takes no parameters and provides no return value. Many objects in Relay (such query references and entrypoint references) and the return value of many methods (such as calls to `.subscribe` or `.retain`) are disposables.

## Entrypoint

A lightweight object containing information on the components which need to be loaded (as in the form of calls to `JSResource`) and which queries need to be loaded (in the form of preloadable concrete requests) before a particular route, popover or other piece of conditionally loaded UI can be rendered.

All queries which are required for the initial rendering of a piece of UI should be included in that UI's entrypoint.

Entrypoints can contain queries and other entrypoints.

See also [preloadable concrete request](#preloadable-concrete-request) and [JSResource](#jsresource).

## Environment

An object bringing together many other Relay objects, most importantly a store and a network. Also, includes a publish queue, operation loader, scheduler and [missing fields handlers](#missing-field-handler).

Set using a `RelayEnvironmentProvider` and passed down through React context.

All non-internal Relay hooks require being called within a Relay environment context.

## Execute

Executing a query, mutation or subscription (collectively, an operation) roughly means "create a lazy observable that, when subscribed to, will make a network request fulfilling the operation and write the returned data to the store."

A variety of `execute` methods are exposed on the Relay environment.

## Fetch Policy

A string that determines in what circumstances to make a network request in which circumstances to fulfill the query using data in the store, if available. Either `network-only`, `store-and-network`, `store-or-network` or `store-only`. (Some methods do not accept all fetch policies.)

## Field

Basically, anything you can select using a query, mutation, subscription or fragment. For example, `viewer`, `comment_create(input: $CommentCreateData)` and `name` are all fields.

The GraphQL schema comprises many fields.

## Fragment

The fundamental reusable unit of GraphQL. Unlike queries, subscriptions and mutations, fragments cannot be queried on their own and must be embedded within a request.

Fragments can be spread into queries, mutations, subscriptions and other fragments.

Fragments can be standalone (as in `fragment Component_user on User { name }`) or inline, as in the `... on User { name }` in `query MyQuery { node(id: $id) { ... on User { name } } }`.

Fragments are always defined on a particular type (`User` in the example), which defines what fields can be selected within it.

## Fragment Identifier

A string, providing enough information to provide the data for a particular fragment. For example:

`1234{"scale":2}/Story_story/{"scale":2}/"4567"`

This identifies by its persist ID (`1234`), followed by the variables it accepts, followed by the `Story_story` fragment (which does not have a persist id) and the variables it uses, followed by the Data ID (likely, the `id` field) of whatever Story happened to be referenced.

## Fragment Reference

A parameter passed to `useFragment`. Obtained by accessing the value onto which a fragment was spread in another [query](#query), fragment, subscription or mutation. For example,

```javascript
const queryData = usePreloadedQuery(
  graphql`query ComponentQuery { viewer { account_user { ...Component_name } } }`,
  {},
);

// queryData.viewer is the FragmentReference
// Though this would usually happen in another file, you can
// extract the value of Component_name as follows:
const fragmentData = useFragment(
  graphql`fragment Component_name on User { name }`,
  queryData?.viewer?.account_user,
);
```

Just like a query reference and a graphql tagged literal describing a query (i.e. a concrete request) can be used to access the data from a query, a fragment reference and a graphql tagged literal describing a fragment (i.e. a reader fragment) can be used to access the data referenced from a fragment.

## Fragment Resource

An internal class supporting lazily loaded queries. Exposes two important methods:

* `read`, which is meant to be called during a component's render phase. It will attempt to fulfill a query from the store (by calling `environment.lookup`) and suspend if the data is not available. It furthermore writes the results from the attempted read (whether a promise, error or result) to an internal cache, and updates that cached value when the promise resolves or rejects.
* `subscribe`, which is called during the commit phase, and establishes subscriptions to the relay store.

If the component which calls `.read` successfully loads a query, but suspends on a subsequent hook before committing, the data from that query can be garbage collected before the component ultimately renders. Thus, components which rely on `FragmentResource` are at risk of rendering null data.

Compare to [query resource](#query-resource).

## Fragment Spec Resolver

TODO

## Fragment Spread

A fragment spread is how one fragment is contained in a query, subscription, mutation or other fragment. In the following example, `...Component_name` is a fragment spread:

```graphql
query ComponentQuery {
  viewer {
    account_user {
      ...Component_name
    }
  }
}
```

In order for a fragment to be spread in a particular location, the types must match. For example, if `Component_name` was defined as follows: `fragment Component_name on User { name }`, this spread would be valid, as `viewer.account_user` has type `User`.

## Garbage Collection

Relay can periodically garbage collect data from queries which are no longer being retained.

See more information in the [guided tour](https://www.internalfb.com/intern/wiki/Relay/guided-tour-of-relay/reusing-cached-data-for-rendering/#garbage-collection-in-re).

## GraphQLTaggedNode

This is the type of the call to

```js
graphql`...`
```

It is the union of a `ReaderFragment` and a `ConcreteRequest`.

## Handler

TODO

## ID

TODO

## @include

A directive that is added to fields, inline fragments and fragment spreads, and allows for conditional inclusion. It is the opposite of the [`@skip`](#skip) directive.

## @inline

TODO.

## Interface (GraphQL)

An *Interface* is an abstract type that includes a certain set of fields that a type must include to implement the interface.

You can spread an fragment on an interface onto a concrete type (for example `query MyQuery { viewer { account_user { ...on Actor { can_viewer_message } } }`) or a fragment on a concrete type onto an interface (for example `query MyQuery { node(id: 4) { ... on User { name } } }`). You are no longer allowed to spread a fragment on an interface onto an interface.

See also abstract type refinement.

## Invalidation

In certain cases, it is easy to determine the outcome of a mutation. For example, if you "like" a Feedback, the like count will increment and `viewer_did_like` will be set to true. However, in other cases, such as when you are blocking another user, the full impact on the data in your store is hard to determine.

For situations like these, Relay allows you to invalidate a record (or the whole store), which will cause the data to be re-fetched the next time it is rendered.

See the [section in the guide](https://www.internalfb.com/intern/wiki/Relay/guided-tour-of-relay/updating-data/#invalidating-data-during).

## JSResource

A lightweight API for specifying a that a React component should be loaded on demand, instead of being bundled with the first require (as would be the case if you imported or required it directly.)

This API is safe to use in entrypoint files.

<OssOnly>
See [the npm module](https://www.npmjs.com/package/jsresource).
</OssOnly>

## Lazy Loading

A query or entry point is lazy loaded if the request for the data occurs at render time.

Lazy loaded queries and entry points have performance downsides, are vulnerable to being over- and under-fetched, and can result in components being rendered with null data. They should be avoided.

## Linked Record

A linked record is a record that is directly accessible from another record. For example, in the query `query MyQuery { viewer { account_user { active_instant_game { id } } } }`, `active_instant_game` (which has the type `Application` is a linked record of `account_user`.

A linked record cannot be queried by itself, but must be queried by selecting subfields on it.

Compare to [value](#value).

## Literal

A GraphQL literal is a call to

```javascript
graphql`...`
```

in your code. These are pre-processed, and replaced at build time with a [GraphlQLTaggedNode](#graphqltaggednode) containing an [AST](#ast) representation of the contents of the literal.

## Lookup

One of the main methods exposed by the Relay store. Using a [reader selector](#reader-selector), traverses the data in the store and returns a [snapshot](#snapshot), which contains the data being read, as well as information about whether data is missing and other pieces of information. Also exposed via the Relay environment.

Calls [`Reader.read`](#reader).

## @match

A directive that, when used in combination with [@module](#module), allows users to download specific JS components alongside the rest of the GraphQL payload if the field decorated with @match has a certain type. See [3D](#3d).

## MatchContainer

A component that renders the component returned in conjunction with a field decorated with the [@match](#match) directive. See [3D](#3d).

## Missing Field Handler

A function that provides a [DataID](#dataid) for a field (for singular and plural linked fields) and default values (for scalar fields).

For example, you may have already fetched an item with id: 4, and are executing a query which selects `node(id: 4)`. Without a missing field handler, Relay would not know that the item with id: 4 will be returned by `node(id: 4)`, and would thus attempt to fetch this data over the network. Providing a missing field handler can inform Relay that the results of this selection are present at id: 4, thus allowing Relay to avoid a network request.

`getRelayFBMissingFieldHandlers.js` provides this and other missing field handlers.

## @module

A directive that, when used in combination with [@match](#match), allows users to specify which JS components to download if the field decorated with @match has a certain type. See [3D](#3d).

## Module

TODO

## Mutation

A mutation is a combination of two things: a mutation on the back-end, followed by query against updated data.

<FbInternalOnly>
See the [guide on mutations](../guided-tour/updating-data/graphql-mutations), and [this article](https://www.internalfb.com/intern/wiki/Graphql-for-hack-developers/mutation-root-fields/) on defining mutations in your hack code.
</FbInternalOnly>

<OssOnly>
See the [guide on mutations](../guided-tour/updating-data/graphql-mutations).
</OssOnly>

## Mutation Root Query

The root object of a mutation query. In an `updater` or `optimisticUpdater`, calling `store.getRootField('field_name')` will return the object from the mutation root query named `field_name`.

The fields exposed on this object are **not** the same as those available for queries, and differ across mutations.

## Network

Relay environments contain a `network` object, which exposes a single `execute` function. All network requests initiated by Relay will go through this piece of code.

This provides a convenient place to handle cross-cutting concerns, like authentication and authorization.

## Node

TODO

## Normalization

Normalization is the process of turning nested data (such as the server response) and turning it into flat data (which is how Relay stores it in the store.)

See the [response normalizer](#response-normalizer).

## Normalization Selector

A selector defines the starting point for a traversal into the graph for the purposes of targeting a subgraph, combining a GraphQL fragment, variables, and the Data ID for the root object from which traversal should progress.

## Notify

A method exposed by the store which will notify each [subscriber](#subscribe) whose data has been modified. Causes components which are rendering data that has been modified to re-render with new data.

## Observable

The fundamental abstraction in Relay for representing data that may currently be present, but may also only be available in the future.

Observables differ from promises in that if the data in an observable has already been loaded, you can access it synchronously as follows:

```javascript
const completedObservable = Observable.from("Relay is awesome!");
let valueFromObservable;
observable.subscribe({
  next: (value) => {
    valueFromObservable = value;
    /* this will execute in the same tick */
  },
});
console.log(valueFromObservable); // logs out "Relay is awesome!"
```

This is advantageous, as it allows Relay hooks to not suspend if data is already present in the store.

In Relay, observables are a partial implementation of [RxJS Observables](https://rxjs-dev.firebaseapp.com/guide/observable).

## Operation

In GraphQL, a query, subscription or mutation.

## Operation Descriptor

An object associating an [operation](#operation) (i.e. a query, mutation or subscription) and variables, and containing the three pieces of information that Relay needs to work with the data: [a reader selector](#reader-selector), a [normalization selector](#normalization-selector) and a [request descriptor](#request-descriptor).

The variables are filtered to exclude unneeded variables and are populated to include default values for missing variables, thus ensuring that requests that differ in irrelevant ways are cached using the same request ID.

## Operation Tracker

TODO

## Optimistic Update

TODO

## Optimistic Updater

TODO

## Pagination

Querying a list of data (a [connection](#connection)) in parts is known as pagination.

See the [graphql docs](https://graphql.org/learn/pagination/) and our [guided tour](../guided-tour/list-data/pagination).

## Payload

The value returned from the GraphQL server as part of the response to a request.

## Plural Field

A field for which the value is an array of [values](#value) or [records](#record).

## @preloadable

A directive that modifies queries and which causes relay to generate `$Parameters.js` files and preloadable concrete requests. Required if the query is going to be used as part of an entry point.

## Preloadable Concrete Request

A small, lightweight object that provides enough information to initiate the query and fetch the full query AST (the `ConcreteRequest`.) This object will only be generated if the query is annotated with `@preloadable`, and is the default export of `$parameters.js` files. It is only generated for queries which are annotated with `@preloadable`.

Unlike concrete requests (the default export of `.graphql.js` files), preloadable concrete requests are extremely light weight.

Note that entrypoints accept either preloadable concrete requests or concrete requests in the `.queries[queryName].parameters` position. However, ***because a concrete request is not a lightweight object, you should only include preloadable concrete requests here.***

Note also that preloadable queries have `id` fields, whereas other queries do not.

## Preloadable Query Registry

A central registry which will execute callbacks when a particular Query AST (concrete request) is loaded.

Required because of current limitations on dynamically loading components in React Native.

## Project

For Relay to process a file with a GraphQL literal, it must be included in a project. A project specifies the folders to which it applies and the schema against which to evaluate GraphQL literals, and includes other information needed by the Relay compiler.

<FbInternalOnly>
Projects are defined in a single [config](#config) file, found [here](https://www.internalfb.com/intern/diffusion/WWW/browse/master/scripts/relay/compiler-rs/config.www.json) and [here](https://www.internalfb.com/intern/diffusion/FBS/browse/master/xplat/relay/compiler-rs/config.xplat.json).
</FbInternalOnly>

## Profiler

TODO

## Publish

One of the main methods exposed by the `store`. Accepts a [record source](#record-source), from which the records in the store are updated. Also updates the mapping of which records in the store have been updated as a result of publishing.

One or more calls to `publish` should be followed by a call to [`notify`](#notify).

## Publish Queue

A class used internally by the environment to keep track of, apply and revert pending (optimistic) updates; commit client updates; and commit server responses.

Exposes mutator methods like `commitUpdate` that only add or remove updates from the queue, as well as a `run` method that actually performs these updates and calls `store.publish` and `store.notify`.

## Query

A [GraphQL query](https://graphql.org/learn/queries/) is a request that can be sent to a GraphQL server in combination with a set of [variables](../guided-tour/rendering/variables), in order to fetch some data. It consists of a [selection](#selection) of fields, and potentially includes other [fragments](#fragment).

## Query Executor

A class that normalizes and publishes optimistic responses and network responses from a network observable to the store.

After each response is published to the store, `store.notify` is called, updating all components that need to re-render.

Used by `environment` in methods such as `execute`, `executeWithSource` and `executeMutation`, among others.

## Query Reference

TODO

## Query Resource

A class for helping with lazily loaded queries and exposing two important methods: `prepare` and `retain`.

* `prepare` is called during a component's render method, and will either read an existing cached value for the query, or fetch the query and suspend. It also stores the results of the attempted read (whether the data, a promise for the data or an error) in a local cache.
* `retain` is called after the component has successfully rendered.

If the component which calls `.prepare` successfully loads a query, but suspends on a subsequent hook before committing, the data from that query can be garbage collected before the component ultimately renders. Thus, components which rely on `QueryResource` are at risk of rendering null data.

Compare to [fragment resource](#fragment-resource).

## @raw_response_type

A directive added to queries which tells Relay to generate types that cover the `optimisticResponse` parameter to `commitMutation`.

<!-- TODO fix this link -->
See the [documentation](../guided-tour/updating-data/local-data-updates) for more.

## Reader

TODO this section

## Reader Fragment

TODO

See [GraphlQLTaggedNode](#graphqltaggednode).

## Reader Selector

An object containing enough information for the store to traverse its data and construct an object represented by a query or fragment. Intuitively, this "selects" a portion of the object graph.

See also [lookup](#lookup).

## Record

A record refers to any item in the Relay [store](#store) that is stored by [ID](#id). [Values](#value) are not records; most everything else is.

## Record Source

An abstract interface for storing [records](#record), keyed by [DataID](#dataid), used both for representing the store's cache for updates to it.

## Record Source Selector Proxy

See [record proxy](#record-proxy).

## Record Proxy

See the [store documentation](../api-reference/store).

## Ref Counting

The pattern of keeping track of how many other objects can access a particular object, and cleaning it up or disposing of it when that number reaches zero. This pattern is implemented throughout the Relay codebase.

## Reference Marker

TODO

## @refetchable

A directive that modifies a fragment, and causes Relay to generate a query for that fragment.

This yields efficiency gains. The fragment can be loaded as part of a single, larger query initially (thus requiring only a single request to fetch all of the data), and yet refetched independently.

## @relay

A directive that allows you to turn off data masking.

See the documentation.

<FbInternalOnly>

## @relay_early_flush

Used for a WWW static resource delivery optimization.

</FbInternalOnly>

## Relay Classic

An even older version of Relay.

## Relay Hooks

The easiest-to-use, safest Relay API. It relies on suspense, and is safe to use in React concurrent mode.

You should not write new code using Relay Classic or Relay Modern.

## Relay Modern

An older version of Relay. This version of Relay had an API that was heavily focused on Containers.

## Release Buffer

As queries are released (no longer [retained](#retain)), their root nodes are stored in a release buffer of fixed size, and only evicted by newly released queries when there isn't enough space in the release buffer. When Relay runs garbage collection, queries that are present in the release buffer and not disposed.

The size of the release buffer is configured with the `gcReleaseBufferSize` parameter.

## @required

An experimental directive.

## Request

A request refers to an API call made over the network to access or mutate some data, or both.

A query, when initiated, may or may not involve making a request, depending on whether the query can be fulfilled from the store or not.

## Request Descriptor

An object associating a [concrete request](#concrete-request) and [variables](#variables), as well as a pre-computed request ID. The variables should be filtered to exclude unneeded variables and are populated to include default values for missing variables, thus ensuring that requests that differ in irrelevant ways are cached using the same request ID.

## Request Parameters

TODO

## Resolver

TODO

## Response

TODO

## Response Normalizer

A class, exposing a single method `normalize`. This will traverse the denormalized response from the API request, normalize it and write the normalized results into a given `MutableRecordSource`. It is called from the query executor.

## Restore

TODO

## Retain

TODO

## Render Policy

TODO

## Revert

TODO

## Root Field

TODO

## Root

Outermost React Component for a given page or screen. Can be associated with an entrypoint.

Roots for entrypoints are referred to by the [`JSResource`](#JSResource) to the root React component module.

## Scalar

TODO

## Scheduler

TODO

## Schema

A collection of all of the GraphQL types that are known to Relay, for a given [project](#project).

<FbInternalOnly>
## Schema Sync

The GraphQL [schema](#schema) is derived from annotations on Hack classes in the www repository.

Periodically, those changes are synced to fbsource in a schema sync diff. If the updated schema would break relay on fbsource, these schema sync diffs will not land.

If a field is removed from www, but is only used in fbsource, the application developer may not notice that the field cannot be removed. This is a common source of schema breakages.

For more info, look [here](https://www.internalfb.com/intern/wiki/GraphQL/Build_Infra/Schema_Sync/) and [here](https://www.internalfb.com/intern/wiki/Relay-team/GraphQL_Schema_Sync/).
</FbInternalOnly>

## Schema Extension

TODO

## Selection

A "selection of fields" refers to the fields you are requesting on an object that you are accessing, as part of a query, mutation, subscription or fragment.

## Selector

See [normalization selector](#normalization-selector).

## @skip

A directive that is added to fields, inline fragments and fragment spreads, and allows for conditional inclusion. It is the opposite of the [`@include`](#include) directive.

## Snapshot

The results of running a reader selector against the data currently in the store. See [lookup](#lookup).

## Stale

TODO

## Store

TODO

## @stream

TODO

## @stream_connection

TODO

## Subscribe

A method exposed by the Relay store. Accepts a callback and a snapshot (see [lookup](#lookup)). The relay store will call this callback when [`notify`](#notify) is called, if the data referenced by that snapshot has been updated or invalidated.

## Subscription

[GraphQL Subscriptions](../guided-tour/updating-data/graphql-subscriptions) are a mechanism which allow clients to subscribe to changes in a piece of data from the server, and get notified whenever that data changes.

A GraphQL Subscription looks very similar to a query, with the exception that it uses the subscription keyword:

```graphql
subscription FeedbackLikeSubscription($input: FeedbackLikeSubscribeData!) {
  feedback_like_subscribe(data: $input) {
    feedback {
      id
      like_count
    }
  }
}
```

<FbInternalOnly>

See also [the guide](../guides/writing-subscriptions).

</FbInternalOnly>

## Transaction ID

A unique id for a given instance of a call to `network.execute`. This ID will be consistent for the entire duration of a network request. It can be consumed by custom log functions passed to `RelayModernEnvironment`.

## Traversal

There are four tree traversals that are core to understanding the internal behavior of Relay. They occur in the following circumstances:

* When Relay normalizes the payload it receives from the GraphQL server in the Response Normalizer;
* When Relay reads data for rendering, in the Reader;
* When Relay reads determines whether there is enough data for to fulfill an operation, in the Data Checker; and
* When Relay determines what data is no longer accessible during garbage collection, in the Reference Marker.

## Type

The GraphQL type of a field is a description of a field on a schema, in terms of what subfields it has, or what it's representation is (String, number, etc.).

See also [interface](#interface), [abstract type](#abstract-type) and [the GraphQL docs](https://graphql.org/learn/schema/#type-language) for more info.

## Type Refinement

The inclusion of a fragment of particular type in a location only known to potentially implement that type. This allows us to select fields if and only if they are defined on that particular object, and return null otherwise.

For example, `node(id: 4) { ... on User { name } }`. In this case, we do now know ahead of time whether `node(id: 4)` is a User. If it is, this fragment will include the user name.

See also [abstract type refinement](#abstract-type-refinement).

## Updater

A callback passed to `commitMutation`, which provides the application developer with imperative control over the data in the store.

<!-- TODO make optimistic updater a link -->
See [the documentation](../guided-tour/updating-data/) and also optimistic updater.

## Value

A single value on a record, such as `has_viewer_liked`, or `name`.

Compare with [linked record](#linked-record).

## Variables

GraphQL variables are a construct that allows referencing dynamic values inside a GraphQL query. They must be provided when the query is initiated, and can be used throughout nested fragments.

See the [variables section of the guided tour](../guided-tour/rendering/variables) and compare with [@argumentDefinitions](#argumentdefinitions).

<DocsRating />

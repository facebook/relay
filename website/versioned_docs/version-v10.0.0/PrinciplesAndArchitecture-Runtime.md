---
id: runtime-architecture
title: Runtime Architecture
original_id: runtime-architecture
---
The Relay runtime is a full-featured GraphQL client that is designed for high performance even on low-end mobile devices and is capable of scaling to large, complex apps. The runtime API is not intended to be used directly in product code, but rather to provide a foundation for building higher-level product APIs such as React/Relay. This foundation includes:

-   A normalized, in-memory object graph/cache.
-   An optimized "write" operation for updating the cache with the results of queries/mutations/subscriptions.
-   A mechanism for reading data from the cache and subscribing for updates when these results change due to a mutation, subscription update, etc.
-   Garbage collection to evict entries from the cache when they can no longer be referenced by any view.
-   A generic mechanism for intercepting data prior to publishing it to the cache and either synthesizing new data or merging new and existing data together (which among other things enables the creation of a variety of pagination schemes).
-   Mutations with optimistic updates and the ability to update the cache with arbitrary logic.
-   Support for live queries where supported by the network/server.
-   Core primitives to enable subscriptions.
-   Core primitives for building offline/persisted caching.

## Comparison to Classic Relay

For users of classic Relay, note that the runtime makes as few assumptions as possible about GraphQL. Compared to earlier versions of Relay there is no concept of routes, there are no limitations on mutation input arguments or side-effects, arbitrary root fields just work, etc. At present, the main restriction from classic Relay that remains is the use of the `Node` interface and `id` field for object identification. However there is no fundamental reason that this restriction can't be relaxed (there is a single place in the codebase where object identity is determined), and we welcome feedback from the community about ways to support customizable object identity without negatively impacting performance.

## Data Types

 (subsequent sections explain how these types are used in practice):

-   `DataID` (type): A globally unique or client-generated identifier for a record, stored as a string.
-   `Record` (type): A representation of a distinct data entity with an identity, type, and fields. Note that the actual runtime representation is opaque to the system: all accesses to `Record` objects (including record creation) is mediated through the `RelayModernRecord` module. This allows the representation itself to be changed in a single place (e.g. to use `Map`s or a custom class). It is important that other code does not assume that `Record`s will always be plain objects.
-   `RecordSource` (type): A collection of records keyed by their data ID, used both to represent the cache and updates to it. For example the store's record cache is a `RecordSource` and the results of queries/mutations/subscriptions are normalized into `RecordSource`s that are published to a store. Sources also define methods for asynchronously loading records in order to (eventually) support offline use-cases. Currently the only implementation of this interface is `RelayInMemoryRecordSource`; future implementations may add support for loading records from disk.
-   `Store` (type): The source of truth for an instance of `RelayRuntime`, holding the canonical set of records in the form of a `RecordSource` (though this is not required). Currently the only implementation is `RelayModernStore`.
-   `Network` (type): Provides methods for fetching query data from and executing mutations against an external data source.
-   `Environment` (type): Represents an encapsulated environment combining a `Store` and `Network`, providing a high-level API for interacting with both. This is the main public API of `RelayRuntime`.

Types for working with queries and their results include:

-   `Selector` (type): A selector defines the starting point for a traversal into the graph for the purposes of targeting a subgraph, combining a GraphQL fragment, variables, and the Data ID for the root object from which traversal should progress. Intuitively, this "selects" a portion of the object graph.
-   `Snapshot` (type): The (immutable) results of executing a `Selector` at a given point in time. This includes the selector itself, the results of executing it, and a list of the Data IDs from which data was retrieved (useful in determining when these results might change).

## Data Model

Relay Runtime is designed for use with GraphQL schemas that describe **object graphs** in which objects have a type, an identity, and a set of fields with values. Objects may reference each other, which is represented by fields whose values are one or more other objects in the graph [1]. To distinguish from JavaScript `Object`s, these units of data are referred to as `Record`s. Relay represents both its internal cache as well as query/mutation/etc results as a mapping of **data ID**s to **records**. The data ID is the unique (with respect to the cache) identifier for a record - it may be the value of an actual `id` field or based on the path to the record from the nearest object with an `id` (such path-based ids are called **client ids**). Each `Record` stores its data ID, type, and any fields that have been fetched. Multiple records are stored together as a `RecordSource`: a mapping of data IDs to `Record` instances.

For example, a user and their address might be represented as follows:

```

// GraphQL Fragment
fragment on User {
  id
  name
  address {
    city
  }
}

// Response
{
  id: '842472',
  name: 'Joe',
  address: {
    city: 'Seattle',
  }
}

// Normalized Representation
RecordSource {
  '842472': Record {
    __id: '842472',
    __typename: 'User', // the type is known statically from the fragment
    id: '842472',
    name: 'Joe',
    address: {__ref: 'client:842472:address'}, // link to another record
  },
  'client:842472:address': Record {
    // A client ID, derived from the path from parent & parent's ID
    __id: 'client:842472:address',
    __typename: 'Address',
    city: 'Seattle',
  }
}
```

[1] Note that GraphQL itself does not impose this constraint, and Relay Runtime may also be used for schemas that do not conform to it. For example, both systems can be used to query a single denormalized table. However, many of the features that Relay Runtime provides, such as caching and normalization, work best when the data is represented as a normalized graph with stable identities for discrete pieces of information.

### Store Operations

The `Store` is the source of truth for application data and provides the following core operations.

-   `lookup(selector: Selector): Snapshot`: Reads the results of a selector from the store, returning the value given the data currently in the store.

-   `subscribe(snapshot: Snapshot, callback: (snapshot: Snapshot) => void): Disposable`: Subscribe to changes to the results of a selector. The callback is called when data has been published to the store that would cause the results of the snapshot's selector to change.

-   `publish(source: RecordSource): void`: Update the store with new information. All updates to the store are expressed in this form, including the results of queries/mutation/subscriptions as well as optimistic mutation updates. All of those operations internally create a new `RecordSource` instance and ultimately publish it to the store. Note that `publish()` does _not_ immediately update any `subscribe()`-ers. Internally, the store compares the new `RecordSource` with its internal source, updating it as necessary:
    -   Records that exist only in the published source are added to the store.
    -   Records that exist in both are merged into a new record (inputs unchanged), with the result added to the store.
    -   Records that are null in the published source are deleted (set to null) in the store.
    -   Records with a special sentinel value are removed from the store. This supports un-publishing optimistically created records.

-   `notify(): void`: Calls any `subscribe()`-ers whose results have changed due to intervening `publish()`-es. Separating `publish()` and `notify()` allows for multiple payloads to be published before performing any downstream update logic (such as rendering).

-   `retain(selector: Selector): Disposable`: Ensure that all the records necessary to fulfill the given selector are retained in-memory. The records will not be eligible for garbage collection until the returned reference is disposed.

### Example Data Flow: Fetching Query Data

```

               ┌───────────────────────┐
               │         Query         │
               └───────────────────────┘
                           │
                           ▼
                                             ┌ ─ ─ ─ ┐
                         fetch ◀────────────▶ Server
                                             └ ─ ─ ─ ┘
                           │
                     ┌─────┴───────┐
                     ▼             ▼
               ┌──────────┐  ┌──────────┐
               │  Query   │  │ Response │
               └──────────┘  └──────────┘
                     │             │
                     └─────┬───────┘
                           │
                           ▼
                       normalize
                           │
                           ▼
               ┌───────────────────────┐
               │     RecordSource      │
               │                       │
               │┌──────┐┌──────┐┌─────┐│
               ││Record││Record││ ... ││
               │└──────┘└──────┘└─────┘│
               └───────────────────────┘

```

1.  The query is fetched from the network.
2.  The query and response are traversed together, extracting the results into `Record` objects which are added to a fresh `RecordSource`.

This fresh `RecordSource` would then be published to the store:

```

                        publish
                           │
                           ▼
             ┌───────────────────────────┐
             │           Store           │
             │ ┌───────────────────────┐ │
             │ │     RecordSource      │ │
             │ │                       │ │
             │ │┌ ─ ─ ─ ┌ ─ ─ ─ ┌ ─ ─ ┐│ │
             │ │ Record│ Record│  ...  │ │  <--- records are updated
             │ │└ ─ ─ ─ └ ─ ─ ─ └ ─ ─ ┘│ │
             │ └───────────────────────┘ │
             │ ┌───────────────────────┐ │
             │ │     Subscriptions     │ │
             │ │                       │ │
             │ │┌──────┐┌──────┐┌─────┐│ │
             │ ││ Sub. ││ Sub. ││ ... ││ │ <--- subscriptions do not fire yet
             │ │└──────┘└──────┘└─────┘│ │
             │ └───────────────────────┘ │
             └───────────────────────────┘

```

Publishing the results updates the store but does _not_ immediately notify any subscribers. This is accomplished by calling `notify()`...

```

                        notify
                           │
                           ▼
             ┌───────────────────────────┐
             │           Store           │
             │ ┌───────────────────────┐ │
             │ │     RecordSource      │ │
             │ │                       │ │
             │ │┌──────┐┌──────┐┌─────┐│ │
             │ ││Record││Record││ ... ││ │
             │ │└──────┘└──────┘└─────┘│ │
             │ └───────────────────────┘ │
             │ ┌───────────────────────┐ │
             │ │     Subscriptions     │ │
             │ │                       │ │
             │ │┌ ─ ─ ─ ┌ ─ ─ ─ ┌ ─ ─ ┐│ │
             │ │  Sub. │  Sub. │  ...  │ │ <--- affected subscriptions fire
             │ │└ ─│─ ─ └ ─│─ ─ └ ─│─ ┘│ │
             │ └───┼───────┼───────┼───┘ │
             └─────┼───────┼───────┼─────┘
                   │       │       │
                   ▼       │       │
               callback    │       │
                           ▼       │
                       callback    │
                                   ▼
                               callback

```

...which calls the callbacks for any `subscribe()`-ers whose results have changed. Each subscription is checked as follows:

1.  First, the list of data IDs that have changed since the last `notify()` is compared against data IDs listed in the subscription's latest `Snapshot`. If there is no overlap, the subscription's results cannot possibly have changed (if you imagine the graph visually, there is no overlap between the part of the graph that changed and the part that is selected). In this case the subscription is ignored, otherwise processing continues.
2.  Second, any subscriptions that do have overlapping data IDs are re-read, and the new/previous results are compared. If the result has not changed, the subscription is ignored (this can occur if a field of a record changed that is not relevant to the subscription's selector), otherwise processing continues.
3.  Finally, subscriptions whose data actually changed are notified via their callback.

### Example Data Flow: Reading and Observing the Store

Products access the store primarily via `lookup()` and `subscribe()`. Lookup reads the initial results of a fragment, and subscribe observes that result for any changes. Note that the output of `lookup()` - a `Snapshot` - is the input to `subscribe()`. This is important because the snapshot contains important information that can be used to optimize the subscription - if `subscribe()` accepted only a `Selector`, it would have to re-read the results in order to know what to subscribe to, which is less efficient.

Therefore a typical data flow is as follows - note that this flow is managed automatically by higher-level APIs such as React/Relay. First a component will lookup the results of a selector against a record source (e.g. the store's canonical source):

```

    ┌───────────────────────┐       ┌──────────────┐
    │     RecordSource      │       │              │
    │                       │       │              │
    │┌──────┐┌──────┐┌─────┐│       │   Selector   │
    ││Record││Record││ ... ││       │              │
    │└──────┘└──────┘└─────┘│       │              │
    └───────────────────────┘       └──────────────┘
                │                           │
                │                           │
                └──────────────┬────────────┘
                               │
                               │  lookup
                               │  (read)
                               │
                               ▼
                        ┌─────────────┐
                        │             │
                        │  Snapshot   │
                        │             │
                        └─────────────┘
                               │
                               │  render, etc
                               │
                               ▼

```

Next, it will `subscribe()` using this snapshot in order to be notified of any changes - see the above diagram for `publish()` and `notify()`.

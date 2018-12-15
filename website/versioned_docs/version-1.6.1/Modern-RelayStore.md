---
id: version-1.6.1-relay-store
title: Relay Store
original_id: relay-store
---

The Relay Store can be used to programatically update client-side data inside [`updater` functions](./mutations.html#using-updater-and-optimisticupdater). The following is a reference of the Relay Store interface.

Table of Contents:
- [RecordSourceSelectorProxy](#recordsourceselectorproxy)
- [RecordProxy](#recordproxy)
- [ConnectionHandler](#connectionhandler)

## RecordSourceSelectorProxy

The `RecordSourceSelectorProxy` is the type of the `store` that [`updater` functions](./mutations.html#using-updater-and-optimisticupdater) receive as an argument. The following is the `RecordSourceSelectorProxy` interface:

```javascript
interface RecordSourceSelectorProxy {
  create(dataID: string, typeName: string): RecordProxy;
  delete(dataID: string): void;
  get(dataID: string): ?RecordProxy;
  getRoot(): RecordProxy;
  getRootField(fieldName: string): ?RecordProxy;
  getPluralRootField(fieldName: string): ?Array<?RecordProxy>;
}
```

### `create(dataID: string, typeName: string): RecordProxy`

Creates a new record in the store given a `dataID` and the `typeName` as defined by the GraphQL schema. Returns a [`RecordProxy`](#recordproxy) which serves as an interface to mutate the newly created record.

#### Example
```javascript
const record = store.create(dataID, 'Todo');
```

### `delete(dataID: string): void`

Deletes a record from the store given its `dataID`.

#### Example
```javascript
store.delete(dataID);
```

### `get(dataID: string): ?RecordProxy`

Retrieves a record from the store given its `dataID`. Returns a [`RecordProxy`](#recordproxy) which serves as an interface to mutate the record.

#### Example
```javascript
const record = store.get(dataID);
```

### `getRoot(): RecordProxy`

Returns the [`RecordProxy`](#recordproxy) representing the root of the GraphQL document.

#### Example

Given the GraphQL document:
```graphql
viewer {
  id
}
```

Usage:
```javascript
// Represents root query
const root = store.getRoot();
```

### `getRootField(fieldName: string): ?RecordProxy`

Retrieves a root field from the store given the `fieldName`, as defined by the GraphQL document. Returns a [`RecordProxy`](#recordproxy) which serves as an interface to mutate the record.

#### Example

Given the GraphQL document:
```graphql
viewer {
  id
}
```

Usage:
```javascript
const viewer = store.getRootField('viewer');
```

### `getPluralRootField(fieldName: string): ?Array<?RecordProxy>`

Retrieves a root field that represents a collection from the store given the `fieldName`, as defined by the GraphQL document. Returns an array of [`RecordProxies`](#recordproxy).

#### Example

Given the GraphQL document:
```graphql
nodes(first: 10) {
  # ...
}
```

Usage:
```javascript
const nodes = store.getPluralRootField('nodes');
```

## RecordProxy

The `RecordProxy` serves as an interface to mutate records:

```javascript
interface RecordProxy {
  copyFieldsFrom(sourceRecord: RecordProxy): void;
  getDataID(): string;
  getLinkedRecord(name: string, arguments?: ?Object): ?RecordProxy;
  getLinkedRecords(name: string, arguments?: ?Object): ?Array<?RecordProxy>;
  getOrCreateLinkedRecord(
    name: string,
    typeName: string,
    arguments?: ?Object,
  ): RecordProxy;
  getType(): string;
  getValue(name: string, arguments?: ?Object): mixed;
  setLinkedRecord(
    record: RecordProxy,
    name: string,
    arguments?: ?Object,
  ): RecordProxy;
  setLinkedRecords(
    records: Array<?RecordProxy>,
    name: string,
    arguments?: ?Object,
  ): RecordProxy;
  setValue(value: mixed, name: string, arguments?: ?Object): RecordProxy;
}
```

### `getDataID(): string`

Returns the dataID of the current record.

#### Example
```javascript
const id = record.getDataID();
```

### `getType(): string`

Gets the type of the current record, as defined by the GraphQL schema.

#### Example
```javascript
const type = user.getType();  // User
```

### `getValue(name: string, arguments?: ?Object): mixed`

Gets the value of a field in the current record given the field name.

#### Example

Given the GraphQL document:
```graphql
viewer {
  id
  name
}
```

Usage:
```javascript
const name = viewer.getValue('name');
```

Optionally, if the field takes arguments, you can pass a bag of `variables`.

#### Example

Given the GraphQL document:
```graphql
viewer {
  id
  name(arg: $arg)
}
```

Usage:
```javascript
const name = viewer.getValue('name', {arg: 'value'});
```

### `getLinkedRecord(name: string, arguments?: ?Object): ?RecordProxy`

Retrieves a record associated with the current record given the field name, as defined by the GraphQL document. Returns a `RecordProxy`.

#### Example

Given the GraphQL document:
```graphql
rootField {
  viewer {
    id
    name
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const viewer = rootField.getLinkedRecord('viewer');
```

Optionally, if the linked record takes arguments, you can pass a bag of `variables` as well.

#### Example

Given the GraphQL document:
```graphql
rootField {
  viewer(arg: $arg) {
    id
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const viewer = rootField.getLinkedRecord('viewer', {arg: 'value'});
```

### `getLinkedRecords(name: string, arguments?: ?Object): ?Array<?RecordProxy>`

Retrieves the set of records associated with the current record given the field name, as defined by the GraphQL document. Returns an array of `RecordProxies`.

#### Example

Given the GraphQL document:
```graphql
rootField {
  nodes {
    # ...
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const nodes = rootField.getLinkedRecord('nodes');
```

Optionally, if the linked record takes arguments, you can pass a bag of `variables` as well.

#### Example

Given the GraphQL document:
```graphql
rootField {
  nodes(first: $count) {
    # ...
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const viewer = rootField.getLinkedRecord('viewer', {count: 10});
```

### `getOrCreateLinkedRecord(name: string, typeName: string, arguments?: ?Object)`

Retrieves the a record associated with the current record given the field name, as defined by the GraphQL document. If the linked record does not exist, it will be created given the type name. Returns a `RecordProxy`.

#### Example

Given the GraphQL document:
```graphql
rootField {
  viewer {
    id
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const newViewer = rootField.getOrCreateLinkedRecord('viewer', 'User'); // Will create if it doesn't exist
```

Optionally, if the linked record takes arguments, you can pass a bag of `variables` as well.

### `setValue(value: mixed, name: string, arguments?: ?Object): RecordProxy`

Mutates the current record by setting a new value on the specified field. Returns the mutated record.

Given the GraphQL document:
```graphql
viewer {
  id
  name
}
```

Usage:
```javascript
viewer.setValue('New Name', 'name');
```

Optionally, if the field takes arguments, you can pass a bag of `variables`.

```javascript
viewer.setValue('New Name', 'name', {arg: 'value'});
```

### `copyFieldsFrom(sourceRecord: RecordProxy): void`

Mutates the current record by copying the fields over from the passed in record `sourceRecord`.

#### Example
```javascript
const record = store.get(id1);
const otherRecord = store.get(id2);
record.copyFieldsFrom(otherRecord); // Mutates `record`
```

### `setLinkedRecord(record: RecordProxy, name: string, arguments?: ?Object)`

Mutates the current record by setting a new linked record on the given the field name.

#### Example

Given the GraphQL document:
```graphql
rootField {
  viewer {
    id
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const newViewer = store.create(/* ... */)''
rootField.setLinkedRecord(newViewer, 'viewer'); //
```

Optionally, if the linked record takes arguments, you can pass a bag of `variables` as well.

### `setLinkedRecords(records: Array<RecordProxy>, name: string, variables?: ?Object)`

Mutates the current record by setting a new set of linked records on the given the field name.

#### Example

Given the GraphQL document:
```graphql
rootField {
  nodes {
    # ...
  }
}
```

Usage:
```javascript
const rootField = store.getRootField('rootField');
const newNode = store.create(/* ... */);
const newNodes = [...rootField.getLinkedRecords('nodes'), newNode];
rootField.setLinkedRecords(newNodes, 'nodes'); //
```

Optionally, if the linked record takes arguments, you can pass a bag of `variables` as well.

## ConnectionHandler

`ConnectionHandler` is a utility module exposed by `relay-runtime` that aids in the manipulation of connections. `ConnectionHandler` exposes the following interface:

```javascript
interface ConnectionHandler {
  getConnection(
    record: RecordProxy,
    key: string,
    filters?: ?Object,
  ): ?RecordProxy,
  createEdge(
    store: RecordSourceProxy,
    connection: RecordProxy,
    node: RecordProxy,
    edgeType: string,
  ): RecordProxy,
  insertEdgeBefore(
    connection: RecordProxy,
    newEdge: RecordProxy,
    cursor?: ?string,
  ): void,
  insertEdgeAfter(
    connection: RecordProxy,
    newEdge: RecordProxy,
    cursor?: ?string,
  ): void,
  deleteNode(connection: RecordProxy, nodeID: string): void
}
```

### `getConnection(record: RecordProxy, key: string, filters?: ?Object)`

Given a record and a connection key, and optionally a set of filters, `getConnection` retrieves a [`RecordProxy`](#recordproxy) that represents a connection that was annotated with a `@connection` directive.

First, let's take a look at a plain connection:

```graphql
fragment FriendsFragment on User {
  friends(first: 10) {
    edges {
      node {
        id
      }
    }
  }
}
```

Accessing a plain connection field like this is the same as other regular field:
```javascript
// The `friends` connection record can be accessed with:
const user = store.get(userID);
const friends = user && user.getLinkedRecord(user, 'friends');

// Access fields on the connection:
const edges = friends.getLinkedRecords('edges');
```

In a [pagination container](./pagination-container.html), we usually annotate the actual connection field with `@connection` to tell Relay which part needs to be paginated:
```graphql
fragment FriendsFragment on User {
  friends(first: 10, orderby: "firstname") @connection(
    key: "FriendsFragment_friends",
  ) {
    edges {
      node {
        id
      }
    }
  }
}
```

For connections like the above, `ConnectionHandler` helps us find the record:
```
import {ConnectionHandler} from 'relay-runtime';

// The `friends` connection record can be accessed with:
const user = store.get(userID);
const friends = RelayConnectionHandler.getConnection(
 user,                        // parent record
 'FriendsFragment_friends'    // connection key
 {orderby: 'firstname'}       // 'filters' that is used to identify the connection
);
// Access fields on the connection:
const edges = friends.getLinkedRecords('edges');
```

### Edge creation and insertion

#### `createEdge(store: RecordSourceProxy, connection: RecordProxy, node: RecordProxy, edgeType: string)`

Creates an edge given a [`store`](#recordsourceselectorproxy), a connection, the edge type, and a record that holds that connection.

#### `insertEdgeBefore(connection: RecordProxy, newEdge: RecordProxy, cursor?: ?string)`

Given a connection, inserts the edge at the beginning of the connection, or before the specified `cursor`.

#### `insertEdgeAfter(connection: RecordProxy, newEdge: RecordProxy, cursor?: ?string)`

Given a connection, inserts the edge at the end of the connection, or after the specified `cursor`.

#### Example

```
const user = store.get(userID);
const friends = RelayConnectionHandler.getConnection(user, 'friends');
const edge = RelayConnectionHandler.createEdge(store, friends, user, 'UserEdge');

// No cursor provided, append the edge at the end.
RelayConnectionHandler.insertEdgeAfter(friends, edge);

// No cursor provided, Insert the edge at the front:
RelayConnectionHandler.insertEdgeBefore(friends, edge);
```

### `deleteNode(connection: RecordProxy, nodeID: string): void`

Given a connection, deletes any edges whose id matches the given id.

#### Example

```
const user = store.get(userID);
const friends = RelayConnectionHandler.getConnection(user, 'friends');
RelayConnectionHandler.deleteNode(friends, idToDelete);
```

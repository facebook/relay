---
id: mutations
title: Mutations
original_id: mutations
---
Table of Contents:

-   [`commitMutation`](#commitmutation)
-   [Simple Example](#simple-example)
-   [Optimistic Updates](#optimistic-updates)
-   [Updater Configs](#updater-configs)
-   [Using updater and optimisticUpdater](#using-updater-and-optimisticupdater)
-   [Committing Local Updates](#committing-local-updates)

## `commitMutation`

Use `commitMutation` to create and execute mutations. `commitMutation` has the following signature:

```javascript
commitMutation(
  environment: Environment,
  config: {
    mutation: GraphQLTaggedNode,
    variables: {[name: string]: mixed},
    onCompleted?: ?(response: ?Object, errors: ?Array<Error>) => void,
    onError?: ?(error: Error) => void,
    optimisticResponse?: Object,
    optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
    updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
    configs?: Array<DeclarativeMutationConfig>,
  },
);
```

### Arguments

-   `environment`: The [Relay Environment](Modern-RelayEnvironment.md). **Note:** To ensure the mutation is performed on the correct `environment`, it's recommended to use the environment available within components (from `this.props.relay.environment`), instead of referencing a global environment.
-   `config`:
    -   `mutation`: The `graphql` tagged mutation query.
    -   `variables`: Object containing the variables needed for the mutation. For example, if the mutation defines an `$input` variable, this object should contain an `input` key, whose shape must match the shape of the data expected by the mutation as defined by the GraphQL schema.
    -   `onCompleted`: Callback function executed when the request is completed and the in-memory Relay store is updated with the `updater` function. Takes a `response` object, which is the "raw" server response, and `errors`, an array containing any errors from the server. .
    -   `onError`: Callback function executed if Relay encounters an error during the request.
    -   `optimisticResponse`: Object containing the data to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. This object must have the same shape as the mutation's response type, as defined by the GraphQL schema. If provided, Relay will use the `optimisticResponse` data to update the fields on the relevant records in the local data store, _before_ `optimisticUpdater` is executed. If an error occurs during the mutation request, the optimistic update will be rolled back.
    -   `optimisticUpdater`: Function used to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. If an error occurs during the mutation request, the optimistic update will be rolled back.
        This function takes a `store`, which is a proxy of the in-memory [Relay Store](Modern-RelayStore.md). In this function, the client defines 'how to' update the local data via the `store` instance. For details on how to use the `store`, please refer to our [Relay Store API Reference](Modern-RelayStore.md).
        **Please note:**
        -   It is usually preferable to just pass an `optimisticResponse` option instead of an `optimisticUpdater`, unless you need to perform updates on the local records that are more complicated than just updating fields (e.g. deleting records or adding items to collections).
        -   If you do decide to use an `optimisticUpdater`, often times it can be the same function as `updater`.
    -   `updater`: Function used to update the local in-memory store based on the **real** server response from the mutation. If `updater` is not provided, by default, Relay will know to automatically update the fields on the records referenced in the mutation response; however, you should pass an `updater` if you need to make more complicated updates than just updating fields (e.g. deleting records or adding items to collections).
        When the server response comes back, Relay first reverts any changes introduced by `optimisticUpdater` or `optimisticResponse` and will then execute `updater`.
        This function takes a `store`, which is a proxy of the in-memory [Relay Store](Modern-RelayStore.md). In this function, the client defines 'how to' update the local data based on the server response via the `store` instance. For details on how to use the `store`, please refer to our [Relay Store API Reference](Modern-RelayStore.md).
    -   `configs`:  Array containing objects describing `optimisticUpdater`/`updater` configurations. `configs` provides a convenient way to specify the `updater` behavior without having to write an `updater` function. See our section on [Updater Configs](#updater-configs) for more details.

## Simple Example

Example of a simple mutation:

```javascript
import {commitMutation, graphql} from 'react-relay';

const mutation = graphql`
  mutation MarkReadNotificationMutation(
    $storyID: ID!
  ) {
    markReadNotification(id: $storyID) {
      notification {
        seenState
      }
    }
  }
`;

function markNotificationAsRead(environment, storyID) {
  const variables = {
    storyID,
  };

  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response, errors) => {
        console.log('Response received from server.')
      },
      onError: err => console.error(err),
    },
  );
}
```

## Optimistic Updates

To improve perceived responsiveness, you may wish to perform an "optimistic update", in which the client immediately updates to reflect the anticipated new value even before the response from the server has come back. The simplest way to do this is by providing an `optimisticResponse` and adding it to the `config` that we pass into `commitMutation`:

```javascript
const mutation = graphql`
  mutation MarkReadNotificationMutation(
    $storyID: ID!
  ) {
    markReadNotification(id: $storyID) {
      notification {
        seenState
      }
    }
  }
`;

const optimisticResponse = {
  markReadNotification: {
    notification: {
      seenState: SEEN,
    },
  },
};

commitMutation(
  environment,
  {
    mutation,
    optimisticResponse,
    variables,
  },
);
```

Another way to enable optimistic updates is via the `optimisticUpdater`, which can be used for more complicated update scenarios. Using `optimisticUpdater` is covered in the section [below](#using-updater-and-optimisticupdater).

## Updater Configs

We can give Relay instructions in the form of a `configs` array on how to use the response from each mutation to update the client-side store. We do this by configuring the mutation with one or more of the following config types:

### NODE_DELETE

Given a deletedIDFieldName, Relay will remove the node(s) from the store.

**Note**: this will not remove it from any connection it might be in. If you want to remove a node from a connection, take a look at [RANGE_DELETE](#RANGE_DELETE).

#### Arguments

-   `deletedIDFieldName: string`: The field name in the response that contains the DataID or DataIDs of the deleted node or nodes

#### Example

```javascript
const mutation = graphql`
  mutation DestroyShipMutation($target: ID!) {
    destroyShip(target: $target) {
      destroyedShipId
      faction {
        ships {
          id
        }
      }
    }
  }
`;

const configs = [{
  type: 'NODE_DELETE',
  deletedIDFieldName: 'destroyedShipId',
}];
```

### RANGE_ADD

Given a parent, information about the connection, and the name of the newly created edge in the response payload Relay will add the node to the store and attach it to the connection according to the range behavior(s) specified in the connectionInfo.

#### Arguments

-   `parentID: string`: The DataID of the parent node that contains the
    connection.
-   `connectionInfo: Array<{key: string, filters?: Variables, rangeBehavior:
    string}>`: An array of objects containing a connection key, an object
    containing optional filters, and a range behavior depending on what behavior we expect (append, prepend, or ignore).
    -   `filters`: An object containing GraphQL calls e.g. `const filters = {'orderby': 'chronological'};`.
-   `edgeName: string`: The field name in the response that represents the newly created edge

#### Example

```javascript
const mutation = graphql`
  mutation AddShipMutation($factionID: ID!, $name: String!) {
    addShip(factionID: $factionID, name: $name) {
      shipEdge {
        node {
          name
        }
      }
    }
  }
`;

function commit(environment, factionID, name) {
  return commitMutation(environment, {
    mutation,
    variables: {
      factionID,
      name,
    },
    configs: [{
      type: 'RANGE_ADD',
      parentID: factionID,
      connectionInfo: [{
        key: 'AddShip_ships',
        rangeBehavior: 'append',
      }],
      edgeName: 'shipEdge',
    }],
  });
}
```

### RANGE_DELETE

Given a parent, connectionKeys, one or more DataIDs in the response payload, and
a path between the parent and the connection, Relay will remove the node(s)
from the connection but leave the associated record(s) in the store.

#### Arguments

-   `parentID: string`: The DataID of the parent node that contains the
    connection.
-   `connectionKeys: Array<{key: string, filters?: Variables}>`: An array of
    objects containing a connection key and optionally filters.
    -   `filters`: An object containing GraphQL calls e.g. `const filters = {'orderby': 'chronological'};`.
-   `pathToConnection: Array<string>`: An array containing the field names between the parent and the connection, including the parent and the connection.
-   `deletedIDFieldName: string | Array<string>`: The field name in the response that contains the DataID or DataIDs of the removed node or nodes, or the path to the node or nodes removed from the connection

#### Example

```javascript
const mutation = graphql`
  mutation RemoveTagMutation($todoID: ID!, $tagID: ID!) {
    removeTag(todo: $todoID, tag: $tagID) {
      removedTagID
    }
  }
`;

function commit(environment, todoID, tagID) {
  return commitMutation(environment, {
    mutation,
    variables: {
      todoID,
      tagID,
    },
    configs: [{
      type: 'RANGE_DELETE',
      parentID: todoID,
      connectionKeys: [{
        key: 'RemoveTags_tags',
      }],
      pathToConnection: ['todo', 'tags'],
      deletedIDFieldName: 'removedTagID',
    }],
  });
}
```

## Using updater and optimisticUpdater

`updater` and `optimisticUpdater` are functions that you can pass to a `commitMutation` call when you need full control over how to update the local data store, either optimistically, or based on a server response. Often times, both of these can be the same function.

When you provide these functions, this is roughly what happens during the mutation request:

-   If `optimisticResponse` is provided, Relay will use it to update the fields under the records as specified by the ids in the `optimisticResponse`.
-   If `optimisticUpdater` is provided, Relay will execute it and update the store accordingly.
-   After the network comes back, if any optimistic update was applied, it will be rolled back.
-   Relay will then automatically update the fields under the record corresponding to the ids in the response payload.
-   If an `updater` was provided, Relay will execute it and update the store accordingly. The server payload will be available to the `updater` as a root field in the store.

Here are a quick example of adding a todo item to a Todo list using this [example schema](https://github.com/relayjs/relay-examples/blob/main/todo/data/schema.graphql#L36):

```javascript
// AddTodoMutation.js
import {commitMutation, graphql} from 'react-relay';
import {ConnectionHandler} from 'relay-runtime';

const mutation = graphql`
  mutation AddTodoMutation($text: String!) {
    addTodo(text: $text) {
      todoEdge {
        cursor
        node {
          complete
          id
          text
        }
      }
      viewer {
        id
        totalCount
      }
    }
  }
`;

function sharedUpdater(store, user, newEdge) {
  // Get the current user record from the store
  const userProxy = store.get(user.id);

  // Get the user's Todo List using ConnectionHandler helper
  const conn = ConnectionHandler.getConnection(
    userProxy,
    'TodoList_todos', // This is the connection identifier, defined here
    // https://github.com/relayjs/relay-examples/blob/main/todo/js/components/TodoList.js#L76
  );

  // Insert the new todo into the Todo List connection
  ConnectionHandler.insertEdgeAfter(conn, newEdge);
}

let tempID = 0;

function commit(environment, text, user) {
  return commitMutation(environment, {
    mutation,
    variables: {
      text,
    },
    updater: (store) => {
      // Get the payload returned from the server
      const payload = store.getRootField('addTodo');

      // Get the edge of the newly created Todo record
      const newEdge = payload.getLinkedRecord('todoEdge');

      // Add it to the user's todo list
      sharedUpdater(store, user, newEdge);
    },
    optimisticUpdater: (store) => {
      // Create a Todo record in our store with a temporary ID
      const id = 'client:newTodo:' + tempID++;
      const node = store.create(id, 'Todo');
      node.setValue(text, 'text');
      node.setValue(id, 'id');

      // Create a new edge that contains the newly created Todo record
      const newEdge = store.create(
        'client:newEdge:' + tempID++,
        'TodoEdge',
      );
      newEdge.setLinkedRecord(node, 'node');

      // Add it to the user's todo list
      sharedUpdater(store, user, newEdge);

      // Given that we don't have a server response here,
      // we also need to update the todo item count on the user
      const userRecord = store.get(user.id);
      userRecord.setValue(
        userRecord.getValue('totalCount') + 1,
        'totalCount',
      );
    },
  });
}
```

For details on how to interact with the Relay Store, please refer to our Relay Store [docs](Modern-RelayStore.md).

## Committing Local Updates

Use `commitLocalUpdate` when you need to update the local store without necessarily executing a mutation (such as in the case of debounced operations). The function takes in a Relay `environment` and an `updater` function.

---
id: mutations
title: Mutations
---

Table of Contents:
- [`commitMutation`](#commitmutation)
- [Simple Example](#simple-example)
- [Optimistic Updates](#optmistic-updates)
- [Updater Configs](#updater-configs)
- [Using updater and optimisticUpdater](#using-updater-and-optimisticupdater)

## commitMutation

Use `commitMutation` to create and execute mutations. `commitMutation` has the following signature:

```javascript
commitMutation(
  environment: Environment,
  config: {
    mutation: GraphQLTaggedNode,
    variables: {[name: string]: any},
    onCompleted?: ?(response: ?Object, errors: ?Array<Error>) => void,
    onError?: ?(error: Error) => void,
    optimisticResponse?: Object,
    optimisticUpdater?: ?(store: RecordSourceSelectorProxy) => void,
    updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
    configs?: Array<RelayMutationConfig>,
  },
);
```

### Arguments

* `environment`: The [Relay Environment](./relay-environment.html). **Note:** To ensure the mutation is performed on the correct `environment`, it's recommended to use the environment available within components (from `this.props.relay.environment`), instead of referencing a global environment.
* `config`:
  * `mutation`: The `graphql` tagged mutation query.
  * `variables`: Object containing the variables needed for the mutation. For example, if the mutation defines an `$input` variable, this object should contain an `input` key, whose shape must match the shape of the data expected by the mutation as defined by the GraphQL schema.
  * `onCompleted`: Callback function executed when the request is completed and the in-memory Relay store is updated with the `updater` function. Takes a `response` object, which is the "raw" server response, and `errors`, an array containing any errors from the server. .
  * `onError`: Callback function executed if Relay encounters an error during the request.
  * `optimisticResponse`: Object containing the data to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. This object must have the same shape as the mutation's response type, as defined by the GraphQL schema. If provided, Relay will use the `optimisticResponse` data to update the fields on the relevant records in the local data store, *before* `optimisticUpdater` is executed. If an error occurs during the mutation request, the optimistic update will be rolled back.
  * `optimisticUpdater`: Function used to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. If an error occurs during the mutation request, the optimistic update will be rolled back.
  This function takes a `store`, which is a proxy of the in-memory [Relay Store](./relay-store.html). In this function, the client defines 'how to' update the local data via the `store` instance. For details on how to use the `store`, please refer to our [Relay Store API Reference](./relay-store.html).
  **Please note:**
    * It is usually preferable to just pass an `optimisticResponse` option instead of an `optimisticUpdater`, unless you need to perform updates on the local records that are more complicated than just updating fields (e.g. deleting records or adding items to collections).
    * If you do decide to use an `optimisticUpdater`, often times it can be the same function as `updater`.
  * `updater`: Function used to update the local in-memory store based on the **real** server response from the mutation. If `updater` is not provided, by default, Relay will know to automatically update the fields on the records referenced in the mutation response; however, you should pass an `updater` if you need to make more complicated updates than just updating fields (e.g. deleting records or adding items to collections).
  When the server response comes back, Relay first reverts any changes introduced by `optimisticUpdater` or `optimisticResponse` and will then execute `updater`.
  This function takes a `store`, which is a proxy of the in-memory [Relay Store](./relay-store.html). In this function, the client defines 'how to' update the local data based on the server response via the `store` instance. For details on how to use the `store`, please refer to our [Relay Store API Reference](./relay-store.html).
  * `configs`:  Array containing objects describing `optimisticUpdater`/`updater` configurations. `configs` provides a convenient way to specify the `updater` behavior without having to write an `updater` function. See our section on [Updater Configs](#updater-configs) for more details.

## Simple Example

Example of a simple mutation:

```javascript
import {commitMutation, graphql} from 'react-relay';

const mutation = graphql`
  mutation MarkReadNotificationMutation(
    $input: MarkReadNotificationData!
  ) {
    markReadNotification(data: $input) {
      notification {
        seenState
      }
    }
  }
`;

function markNotificationAsRead(environment, source, storyID) {
  const variables = {
    input: {
      source,
      storyID,
    },
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
    $input: MarkReadNotificationData!
  ) {
    markReadNotification(data: $input) {
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
Given a deletedIDFieldName, Relay will remove the node(s) from the connection.

#### Arguments
* `deletedIDFieldName: string`: The field name in the response that contains the DataID of the deleted node

#### Example
```javascript
const mutation = graphql`
  mutation DestroyShipMutation($input: DestroyShipData!) {
    destroyShip(input: $input) {
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
* `parentID: string`: The DataID of the parent node that contains the
connection.
* `connectionInfo: Array<{key: string, filters?: Variables, rangeBehavior:
string}>`: An array of objects containing a connection key, an object
containing optional filters, and a range behavior depending on what behavior we expect (append, prepend, or ignore).
  * `filters`: An object containing GraphQL calls e.g. `const filters = {'orderby': 'chronological'};`.
* `edgeName: string`: The field name in the response that represents the newly created edge

#### Example
```javascript
const mutation = graphql`
  mutation AddShipMutation($input: AddShipData!) {
    addShip(input: $input) {
      faction {
        ships {
          id
        }
      }
      newShipEdge
    }
  }
`;

const configs = [{
  type: 'RANGE_ADD',
  parentID: 'shipId',
  connectionInfo: [{
    key: 'AddShip_ships',
    rangeBehavior: 'append',
  }],
  edgeName: 'newShipEdge',
}];
```

### RANGE_DELETE
Given a parent, connectionKeys, one or more DataIDs in the response payload, and
a path between the parent and the connection, Relay will remove the node(s)
from the connection but leave the associated record(s) in the store.

#### Arguments
* `parentID: string`: The DataID of the parent node that contains the
connection.
* `connectionKeys: Array<{key: string, filters?: Variables}>`: An array of
objects containing a connection key and optionally filters.
  * `filters`: An object containing GraphQL calls e.g. `const filters = {'orderby': 'chronological'};`.
* `pathToConnection: Array<string>`: An array containing the field names between the parent and the connection, including the parent and the connection.
* `deletedIDFieldName: string | Array<string>`: The field name in the response that contains the DataID of the removed node, or the path to the node removed from the connection

#### Example
```javascript
const mutation = graphql`
  mutation RemoveTagsMutation($input: RemoveTagsData!) {
    removeTags(input: $input) {
      todo {
        tags {
          id
        }
      }
      removedTagId
    }
  }
`;

const configs = [{
  type: 'RANGE_DELETE',
  parentID: 'todoId',
  connectionKeys: [{
    key: RemoveTags_tags,
  }],
  pathToConnection: ['todo', 'tags'],
  deletedIDFieldName: removedTagId
}];
```

## Using updater and optimisticUpdater

TODO

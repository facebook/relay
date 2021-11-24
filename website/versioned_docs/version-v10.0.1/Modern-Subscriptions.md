---
id: subscriptions
title: Subscriptions
original_id: subscriptions
---
Relay exposes the following APIs to create subscriptions.

```javascript
import { requestSubscription } from 'react-relay';

type Variables = {[name: string]: any};

type Disposable = {
  dispose(): void,
};

requestSubscription(
  environment: Environment,
  config: {
    subscription: GraphQLTaggedNode,
    variables: Variables,
    onCompleted?: ?() => void,
    onError?: ?(error: Error) => void,
    onNext?: ?(response: ?Object) => void,
    updater?: ?(store: RecordSourceSelectorProxy, data: SelectorData) => void,
    configs?: Array<DeclarativeMutationConfig>,
    cacheConfig?: CacheConfig,
  },
) => Disposable;
```

The function returns a `Disposable` on which you could call `dispose()` to cancel the refetch.

Now let's take a closer look at the `config`:

-   `subscription`: the `graphql` tagged subscription query.
-   `variables`: an object that contains the variables needed for the subscription.
-   `onCompleted`: a callback function executed when the subscription is closed by
    the peer without error.
-   `onError`: a callback function executed when Relay or the server encounters an
    error processing the subscription.
-   `onNext`: a callback function executed each time a response is received from
    the server, with the raw GraphQL response payload.
-   `updater`: an optional function that can supply custom logic for updating the
    in-memory Relay store based on the server response.
-   `configs`: an array containing the updater configurations. It is the same as [`configs`](Modern-Mutations.md#updater-configs) in `commitMutation`.
-   `cacheConfig?`: Optional object containing a set of cache configuration options

## Example

In a simple subscription, you only need `subscription` and `variables`. This is
appropriate when you are only changing the properties of existing records that
can be identified by their `id`:

```javascript
import {
  requestSubscription,
  graphql,
} from 'react-relay';

const subscription = graphql`
  subscription MarkReadNotificationSubscription(
    $storyID: ID!
  ) {
    markReadNotification(storyID: $storyID) {
      notification {
        seenState
      }
    }
  }
`;

const variables = {
  storyID,
};

requestSubscription(
  yourEnvironment, // see Environment docs
  {
    subscription,
    variables,
    // optional but recommended:
    onCompleted: () => {
      // server closed the subscription
    },
    onError: error => console.error(error),
  }
);
```

# Configure Network

You will need to Configure your [Network](Modern-NetworkLayer.md) to handle subscriptions. The below example uses [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws):

```javascript
import {
    ...
    Network,
    Observable
} from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';

...

const subscriptionClient = new SubscriptionClient('ws://localhost:3000', {
    reconnect: true,
});

const subscribe = (request, variables) => {
    const subscribeObservable = subscriptionClient.request({
        query: request.text,
        operationName: request.name,
        variables,
    });
    // Important: Convert subscriptions-transport-ws observable type to Relay's
    return Observable.from(subscribeObservable);
};

const network = Network.create(fetchQuery, subscribe);

...

```

# Updating the client on each response

For more complex use-cases, you may wish to perform custom logic to update
Relay's in-memory cache when each subscription response is received. To do so,
pass an `updater` function:

```javascript
import { ConnectionHandler } from 'relay-runtime';

requestSubscription(
  environment,
  {
    subscription,
    variables,
    updater: store => {
      // Get the notification
      const rootField = store.getRootField('markReadNotification');
      const notification = rootField.getLinkedRecord('notification');
      // Add it to a connection
      const viewer = store.getRoot().getLinkedRecord('viewer');
      const notifications =
        ConnectionHandler.getConnection(viewer, 'notifications');
      const edge = ConnectionHandler.createEdge(
        store,
        notifications,
        notification,
        '<TypeOfNotificationsEdge>',
      );
      ConnectionHandler.insertEdgeAfter(notifications, edge);
    },
  },
);
```

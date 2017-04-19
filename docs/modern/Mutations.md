---
id: mutations
title: Mutations
layout: docs
category: Relay Modern
permalink: docs/mutations.html
next: babel-plugin-relay
---

Relay exposes the following APIs to perform mutations.

```javascript
const {commitMutation} = require('react-relay');

type Variables = {[name: string]: any};

commitMutation(
  environment: Environment,
  config: {
    mutation: GraphQLTaggedNode,
    variables: Variables,
    onCompleted?: ?(response: ?Object) => void,
    onError?: ?(error: Error) => void,
    optimisticResponse?: ?() => Object,
    optimisticUpdater?: ?(store: RecordSourceProxy) => void,
    updater?: ?(store: RecordSourceSelectorProxy) => void,
  },
);
```

Now let's take a closer look at the `config`:

* `mutation`: the `graphql` tagged mutation query.
* `variables`: an object that contains the variables needed for the mutation.
* `onCompleted`: a callback function executed with the 'raw' response from the server after the in-memory Relay store is updated with the `updater`.
* `onError`: a callback function executed when Relay encounters an error.
* `optimisticResponse`: a function that provides an object conforming to the mutation's response type definition. If an `optimisticUpdater` is not provided, Relay will use this to optimistically update the store.
* `optimisticUpdater`: a function that takes in a proxy of the in-memory Relay store. In this function, the client defines 'how to' update the store through the proxy in an imperative way.
* `updater`: a function that updates the in-memory Relay store based on the **real** server response. When the server response comes back, Relay first reverts any changes introduced by `optimisticUpdater` or `optimisticResponse` and then applies the `updater` to the store.

## Example

In a simple mutation, you only need `mutation` and `variables`:

```javascript
const {
  commitMutation,
  graphql,
} = require('react-relay');

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

const variables = {
  input: {
    source,
    storyID,
  },
};

function markNotificationAsRead(source, storyID) {
  commitMutation(
    environment,
    {
      mutation,
      variables,
      onCompleted: (response) => {
        console.log('Success!')
      },
      onError: err => console.error(err),
    },
  );
}
```

# Updating the client optimistically

To improve perceived responsiveness, you may wish to perform an "optimistic update", in which the client immediately updates to reflect the anticipated new value even before the response from the server has come back. We do this by providing an `optimisticResponse` and adding it to the `config` that we pass into `commitMutation`:

```javascript
const optimisticResponse = () => ({
  markReadNotification: {
    notification: {
      seenState: SEEN,
    },
  },
});

commitMutation(
  environment,
  {
    mutation,
    optimisticResponse,
    variables,
  },
);
```

# Simple Mutations: Updating a field

Relay exports `commitMutation(environment: Environment, config: MutationConfig)` for performing mutations.

```javascript
const {commitMutation} = require('react-relay');
```

Here is an overview of `MutationConfig`:

```javascript
type MutationConfig = {|
  mutation: GraphQLTaggedNode, // `graphql` mutation
  variables: Variables,        // variables for the mutation
  onCompleted?: ?(response: ?Object) => void,
  onError?: ?(error: Error) => void,
  // Returns an optimisticPayload that updates the in-memory cache if an optimisticUpdater is not provided
  optimisticResponse?: ?() => Object,
  // 'Optimistically' update the in-memory cache.
  optimisticUpdater?: ?(proxy: RecordSourceProxy) => void,
  // Update the in-memory cache based on the server response.
  updater?: ?(proxy: RecordSourceSelectorProxy) => void,
|};
```

## Performing the mutation on the server

In a simple mutation, you only need `mutation` and `variables`:

```javascript
const {commitMutation, graphql} = require('react-relay');

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
      onCompleted: () => console.log('Success!'),
      onError: err => console.error(err),
    },
  );
}
```

# Updating the client optimistically

To improve perceived responsiveness, you may wish to perform an "optimistic update", in which the client immediately updates to reflect the anticipated new value even before the response from the server has come back. We do this by providing an optimistic updater function and adding it to the `MutationConfig` that we pass into `commitMutation`:

```javascript
const optimisticUpdater = store => {
  const notification = store.get(storyID);
  if (notification) {
    notification.setValue(SEEN, 'seenState');
  }
};

// As before, but this time we're passing in the updater:
commitMutation(
  environment,
  {
    mutation,
    optimisticUpdater,
    variables,
  },
);
```
Alternatively, you can pass in an optimisticResponse, which returns an "optimistic payload" object that reflects what the server response would look like.
```javascript
const optimisticResponse = () => {
  const optimisticPayload = {
    markReadNotification: {
      notification: {
        seenState: SEEN,
      },
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

---
id: converting-mutations
title: Converting Mutations
original_id: converting-mutations
---
We made some changes to how mutations work in the new version of Relay in order to makes them more straight forward to use and more customizable. Mutations are currently not covered by an automatic conversion and require a manual upgrade. However, limited number of changes is needed to make your existing mutations work with both the old and new environment.

## Simplifying FatQueries to Standard GraphQL Queries

FatQueries in Relay Classic mutations was a concept that was confusing for a number of people. It required Relay to keep track of a significant amount of metadata regarding each record and automatically figure out the query to send to the server for the mutation. The logic to deduce the queries to send to the server was both complicated to maintain and slow to run. On top of that, we often had questions about why a particular field is included or skipped. We decided to allow people to have more control by allowing them write out exactly what data they want to update as the result of a mutation. Both individual fields and fragments can be included in these queries. Similar to container fragments, this is subjected to masking. That means only fields listed out directly will be accessible in the callbacks and the updater functions. The data fetched by in referenced fragments will still be updated in the store.

Example of existing fat query:

```javascript
  RelayClassic.QL`
    fragment on MarkReadNotificationResponsePayload @relay(pattern: true) {
      notification
    }
  `;
```

Example of converted mutation query:

```javascript
graphql`
  mutation MarkReadNotificationMutation(
    $input: MarkReadNotificationData!
  ) {
    markReadNotification(data: $input) {
      notification {
        seenState # include fields to be updated
        ... MyNotificationComponent_notification # reuse fragments from components to be updated
      }
    }
  }
`;
```

## Migrating Configs

### FIELDS_CHANGE

This is no longer needed in Compatibility Mode for neither environments. Relay will normalized the data using the mutation query and id to update the store automatically. You can remove it completely.

### RANGE_ADD

`RANGE_ADD` needs one additional property in the config named `connectionInfo` to work with the new environment. Learn more about `connectionInfo` [Mutation/RANGE_ADD](./Modern-Mutations.md#range-add)

### RANGE_DELETE

`RANGE_DELETE` needs one additional property in the config named `connectionKeys` to work with the new environment. Learn more about `connectionKeys` [Mutation/RANGE_DELETE](./Modern-Mutations.md#range-delete)

### NODE_DELETE

`NODE_DELETE` config will work as-is with the new environment. No change is needed.

## Converting a Simple Mutation

Take this example of a simple mutation in Relay Classic:

```javascript
class LikeStoryMutation extends RelayClassic.Mutation {
  getMutation() {
    return RelayClassic.QL`mutation {likeStory}`;
  }

  getVariables() {
    return {storyID: this.props.story.id};
  }

  getFatQuery() {
    return RelayClassic.QL`
      fragment on LikeStoryPayload @relay(pattern: true) {
        story {
          likers,
          likeSentence,
          viewerDoesLike,
        },
      }
    `;
  }

  getConfigs() {
    return [{
      type: 'FIELDS_CHANGE',
      fieldIDs: {
        story: this.props.story.id,
      },
    }];
  }

  static fragments = {
    story: () => Relay.QL`
      fragment on Story {
        id
      }
    `,
  };
}
```

### Converting `getMutation()` and `getFatQuery()`

We combine these two into a regular GraphQL mutation, which list out specific fields that needs to be updated.

```javascript
const mutation = graphql`
  mutation LikeStoryMutation($input: LikeStoryData!) {
    story(data: $input) {
      likers {
        count
      }
      likeSentence
      viewerDoesLike
    }
  }
`;
```

### Converting `getConfigs()`

As specified above, `FIELDS_CHANGE` configs can be omitted.

### Converting `getVariables()`

To convert `getVariables()`, we take the return value from the original function and wrap it in an object that contains a property that matches the variable name for the mutation. In this case, the mutation has a `input` variable that is of type `LikeStoryData`.

```javascript
const variables = {
  input: {
    storyID: args.storyID
  }
}
```

### Final Result

As you can see, our resulting mutation is a lot simpler and more like regular GraphQL than the Relay Classic version we started out with.

```javascript
const mutation = graphql`
  mutation LikeStoryMutation($input: LikeStoryData!) {
    story {
      likers {
        count
      },
      likeSentence,
      viewerDoesLike
    }
  }
`;

// environment should be passed in from your component as this.props.relay.environment
function commit(environment: CompatEnvironment, args) {
  const variables = {
    input: {
      storyID: args.storyID
    }
  };

  return commitMutation(environment, {
    mutation,
    variables,
  });
}
```

See [Mutation](./Modern-Mutations.md) for additional options on `commitMutation` for more complex mutations.

---
id: imperatively-modifying-store-data-experimental
title: Imperatively modifying store data (EXPERIMENTAL)
slug: /guided-tour/updating-data/imperatively-modifying-store-data-experimental/
description: Using readUpdatableQuery_EXPERIMENTAL to update store data
keywords:
- record source
- store
- updater
- typesafe updaters
- readUpdatableQuery
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

<FbInternalOnly>

:::caution
This section describes **experimental** APIs. Please reach out to [Robert Balicki](https://fb.workplace.com/profile.php?id=100042823931887) if you would like to adopt these APIs.

Please also see the [early adopter guide](https://fb.quip.com/4FZaADvkQPPl).
:::

</FbInternalOnly>

Data in Relay stores can be imperatively modified within updater functions.

## When to use updaters

### Complex client updates

You might provide an updater function if the changes to local data are more complex than what can be achieved by simply writing a network response to the store and cannot be handled by the declarative mutation directives.

### Client schema extensions

In addition, since the network response necessarily will not include data for fields defined in client schema extensions, you may wish to use an updater to initialize data defined in client schema extensions.

### Use of other APIs

Lastly, there are things you can only achieve using updaters, such as invalidating nodes, deleting nodes, finding all connections at a given field, etc.

### If multiple optimistic responses modify a given store value

If two optimistic responses affect a given value, and the first optimistic response is rolled back, the second one will remain applied.

For example, if two optimistic responses each increase a story's like count by one, and the first optimistic response is rolled back, the second optimistic response remains applied. However, it is **not recalculated**, and the value of the like count will remain increased by two.

## When **not** to use updaters

### To trigger other side effects

You should use the `onCompleted` callback to trigger other side effects.

## The various types of updater functions

The `useMutation` and `commitMutation` APIs accept configuration objects which can include `optimisticUpdater` and `updater` fields. The `requestSubscription` and `useSubscription` APIs accept configuration objects which can include `updater` fields.

In addition, there is another API (`commitLocalUpdate`) which also accepts an updater function. It will be discussed in the [Other APIs for modifying local data](../local-data-updates/) section.

## Optimistic updaters vs updaters

Mutations can have both optimistic and regular updaters. Optimistic updaters are executed when a mutation is triggered. When that mutation completes or errors, the optimistic update is rolled back.

Regular updaters are executed when a mutation completes successfully.

## Example

Let's construct an example in which an `is_new_comment` field (which is defined in a schema extension) is set to `true` on a newly created Feedback object in a mutation updater.

```graphql
# Feedback.graphql
extend type Feedback {
  is_new_comment: Boolean
}
```

```js
import type {Environment} from 'react-relay';
import type {
  FeedbackCreateData,
  CreateFeedbackMutation,
  CreateFeedbackMutation$data,
} from 'CreateFeedbackMutation.graphql';

import type {
  CreateFeedbackUpdatableQuery,
  CreateFeedbackUpdatableQuery$data,
} from 'CreateFeedbackUpdatableQuery.graphql';

const {commitMutation, graphql} = require('react-relay');
const {ConnectionHandler} = require('relay-runtime');

function commitCreateFeedbackMutation(
  environment: Environment,
  input: FeedbackCreateData,
) {
  return commitMutation<FeedbackCreateData>(environment, {
    mutation: graphql`
      mutation CreateFeedbackMutation($input: FeedbackCreateData!) {
        feedback_create(input: $input) {
          feedback {
            id
          }
        }
      }
    `,
    variables: {input},

    // Step 1: define an updater
    updater: (store: RecordSourceSelectorProxy, response: ?CreateCommentMutation$data) => {
      // Step 2: extract the ID of the newly-created feedback object
      const id = response?.feedback_create?.feedback?.id;
      if (id == null) {
        return;
      }

      // Step 3: call store.readUpdatableQuery_EXPERIMENTAL, and pass it a type parameter
      const updatableData: CreateFeedbackUpdatableQuery$data =
        store.readUpdatableQuery_EXPERIMENTAL<CreateFeedbackUpdatableQuery>(
          // Step 4: Pass it a query literal, where the query contains the @updatable directive.
          // This query literal describes the data in the store that you want to update.
          graphql`
            query CreateFeedbackUpdatableQuery($id: ID!) @updatable {
              node(id: $id) {
                ... on Feedback {
                  __typename
                  is_new_comment
                }
              }
            }
          `,
          {id}
        );

      // Step 5: Access the field, and mutate the updatableData
      if (updatableData.node?.__typename === 'Feedback') {
        // In this block, Flow understands that updatableData.node is a Feedback item
        updatableData.node.is_new_comment = true;
      }
    },
  });
}

module.exports = {commit: commitCreateFeedbackMutation};
```

<FbInternalOnly>

:::note
If available, the auto-generated `fetch__Feedback` field can make this example simpler.
:::

</FbInternalOnly>

Let's distill what's going on here.

* The `updater` accepts two parameters: a `RecordSourceSelectorProxy` and an optional object that is the result of reading out the mutation response.
    * The type of this `data` argument is a nullable version of the `$data` type that is imported from the generated mutation file.
    * The `data` arguments contains just the data selected directly by the mutation argument. In other words, if another fragment is spread in the mutation, the data from that fragment will not be available within `data` by default.
* This `updater` is executed after the mutation response has been written to the store. In other words, we can assume that the returned feedback object exists for any data that is read out through the `store` object in the updater.
* In this example updater, we do three things:
  * First, we get the ID of the newly created Feedback object.
  * Next, we call `readUpdatableQuery_EXPERIMENTAL`. We pass it a GraphQL query that has the `@updatable` directive. This defines the data that we wish to access and update.
  * Next, we modify the value that was returned from `readUpdatableQuery_EXPERIMENTAL`. In this case, `updatableData.node.is_new_comment = true` calls a lower-level and older API (`proxy.setValue(...)`) under the hood.
    * Note that in order to have `updatableData.node.is_new_comment = true` typecheck, we must refine the type of `updatableData.node`. We must check that it isn't optional, and that the typename matches what we expect. Otherwise, Flow will complain.
* Once this updater completes, the updates that have been recorded are written to the store, and all affected components are re-rendered.

## Example 2: Updating data in response to user interactions

Let's consider the common case of updating store data in response to a user interaction.  In a click handler, let's a toggle an `is_selected` field. This field is defined on Users in a client schema extension.

```graphql
# User.graphql
extend type User {
  is_selected: Boolean
}
```

```js
import type {UserSelectToggle_user$ref, UserSelectToggle_user} from 'UserSelectToggle_user.graphql';
import type {
  UserSelectToggleUpdatableQuery,
  UserSelectToggleUpdatableQuery$data,
} from 'UserSelectToggleUpdatableQuery.graphql';

const {useRelayEnvironment, commitLocalUpdate} = require('react-relay');

function UserSelectToggle({ userId, userRef }: {
  userId: string,
  userRef: UserSelectToggle_user$ref,
}) {
  const data = useFragment<UserSelectToggle_user>(graphql`
    fragment UserSelectToggle_user on User {
      id @required(action: THROW)
      name @required(action: THROW)
      is_selected
    }
  `, userRef);

  const environment = useRelayEnvironment();

  return <button
    onClick={() => {
      commitLocalUpdate(
        environment,
        (store: RecordSourceSelectorProxy) => {
          const updatableData: UserSelectToggleUpdatableQuery$data =
            store.readUpdatableQuery_EXPERIMENTAL<UserSelectToggleUpdatableQuery>(
            graphql`
              query UserSelectToggleUpdatableQuery($id: ID!) @updatable {
                node(id: $id) {
                  ... on User {
                    __typename
                    is_selected
                  }
                }
              }
            `,
            {id: data.id}
          );

          if (updatableData.node?.__typename === 'User') {
            updatableData.node.is_selected = !data.is_selected;
          }
        }
      );
    }}
  >
    {data.is_selected ? 'Deselect' : 'Select'} {data.name}
  </button>
}
```

Let's distill what's going on here.

* In a click handler, we call `commitLocalUpdate`, which accepts a Relay environment and an updater function. **Unlike in the previous examples, this updater does not accept a second parameter** because there is no associated network payload.
* In this updater function, we access get an updatable data object by calling `store.readUpdatableQuery_EXPERIMENTAL`, access the current user and toggle the `is_selected` field.

<FbInternalOnly>

:::note
If available, the auto-generated `fetch__User` field can make this example simpler.
:::

</FbInternalOnly>

:::note
This example can be rewritten using the `environment.commitPayload` API, albeit without type safety.
:::

<DocsRating />

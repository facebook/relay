---
id: imperatively-modifying-store-data
title: Imperatively modifying store data
slug: /guided-tour/updating-data/imperatively-modifying-store-data/
description: Using readUpdatableQuery to update scalar fields in the store
keywords:
- record source
- store
- updater
- typesafe updaters
- readUpdatableQuery
- readUpdatableFragment
- updatable
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

:::note
See also [this guide on updating linked fields in the store](../imperatively-modifying-linked-fields).
:::

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

You should use the `onCompleted` callback to trigger other side effects. `onCompleted` callbacks are guaranteed to be called once, but updaters and optimistic updaters can be called repeatedly.

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
// CreateFeedback.js
import type {Environment} from 'react-relay';
import type {
  FeedbackCreateData,
  CreateFeedbackMutation,
  CreateFeedbackMutation$data,
} from 'CreateFeedbackMutation.graphql';

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
            # Step 1: in the mutation response, spread an updatable fragment (defined below).
            # This updatable fragment will select the fields that we want to update on this
            # particular feedback object.
            ...CreateFeedback_updatable_feedback
          }
        }
      }
    `,
    variables: {input},

    // Step 2: define an updater
    updater: (store: RecordSourceSelectorProxy, response: ?CreateCommentMutation$data) => {
      // Step 3: Access and nullcheck the feedback object.
      // Note that this could also have been achieved with the @required directive.
      const feedbackRef = response?.feedback_create?.feedback;
      if (feedbackRef == null) {
        return;
      }

      // Step 3: call store.readUpdatableFragment
      const {updatableData} = store.readUpdatableFragment(
          // Step 4: Pass it a fragment literal, where the fragment contains the @updatable directive.
          // This fragment selects the fields that you wish to update on the feedback object.
          // In step 1, we spread this fragment in the query response.
          graphql`
            fragment CreateFeedback_updatable_feedback on Feedback @updatable {
              is_new_comment
            }
          `,
          // Step 5: Pass the fragment reference.
          feedbackRef
        );

      // Step 6: Mutate the updatableData object!
      updatableData.is_new_comment = true;
    },
  });
}

module.exports = {commit: commitCreateFeedbackMutation};
```

Let's distill what's going on here.

* The `updater` accepts two parameters: a `RecordSourceSelectorProxy` and an optional object that is the result of reading out the mutation response.
    * The type of this second argument is a nullable version of the `$data` type that is imported from the generated mutation file.
    * The second argument contains just the data selected directly by the mutation argument. In other words, it will not contain any fields selected solely by spread fragments.
* This `updater` is executed after the mutation response has been written to the store.
* In this example updater, we do three things:
  * First, we spread an updatable fragment in the mutation response.
  * Second, we read out the fields selected by this fragment by calling `readUpdatableFragment`. This returns an updatable proxy object.
  * Third, we update fields on this updatable proxy.
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
// UserSelectToggle.react.js
import type {RecordSourceSelectorProxy} from 'react-relay';
import type {UserSelectToggle_viewer$key} from 'UserSelectToggle_viewer.graphql';

const {useRelayEnvironment, commitLocalUpdate} = require('react-relay');

function UserSelectToggle({ userId, viewerRef }: {
  userId: string,
  viewerRef: UserSelectToggle_viewer$key,
}) {
  const viewer = useFragment(graphql`
    fragment UserSelectToggle_viewer on Viewer {
      user(user_id: $user_id) {
        id
        name
        is_selected
        ...UserSelectToggle_updatable_user
      }
    }
  `, viewerRef);

  const environment = useRelayEnvironment();

  return <button
    onClick={() => {
      commitLocalUpdate(
        environment,
        (store: RecordSourceSelectorProxy) => {
          const userRef = viewer.user;
          if (userRef == null) {
            return;
          }

          const {updatableData} = store.readUpdatableFragment(
            graphql`
              fragment UserSelectToggle_updatable_user on User @updatable {
                is_selected
              }
            `,
            userRef
          );

          updatableData.is_selected = !viewer?.user?.is_selected;
        }
      );
    }}
  >
    {viewer?.user?.is_selected ? 'Deselect' : 'Select'} {viewer?.user?.name}
  </button>
}
```

Let's distill what's going on here.

* In a click handler, we call `commitLocalUpdate`, which accepts a Relay environment and an updater function. **Unlike in the previous examples, this updater does not accept a second parameter** because there is no associated network payload.
* In this updater function, we access get an updatable proxy object by calling `store.readUpdatableFragment`, and toggle the `is_selected` field.
* Like the previous example in which we called `readUpdatableFragment`, this can be rewritten to use the `readUpdatableQuery` API.

:::note
This example can be rewritten using the `environment.commitPayload` API, albeit without type safety.
:::

## Alternative API: `readUpdatableQuery`.

In the previous examples, we used an updatable fragment to access the record whose fields we want to update. This can also be possible to do with an updatable query.

If we know the path from the root (i.e. the object whose type is `Query`) to the record we wish to modify, we can use the `readUpdatableQuery` API to achieve this.

For example, we could set the viewer's `name` field in response to an event as follows:

```js
// NameUpdater.react.js
function NameUpdater({ queryRef }: {
  queryRef: NameUpdater_viewer$key,
}) {
  const environment = useRelayEnvironment();
  const data = useFragment(
    graphql`
      fragment NameUpdater_viewer on Viewer {
        name
      }
    `,
    queryRef
  );
  const [newName, setNewName] = useState(data?.viewer?.name);
  const onSubmit = () => {
    commitLocalUpdate(environment, store => {
      const {updatableData} = store.readUpdatableQuery(
        graphql`
          query NameUpdaterUpdateQuery @updatable {
            viewer {
              name
            }
          }
        `,
        {}
      );
      const viewer = updatableData.viewer;
      if (viewer != null) {
        viewer.name = newName;
      }
    });
  };

  // etc
}
```

* This particular example can be rewritten using `readUpdatableFragment`. However, you may prefer `readUpdatableQuery` for several reasons:
  * You do not have ready access to a fragment reference, e.g. if the call to `commitLocalUpdate` is not obviously associated with a component.
  * You do not have ready access to a fragment where we select the **parent record** of the record we wish to modify (e.g. the `Query` in this example). Due to a known type hole in Relay, **updatable fragments cannot be spread at the top level.**
  * You wish to use variables in the updatatable fragment. Currently, updatable fragments reuse the variables that were passed to the query. This means that you cannot, for example, have an updatable fragment with fragment-local variables and call `readUpdatableFragment` multiple times, each time passing different variables.

<DocsRating />

---
id: graphql-mutations
title: GraphQL mutations
slug: /guided-tour/updating-data/graphql-mutations/
description: Relay guide to GraphQL mutations
keywords:
- mutation
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

In GraphQL, data on the server is updated using [GraphQL mutations](https://graphql.org/learn/mutations/) -- analogous to an HTTP POST request. Mutations are read-write server operations, which both modify the data on the backend and allow you to query the modified data in the same request. Note that mutations are opaque to Relay and don't directly update the Relay store, they are high-level requests sent to the server to express a user's intent.

## Writing Mutations

A GraphQL mutation looks very similar to a query, except that it uses the `mutation` keyword:

```js
const StoryLikeButtonLikeMutation = graphql`
  mutation StoreLikeButtonLikeMutation(
    // color1
    $id: ID!
  ) {
    // color2
    likeStory(
      id: $id
    ) {
      // color3
      story {
        likeCount
      }
    }
  }
`;
```

* This mutation is named `StoryLikeButton` + `Like` + `Mutation` (note it must begin with the module name and end with the GraphQL operation).
* A mutation may declare <span className="color1">variables</span> which are passed from the client to the server when the mutation is dispatched. Each variable has a name (`$id`) and a type (`ID!`).
* The mutation selects a <span className="color2">mutation field</span> defined in the GraphQL schema. Each mutation field that the server defines should correspond to some action that the client can request of the server, such as liking a story. Just like any field, a mutation field can accept arguments to send to the server.
* The `likeStory` field returns an edge to a node that represents the mutation response. The fields that are available in the mutation response are specified by the GraphQL schema. In this example, we select the `story` field, which is an <span className="color3">edge to the Story that we just liked</span>. From the `story` field, we can query any fields on the Story type, such as the `likeCount`.

<FbInternalOnly>

:::info
You can view mutation root fields in the GraphQL Schema Explorer by opening VSCode @ FB and executing the command "Relay: Open GraphQL Schema Explorer". Then, in the "Schema Explorer Tab", click on "Mutation".

You can click on the various mutation fields to see their parameters, descriptions and exposed fields.
:::

</FbInternalOnly>

A mutation is handled in two separate steps: first, the update is processed on the server, and then the query is executed. This ensures that you only see data that has already been updated as part of your mutation response.

<FbInternalOnly>

* [It is a best practice](https://fb.workplace.com/groups/644933736023601/?multi_permalinks=823422684841371) to include the `viewer` object and all updated Ents as part of the mutation response.

* Check out the [Hack documentation on writing mutations](https://www.internalfb.com/intern/wiki/Graphql-for-hack-developers/mutation-root-fields/) for information on how to add a mutation field to your backend code.

</FbInternalOnly>

An example of a successful response for the above mutation could look like this:

```json
{
  "likeStory": {
    "story": {
      "id": "34a8c",
      "likeCount": 47,
    }
  }
}
```

In the simple case, Relay will automatically update the data in the local store with this new information. In some more complex cases, custom code will be required to tell Relay handle the updates. Read more about this in the [Updaters] section.

:::tip[Best Practice]
In the above example, we select fields individually in the mutation response. Often, these fields will be the same as a fragment related to the mutation (for example, a query for some `StoryLikeButton` component). Rather than have two separate sets of fields that should be kept in sync, it's best practice to spread the component fragment into the mutation response. This way, whenever the fragment changes in your code, the mutation will also return the correct updated data.

For example,
```
const StoryLikeButtonLikeMutation = graphql`
  mutation StoryLikeButtonLikeMutation(
    $id: ID,
  ) {
    likeStory(id: $id) {
      story {
        ...StoryLikeButtonFragment
      }
    }
  }
`;
```

Spreading fragments is also generally preferable to refetching the data after a mutation has completed, since the updated data can be fetched in a single round trip.
:::

:::info
**How does Relay know how to update the store?**
Whenever the response includes an object with an `id` field, Relay will check if the store already contains a record with a matching `ID` in the `id` field of that record. If there is a match, Relay will merge the other fields from the response into the existing record.
:::

## Using a mutation in Relay
Mutations in Relay are accessed using the [`useMutation`](../../../api-reference/use-mutation) hook. The hook returns a function to actually send the mutation to the server (e.g. `commitMutation` below), along with a boolean variable to indicate if a mutation is in flight (e.g. `isMutationInFlight`). This is useful for showing pending states like a loading spinner or disabling a "submit" button.

For example, using the `StoryLikeButtonLikeMutation` above:
```
const [commitMutation, isMutationInFlight] = useMutation(StoryLikeButtonLikeMutation);
function onLikeButtonClicked() {
  commitMutation({
    variables: {
      id: data.id,
    },
  })
}
const LikeButton = <button onClick={onLikeButtonClicked} disabled={isMutationInFlight}>Like</button>
```

Note that `commitMutation` takes the variables defined on the mutation in the form of an object.

Once that field is executed, the backend will select the updated Feedback object and select `like_count` field off of it. Since the `Story` type contains an `id` field, the Relay compiler will automatically add a selection for the `id` field. When the mutation response is received, Relay will find a feedback object in the store with a matching `id` and update it with the newly received `like_count` value. If this value changes as a result, any components using the value re-rendered.

:::note
If you are using TypeScript or Flow, it's best practice to include a type parameters to the `useMutation` hook:
```tsx
import type {StoryLikeButtonLikeMutation$data, StoryLikeButtonLikeMutation$variables} from 'StoryLikeButtonLikeMutation.graphql';
const [commitMutation, isMutationInFlight] = useMutation<
  StoryLikeButtonLikeMutationType$variables,
  StoryLikeButtonLikeMutationType$data,
>(StoryLikeButtonLikeMutation);
```
:::

## Executing a callback when the mutation completes or errors

We may want to update some state in response to the mutation succeeding or failing. For example, we might want to alert the user if the mutation failed. The `UseMutationConfig` object passed to `commitMutation` can include the following fields to handle such cases:

* `onCompleted`, a callback that is executed when the mutation completes. It is passed the mutation response (stopping at fragment spread boundaries).
  * The value passed to `onCompleted` is the the mutation fragment, as read out from the store, **after** updaters and declarative mutation directives are applied. This means that data from within unmasked fragments will not be read, and records that were deleted (e.g. by `@deleteRecord`) may also be null.
* `onError`, a callback that is executed when the mutation errors. It is passed the error that occurred.

## Declarative mutation directives

### Manipulating connections in response to mutations

Relay makes it easy to respond to mutations by adding or removing items from connections (i.e. lists). For example, you might want to append a newly created user to a given connection. For more, see [Using declarative directives](../../list-data/updating-connections/#using-declarative-directives).

### Deleting items in response to mutations

In addition, you might want to delete an item from the store in response to a mutation. In order to do this, you would add the `@deleteRecord` directive to the deleted ID. For example:

```graphql
mutation DeletePostMutation($input: DeletePostData!) {
  delete_post(data: $input) {
    deleted_post {
      id @deleteRecord
    }
  }
}
```

## Imperatively modifying local data

At times, the updates you wish to perform are more complex than just updating the values of fields and cannot be handled by the declarative mutation directives. For such situations, the `UseMutationConfig` accepts an `updater` function which gives you full control over how to update the store.

This is discussed in more detail in the section on [Imperatively modifying store data](../imperatively-modifying-store-data/).

## Optimistic updates

Oftentimes, we don't want to wait for the server to respond before we respond to the user interaction. For example, if a user clicks the "Like" button, we would like to instantly show the affected comment, post, etc. has been liked by the user.

More generally, in these cases, we want to immediately update the data in our store optimistically, i.e. under the assumption that the mutation will complete successfully. If the mutation ends up not succeeding, we would like to roll back that optimistic update.

### Optimistic response

In order to enable optimistic udpates, the `UseMutationConfig` can include an `optimisticResponse` field.

For this field to be Flow-typed, the call to `useMutation` must be passed a Flow type parameter **and** the mutation must be decorated with a `@raw_response_type` directive.

In the previous example, we might provide the following optimistic response:

```js
{
  feedback_like: {
    feedback: {
      // Even though the id field is not explicitly selected, the
      // compiler selected it for us
      id: feedbackId,
      viewer_does_like: true,
    },
  },
}
```

Now, when we call `commitMutation`, this data will be immediately written into the store. The item in the store with the matching id will be updated with a new value of `viewer_does_like`. Any components which have selected this field will be re-rendered.

When the mutation succeeds or errors, the optimistic response will be rolled back.

Updating the `like_count` field takes a bit more work. In order to update it, we should also read the **current like count** in the component.

```js
import type {FeedbackLikeData, LikeButtonMutation} from 'LikeButtonMutation.graphql';
import type {LikeButton_feedback$fragmentType} from 'LikeButton_feedback.graphql';

const {useMutation, graphql} = require('react-relay');

function LikeButton({
  feedback: LikeButton_feedback$fragmentType,
}) {
  const data = useFragment(
    graphql`
      fragment LikeButton_feedback on Feedback {
        __id
        viewer_does_like @required(action: THROW)
        like_count @required(action: THROW)
      }
    `,
    feedback
  );

  const [commitMutation, isMutationInFlight] = useMutation<LikeButtonMutation>(
    graphql`
      mutation LikeButtonMutation($input: FeedbackLikeData!)
      @raw_response_type {
        feedback_like(data: $input) {
          feedback {
            viewer_does_like
            like_count
          }
        }
      }
    `
  );

  const changeToLikeCount = data.viewer_does_like ? -1 : 1;
  return <button
    onClick={() => commitMutation({
      variables: {
        input: {id: data.__id},
      },
      optimisticResponse: {
        feedback_like: {
          feedback: {
            id: data.__id,
            viewer_does_like: !data.viewer_does_like,
            like_count: data.like_count + changeToLikeCount,
          },
        },
      },
    })}
    disabled={isMutationInFlight}
  >
    Like
  </button>
}
```

:::caution

You should be careful, and consider using [optimistic updaters](../imperatively-modifying-store-data/#example) if the value of the optimistic response depends on the value of the store and if there can be multiple optimistic responses affecting that store value.

For example, if **two** optimistic responses each increase the like count by one, and the **first** optimistic updater is rolled back, the second optimistic update will still be applied, and the like count in the store will remain increased by two.

:::

:::caution

Optimistic responses contain **many pitfalls!**

* An optimistic response can contain the data for the full query response, i.e. including the content of fragment spreads. This means that if a developer selects more fields in components whose fragments are spread in an optimistic response, these components may have inconsistent or partial data during an optimistic update.
* Because the type of the optimistic update includes the contents of all recursively nested fragments, it can be very large. Adding `@raw_response_type` to certain mutations can degrade the performance of the Relay compiler.

:::

### Optimistic updaters

Optimistic responses aren't enough for every case. For example, we may want to optimistically update data that we aren't selecting in the mutation. Or, we may want to add or remove items from a connection (and the declarative mutation directives are insufficient for our use case.)

For situations like these, the `UseMutationConfig` can contain an `optimisticUpdater` field, which allows developers to imperatively and optimistically update the data in the store. This is discussed in more detail in the section on [Imperatively updating store data](../imperatively-modifying-store-data/).

## Order of execution of updater functions

In general, execution of the `updater` and optimistic updates will occur in the following order:

* If an `optimisticResponse` is provided, that data will be written into the store.
* If an `optimisticUpdater` is provided, Relay will execute it and update the store accordingly.
* If an `optimisticResponse` was provided, the declarative mutation directives present in the mutation will be processed on the optimistic response.
* If the mutation request succeeds:
    * Any optimistic update that was applied will be rolled back.
    * Relay will write the server response to the store.
    * If an `updater` was provided, Relay will execute it and update the store accordingly. The server payload will be available to the `updater` as a root field in the store.
    * Relay will process any declarative mutation directives using the server response.
    * The `onCompleted` callback will be called.
* If the mutation request fails:
    * Any optimistic update was applied will be rolled back.
    * The `onError` callback will be called.

:::note
In the case that the store is updated while the mutation is still in flight, Relay will first revert your optimistic update, then apply the new store update before re-applying the optimistic update.
:::

## Invalidating data during a mutation

The recommended approach when executing a mutation is to request *all* the relevant data that was affected by the mutation back from the server (as part of the mutation body), so that our local Relay store is consistent with the state of the server.

However, often times it can be unfeasible to know and specify all the possible data that would be affected for mutations that have large rippling effects (e.g. imagine "blocking a user" or "leaving a group").

For these types of mutations, it's often more straightforward to explicitly mark some data as stale (or the whole store), so that Relay knows to refetch it the next time it is rendered. In order to do so, you can use the data invalidation APIs documented in our [Staleness of Data section](../../reusing-cached-data/staleness-of-data/).

<FbInternalOnly>

## Handling errors

GraphQL errors can largely be differentiated as:

1. Operation (query/mutation/subscription) level errors, and
2. Field level errors

### Surfacing mutation level errors

If you're surfacing an error in the mutation (eg the server rejects the entire mutation because it's invalid), as long as the error returned is considered a [`CRITICAL`](https://www.internalfb.com/code/www/[b5a08782893a]/flib/graphql/experimental/core/error/GraphQL2ErrorSeverity.php?lines=11) error, you can make use of the `onError` callback from `useMutation` to handle that error in whatever way you see fit for your use case.

If you control the server resolver, the question you should ask is whether or not throwing a CRITICAL error is the correct behavior for the client. Note though that throwing a CRITICAL error means that Relay will no longer process the interaction, which may not always be what you want if you can still partially update your UI. For example, it's possible that the mutation errored, but still wrote some data to the database, in which case you might still want Relay to process the updated fields.

In the non-CRITICAL case the mutation may have failed, but some data was successfully returned in the case of partial data and/or the error response if encoded in the schema. Relay will still process this data, update its store, as well as components relying on that data. That is not true for the case where you've returned a CRITICAL error.

### Surfacing field level errors
Field level errors from the server are generally recommended to be at the [`ERROR`](https://www.internalfb.com/code/www/[9120ab8aa8a5]/flib/graphql/experimental/core/error/GraphQL2ErrorSeverity.php?lines=17) level, because your UI should still be able to process the other fields that were successfully returned. If you want to explicitly handle the field level error, then we still recommend [modeling that](../../rendering/error-states/#accessing-errors-in-graphql-responses) in your schema.

</FbInternalOnly>


<DocsRating />

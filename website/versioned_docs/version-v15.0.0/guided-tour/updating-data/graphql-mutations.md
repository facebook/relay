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

In GraphQL, data on the server is updated using [GraphQL mutations](https://graphql.org/learn/queries/#mutations). Mutations are read-write server operations, which both modify the data on the backend and allow you to query the modified data in the same request.

## Writing Mutations

A GraphQL mutation looks very similar to a query, except that it uses the `mutation` keyword:

```graphql
mutation FeedbackLikeMutation($input: FeedbackLikeData!) {
  feedback_like(data: $input) {
    feedback {
      id
      viewer_does_like
      like_count
    }
  }
}
```

* The mutation above modifies the server data to "like" the specified `Feedback` object.
* `feedback_like` is a *mutation root field* (or just *mutation field*) which updates data on the backend.

<FbInternalOnly>

:::info
You can view mutation root fields in the GraphQL Schema Explorer by opening VSCode @ FB and executing the command "Relay: Open GraphQL Schema Explorer". Then, in the "Schema Explorer Tab", click on "Mutation".

You can click on the various mutation fields to see their parameters, descriptions and exposed fields.
:::

</FbInternalOnly>

* A mutation is handled in two separate steps: first, the update is processed on the server, and then the query is executed. This ensures that you only see data that has already been updated as part of your mutation response.

:::note
Note that queries are processed in the same way. Outer selections are calculated before inner selections. It is simply a matter of convention that top-level mutation fields have side-effects, while other fields tend not to.
:::

* The mutation field (in this case, `feedback_like`) returns a specific GraphQL type which exposes the data for which we can query in the mutation response.

<FbInternalOnly>

* [It is a best practice](https://fb.workplace.com/groups/644933736023601/?multi_permalinks=823422684841371) to include the `viewer` object and all updated Ents as part of the mutation response.

</FbInternalOnly>

* In this case, we're querying for the *updated* feedback object, including the updated `like_count` and the updated value for `viewer_does_like`, indicating whether the current viewer likes the feedback object.

<FbInternalOnly>

* Check out the [Hack documentation on writing mutations](https://www.internalfb.com/intern/wiki/Graphql-for-hack-developers/mutation-root-fields/) for information on how to add a mutation field to your backend code.

</FbInternalOnly>

An example of a successful response for the above mutation could look like this:

```json
{
  "feedback_like": {
    "feedback": {
      "id": "feedback-id",
      "viewer_does_like": true,
      "like_count": 1,
    }
  }
}
```

In Relay, we can declare GraphQL mutations using the `graphql` tag too:

```js
const {graphql} = require('react-relay');

const feedbackLikeMutation = graphql`
  mutation FeedbackLikeMutation($input: FeedbackLikeData!) {
    feedback_like(data: $input) {
      feedback {
        id
        viewer_does_like
        like_count
      }
    }
  }
`;
```

* Note that mutations can also reference GraphQL [variables](../../rendering/variables/) in the same way queries or fragments do.

## Using `useMutation` to execute a mutation

In order to execute a mutation against the server in Relay, we can use the `commitMutation` and [useMutation](../../../api-reference/use-mutation) APIs. Let's take a look at an example using the `useMutation` API:

```js
import type {FeedbackLikeData, LikeButtonMutation} from 'LikeButtonMutation.graphql';

const {useMutation, graphql} = require('react-relay');

function LikeButton({
  feedbackId: string,
}) {
  const [commitMutation, isMutationInFlight] = useMutation<LikeButtonMutation>(
    graphql`
      mutation LikeButtonMutation($input: FeedbackLikeData!) {
        feedback_like(data: $input) {
          feedback {
            viewer_does_like
            like_count
          }
        }
      }
    `
  );

  return <button
    onClick={() => commitMutation({
      variables: {
        input: {id: feedbackId},
      },
    })}
    disabled={isMutationInFlight}
  >
    Like
  </button>
}
```

Let's distill what's happening here.

* `useMutation` takes a graphql literal containing a mutation as its only argument.
* It returns a tuple of items:
  * a callback (which we call `commitMutation`) which accepts a `UseMutationConfig`, and
  * a boolean indicating whether a mutation is in flight.
* In addition, `useMutation` accepts a Flow type parameter. As with queries, the Flow type of the mutation is exported from the file that the Relay compiler generates.
  * If this type is provided, the `UseMutationConfig` becomes statically typed as well. **It is a best practice to always provide this type.**
* Now, when `commitMutation` is called with the mutation variables, Relay will make a network request that executes the `feedback_like` field on the server. In this example, this would find the feedback specified by the variables, and record on the backend that the user liked that piece of feedback.
* Once that field is executed, the backend will select the updated Feedback object and select the `viewer_does_like` and `like_count` fields off of it.
  * Since the `Feedback` type contains an `id` field, the Relay compiler will automatically add a selection for the `id` field.
* When the mutation response is received, Relay will find a feedback object in the store with a matching `id` and update it with the newly received `viewer_does_like` and `like_count` values.
* If these values have changed as a result, any components which selected these fields off of the feedback object will be re-rendered. Or, to put it colloquially, any component which depends on the updated data will re-render.

:::note
The name of the type of the parameter `FeedbackLikeData` is derived from the name of the top-level mutation field, i.e. from `feedback_like`. This type is also exported from the generated `graphql.js` file.
:::

## Refreshing components in response to mutations

In the previous example, we manually selected `viewer_does_like` and `like_count`. Components that select these fields will be re-rendered, should the value of those fields change.

However, it is generally better to spread fragments that correspond to components that we want to refresh in response to the mutation. This is because the data selected by components can change.

Requiring developers to know about all mutations that might affect their components' data (and keeping them up-to-date) is an example of the kind of global reasoning that Relay wants to avoid requiring.

For example, we might rewrite the mutation as follows:

```graphql
mutation FeedbackLikeMutation($input: FeedbackLikeData!) {
  feedback_like(data: $input) {
    feedback {
      ...FeedbackDisplay_feedback
      ...FeedbackDetail_feedback
    }
  }
}
```

If this mutation is executed, then whatever fields were selected by the `FeedbackDisplay` and `FeedbackDetail` components will be refetched, and those components will remain in a consistent state.

:::note
Spreading fragments is generally preferable to refetching the data after a mutation has completed, since the updated data can be fetched in a single round trip.
:::

## Executing a callback when the mutation completes or errors

We may want to update some state in response to the mutation succeeding or failing. For example, we might want to alert the user if the mutation failed. The `UseMutationConfig` object can include the following fields to handle such cases:

* `onCompleted`, a callback that is executed when the mutation completes. It is passed the mutation response (stopping at fragment spread boundaries).
  * The value passed to `onCompleted` is the the mutation fragment, as read out from the store, **after** updaters and declarative mutation directives are applied. This means that data from within unmasked fragments will not be read, and records that were deleted (e.g. by `@deleteRecord`) may also be null.
* `onError`, a callback that is executed when the mutation errors. It is passed the error that occurred.

## Declarative mutation directives

### Manipulating connections in response to mutations

Relay makes it easy to respond to mutations by adding items to or removing items from connections (i.e. lists). For example, you might want to append a newly created user to a given connection. For more, see [Using declarative directives](../../list-data/updating-connections/#using-declarative-directives).

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

In order to enable this, the `UseMutationConfig` can include an `optimisticResponse` field.

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

## Invalidating data during a mutation

The recommended approach when executing a mutation is to request *all* the relevant data that was affected by the mutation back from the server (as part of the mutation body), so that our local Relay store is consistent with the state of the server.

However, often times it can be unfeasible to know and specify all the possible data the possible data that would be affected for mutations that have large rippling effects (e.g. imagine "blocking a user" or "leaving a group").

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

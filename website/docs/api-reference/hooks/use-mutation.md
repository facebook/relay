---
id: use-mutation
title: useMutation
slug: /api-reference/use-mutation/
description: API reference for useMutation, a React hook used to execute a GraphQL mutation
keywords:
  - mutation
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
import FbUseMutationParameter from './fb/FbUseMutationParameter.md';

## `useMutation`

Hook used to execute a mutation in a React component.

```js
import type {FeedbackLikeMutation} from 'FeedbackLikeMutation.graphql';
const React = require('React');

const {graphql, useMutation} = require('react-relay');

function LikeButton() {
  const [commit, isInFlight] = useMutation<FeedbackLikeMutation>(graphql`
    mutation FeedbackLikeMutation($input: FeedbackLikeData!) {
      feedback_like(data: $input) {
        feedback {
          id
          viewer_does_like
          like_count
        }
      }
    }
  `);

  if (isInFlight) {
    return <Spinner />;
  }

  return (
    <button
      onClick={() => {
        commit({
          variables: {
            input: {
              id: '123',
              text: 'text',
            },
          },
          onCompleted(data) {
            console.log(data);
          },
        });
      }}
    />
  );
}
```

### Arguments

* `mutation`: GraphQL mutation specified using a `graphql` template literal.

<OssOnly>

* `commitMutationFn`: `<T: MutationParameters>(IEnvironment, MutationConfig<T>): Disposable`. *_[Optional]_* A function with the same signature as [`commitMutation`](../commit-mutation), which will be called in its stead. Defaults to `commitMutation`.

</OssOnly>

<FbUseMutationParameter />


### Flow Type Parameters

* `TMutation`: Type parameter that should corresponds the Flow type for the mutation query. This type is available to import from the the auto-generated file: `<mutationName>.graphql.js`.

### Return Value

Tuple containing the following values:

* [0] `commitMutation`: The function that will execute the mutation
    * Arguments, the syntax signature is almost the same as our `commitMutation` API
        * `variables`: Object containing the variables needed for the mutation. For example, if the mutation defines an `$input` variable, this object should contain an `input` key, whose shape must match the shape of the data expected by the mutation as defined by the GraphQL schema.
        * `onCompleted`: Callback function executed when the request is completed and the in-memory Relay store is updated with the `updater` function. Takes a `response` object, which is the "raw" server response. Internally `errors` are not allowed, `CRITICAL` error will be thrown in the `onError` handler.
        * `onError`: Callback function executed if Relay encounters an error during the request. Internally, `CRITICAL` error during reading the mutation result on the server
        * `optimisticResponse`: Object containing the data to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. This object must have the same shape as the mutation's response type, as defined by the GraphQL schema. If provided, Relay will use the `optimisticResponse` data to update the fields on the relevant records in the local data store, *before* `optimisticUpdater` is executed. If an error occurs during the mutation request, the optimistic update will be rolled back.
        * `optimisticUpdater`: Function used to optimistically update the local in-memory store, i.e. immediately, before the mutation request has completed. If an error occurs during the mutation request, the optimistic update will be rolled back. This function takes a `store`, which is a proxy of the in-memory [Relay Store](../store/). In this function, the client defines how to update the local data via the `store` instance. For details on how to use the `store`, please refer to our [Relay Store API Reference](../store/). Please note:
            * It is usually preferable to just pass an `optimisticResponse` option instead of an `optimisticUpdater`, unless you need to perform updates on the local records that are more complicated than just updating fields (e.g. deleting records or adding items to collections).
            * If you do decide to use an `optimisticUpdater`, often times it can be the same function as `updater`.
        * `updater`: Function used to update the local in-memory store based on the real server response from the mutation. If `updater` is not provided, by default, Relay will know to automatically update the fields on the records referenced in the mutation response; however, you should pass an `updater` if you need to make more complicated updates than just updating fields (e.g. deleting records or adding items to collections). When the server response comes back, Relay first reverts any changes introduced by `optimisticUpdater` or `optimisticResponse` and will then execute `updater`. This function takes a `store`, which is a proxy of the in-memory [Relay Store](../store/). In this function, the client defines how to update the local data based on the server response via the `store` instance. For details on how to use the `store`, please refer to our [Relay Store API](../store/)
        * `uploadables`: An optional uploadable map, an object representing any number of uploadable items, with one key per item. Each value must be of type `File` or `Blob`.
        *  No environment argument: `useMutation` will automatically use the current environment provided by `RelayEnvironmentProvider`
    * Return value:
        * `disposable`: Object containing a `dispose` function. Calling `disposable.dispose()` will revert the optimistic update, and Relay won't update the store or call any success/error callback, but the network request is not guaranteed to be cancelled. If the `dispose` is called after the mutation has succeeded, it will not rollback the update in Relay store.
* [1] `areMutationsInFlight`: Will be `true` if any mutation triggered by calling `commitMutation` is still in flight. If you call `commitMutation` multiple times, there can be multiple mutations in flight at once.


<DocsRating />

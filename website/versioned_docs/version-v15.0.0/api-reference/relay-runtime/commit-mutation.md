---
id: commit-mutation
title: commitMutation
slug: /api-reference/commit-mutation/
description: API reference for commitMutation, which imperatively executes a mutation
keywords:
  - mutation
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import MutationConfig from '../types/MutationConfig.md';
import Disposable from '../types/Disposable.md';

## `commitMutation`

Imperatively execute a mutation.

See also the [`useMutation`](../use-mutation/) API and [Guide to Updating Data](../../guided-tour/updating-data/).

```js
import type {FeedbackLikeMutation} from 'FeedbackLikeMutation.graphql';
const React = require('React');

const {graphql, commitMutation} = require('react-relay');

function likeFeedback(environment: IEnvironment): Disposable {
  return commitMutation<FeedbackLikeMutation>(environment, {
    mutation: graphql`
      mutation FeedbackLikeMutation($input: FeedbackLikeData!) {
        feedback_like(data: $input) {
          feedback {
            id
            viewer_does_like
            like_count
          }
        }
      }
    `,
    variables: {
      input: {
        id: '123',
      },
    },
  });
}
```

### Arguments

* `environment`: `IEnvironment`. A Relay environment.
* `config`: [`MutationConfig<TMutation>`](#type-mutationconfigtmutationconfig-mutationparameters).

<MutationConfig />


### Return Value

* A [`Disposable`](#interface-disposable) which:
  * If called while before the request completes, will cancel revert any optimistic updates and prevent the `onComplete` and `onError` callbacks from being executed. It will not necessarily cancel any network request. Will cause the `onUnsubscribe` callback to be called.
  * If called after the initial request completes, will do nothing.

<Disposable />

<DocsRating />

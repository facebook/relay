---
id: request-subscription
title: requestSubscription
slug: /api-reference/request-subscription/
description: API reference for requestSubscription, which imperatively establishes a GraphQL subscription
keywords:
  - subscription
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import GraphQLSubscriptionConfig from '../types/GraphQLSubscriptionConfig.md';
import Disposable from '../types/Disposable.md';

## `requestSubscription`

Imperative API for establishing a GraphQL Subscription.
See also the [`useSubscription`](../use-subscription/) API and the [Guide to Updating Data](../../guided-tour/updating-data/).

```js
import {graphql, requestSubscription} from 'react-relay';

const subscription = graphql`
  subscription UserDataSubscription($input: InputData!) {
    # ...
  }
`;

function createSubscription(environment: IEnvironment): Disposable {
  return requestSubscription(environment, {
    subscription,
    variables: {input: {userId: '4'}},
  });
}
```

### Arguments

* `environment`: A Relay Environment
* `config`: `GraphQLSubscriptionConfig`

<GraphQLSubscriptionConfig />

### Return Type

* A [`Disposable`](#interface-disposable) that clears the subscription.

<Disposable />

### Behavior

* Imperatively establish a subscription.
* See the [GraphQL Subscriptions Guide](../../guided-tour/updating-data/graphql-subscriptions/) for a more detailed explanation of how to work with subscriptions.

<DocsRating />

---
id: request-subscription
title: requestSubscription
slug: /api-reference/request-subscription/
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';
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

### Flow Type Parameters

* `TSubscriptionPayload`: The type of the payloads vended by the subscription. You should pass the flow type imported from the auto-generated `.graphql` file corresponding to the subscription, e.g. use `UserDataSubscription` as the type parameter, from `import type {UserDataSubscription} from './__generated__/UserDataSubscription.graphql'`;

### Return Type

* A [`Disposable`](#interface-disposable) that clears the subscription.

<Disposable />

### Behavior

* Imperatively establish a subscription.
* See the [GraphQL Subscriptions Guide](../../guided-tour/updating-data/graphql-subscriptions/) for a more detailed explanation of how to work with subscriptions.

<DocsRating />

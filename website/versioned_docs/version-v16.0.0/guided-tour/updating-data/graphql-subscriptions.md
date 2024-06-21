---
id: graphql-subscriptions
title: GraphQL subscriptions
slug: /guided-tour/updating-data/graphql-subscriptions/
description: Relay guide to GraphQL subscriptions
keywords:
- subscription
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

<FbInternalOnly>

[GraphQL subscriptions](https://our.internmc.facebook.com/intern/wiki/GraphQL_Subscriptions/) are a mechanism to allow clients to query for data in response to a stream of server-side events.

</FbInternalOnly>

<OssOnly>

GraphQL subscriptions are a mechanism to allow clients to query for data in response to a stream of server-side events.

</OssOnly>

A GraphQL subscription looks very similar to a query, except that it uses the `subscription` keyword:

```graphql
subscription FeedbackLikeSubscription($input: FeedbackLikeSubscribeData!) {
  feedback_like_subscribe(data: $input) {
    feedback {
      like_count
    }
  }
}
```

* Establishing a subscription using this GraphQL snippet will cause the application to be notified whenever an event is emitted from the `feedback_like_subscribe` stream.
* `feedback_like_subscribe` is a *subscription root field* (or just *subscription field*), which sets up the subscription on the backend.

<FbInternalOnly>

:::info
You can view subscription root fields in the GraphQL Schema Explorer by opening VSCode @ FB and executing the command "Relay: Open GraphQL Schema Explorer". Then, in the "Schema Explorer Tab", click on "Subscription".

You can click on the various mutation fields to see their parameters, descriptions and exposed fields.
:::

</FbInternalOnly>

* Like mutations, a subscription is handled in two separate steps. First, a server-side event occurs. Then, the query is executed.

:::note
Note that the event stream can be completely arbitrary, and can have no relation to the fields selected. In other words, there is no guarantee that the values selected in a subscription will have changed from notification to notification.
:::

* `feedback_like_subscribe` returns a specific GraphQL type which exposes the data we can query in response to the server-side event. In this case, we're querying for the Feedback object and its updated `like_count`. This allows us to show the like count in real time.

An example of a subscription payload received by the client could look like this:

```json
{
  "feedback_like_subscribe": {
    "feedback": {
      "id": "feedback-id",
      "like_count": 321,
    }
  }
}
```

In Relay, we can declare GraphQL subscriptions using the `graphql` tag too:

```js
const {graphql} = require('react-relay');

const feedbackLikeSubscription = graphql`
  subscription FeedbackLikeSubscription($input: FeedbackLikeSubscribeData!) {
    feedback_like_subscribe(data: $input) {
      feedback {
        like_count
      }
    }
  }
`;
```

* Note that subscriptions can also reference GraphQL [variables](../../rendering/variables/) in the same way queries or fragments do.

## Using `useSubscription` to create a subscription

In order to create a subscription in Relay, we can use the `useSubscription` and `requestSubscription` APIs. Let's take a look at an example using the `useSubscription` API:

```js
import type {Environment} from 'react-relay';
import type {FeedbackLikeSubscribeData} from 'FeedbackLikeSubscription.graphql';

const {graphql, useSubscription} = require('react-relay');
const {useMemo} = require('React');

function useFeedbackSubscription(
  input: FeedbackLikeSubscribeData,
) {
  const config = useMemo(() => ({
    subscription: graphql`
      subscription FeedbackLikeSubscription(
        $input: FeedbackLikeSubscribeData!
      ) {
        feedback_like_subscribe(data: $input) {
          feedback {
            like_count
          }
        }
      }
    `,
    variables: {input},
  }), [input]);

  return useSubscription(config);
}
```

Let's distill what's happening here.

* `useSubscription` takes a `GraphlQLSubscriptionConfig` object, which includes the following fields:
  * `subscription`: the GraphQL literal containing the subscription, and
  * `variables`: the variables with which to establish the subscription.
* In addition, `useSubscription` accepts a Flow type parameter. As with queries, the Flow type of the subscription is exported from the file that the Relay compiler generates.
  * If this type is provided, the `GraphQLSubscriptionConfig` becomes statically typed as well. **It is a best practice to always provide this type.**
* Now, when the `useFeedbackSubscription` hook commits, Relay will establish a subscription.
  * Unlike with APIs like `useLazyLoadQuery`, Relay will **not** attempt to establish this subscription during the render phase.
* Once it is established, whenever an event occurs, the backend will select the updated Feedback object and select the `like_count` fields off of it.
  * Since the `Feedback` type contains an `id` field, the Relay compiler will automatically add a selection for the `id` field.
* When the subscription response is received, Relay will find a feedback object in the store with a matching `id` and update it with the newly received `like_count` value.
* If these values have changed as a result, any components which selected these fields off of the feedback object will be re-rendered. Or, to put it colloquially, any component which depends on the updated data will re-render.

:::note
The name of the type of the parameter `FeedbackLikeSubscribeData` is derived from the name of the top-level mutation field, i.e. from `feedback_like_subscribe`. This type is also exported from the generated `graphql.js` file.
:::

:::caution

The `GraphQLSubscriptionConfig` object passed to `useSubscription` should be memoized! Otherwise, `useSubscription` will dispose the subscription and re-establish it with every render!

:::

## Refreshing components in response to subscription events

In the previous example, we manually selected `like_count`. Components that select this field will be re-rendered, should we receive an updated value.

However, it is generally better to spread fragments that correspond to the components that we want to refresh in response to the mutation. This is because the data selected by components can change.

Requiring developers to know about all subscriptions that might fetch their components data (and keeping them up-to-date) is an example of the kind of global reasoning that Relay wants to avoid requiring.

For example, we might rewrite the subscription as follows:

```graphql
subscription FeedbackLikeSubscription($input: FeedbackLikeSubscribeData!) {
  feedback_like_subscribe(data: $input) {
    feedback {
      ...FeedbackDisplay_feedback
      ...FeedbackDetail_feedback
    }
  }
}
```

Now, whenever a event in the `feedback_like_subscribe` event stream occurred, the data selected by the `FeedbackDisplay` and `FeedbackDetail` components will be refetched, and those components will remain in a consistent state.

:::note
Spreading fragments is generally preferable to refetching the data in response to subscription events, since the updated data can be fetched in a single round trip.
:::

## Executing a callback when the subscription fires, errors or is closed by the server

In addition to writing updated data to the Relay store, we may want to execute a callback whenever a subscription payload is received. We may want to execute a callback if an error is received or if an error is received or if the server ends the subscription. The `GraphQLSubscriptionConfig` can include the following fields to handle such cases:

* `onNext`, a callback that is executed when a subscription payload is received. It is passed the subscription response (stopping at fragment spread boundaries).
* `onError`, a callback that is executed when the subscription errors. It is passed the error that occured.
* `onCompleted`, a callback that is executed when the server ends the subscription.

## Declarative mutation directives

[Declarative mutation directives](../../list-data/updating-connections/#using-declarative-directives) and [`@deleteRecord`](../graphql-mutations/#deleting-items-in-response-to-mutations) work in subscriptions, too.

### Manipulating connections in response to subscription events

Relay makes it easy to respond to subscription events by adding items to or removing items from connections (i.e. lists). For example, you might want to append a newly created user to a given connection. For more, see [Using declarative directives](../../list-data/updating-connections/#using-declarative-directives).

### Deleting items in response to mutations

In addition, you might want to delete an item from the store in response to a mutation. In order to do this, you would add the `@deleteRecord` directive to the deleted ID. For example:

```graphql
subscription DeletePostSubscription($input: DeletePostSubscribeData!) {
  delete_post_subscribe(data: $input) {
    deleted_post {
      id @deleteRecord
    }
  }
}
```

## Imperatively modifying local data

At times, the updates you wish to perform are more complex than just updating the values of fields and cannot be handled by the declarative mutation directives. For such situations, the `GraphQLSubscriptionConfig` accepts an `updater` function which gives you full control over how to update the store.

This is discussed in more detail in the section on [Imperatively updating store data](../imperatively-modifying-store-data/).

## Configuring the Network Layer

<OssOnly>

You will need to Configure your [Network layer](../../../guides/network-layer) to handle subscriptions.

Usually GraphQL subscriptions are communicated over [WebSockets](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API), here's an example using [graphql-ws](https://github.com/enisdenjo/graphql-ws):

```javascript
import {
    ...
    Network,
    Observable
} from 'relay-runtime';
import { createClient } from 'graphql-ws';

const wsClient = createClient({
  url:'ws://localhost:3000',
});

const subscribe = (operation, variables) => {
  return Observable.create((sink) => {
    return wsClient.subscribe(
      {
        operationName: operation.name,
        query: operation.text,
        variables,
      },
      sink,
    );
  });
}

const network = Network.create(fetchQuery, subscribe);
```

Alternatively, the legacy [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) library can be used too:

```javascript
import {
    ...
    Network,
    Observable
} from 'relay-runtime';
import { SubscriptionClient } from 'subscriptions-transport-ws';

const subscriptionClient = new SubscriptionClient('ws://localhost:3000', {
  reconnect: true,
});

const subscribe = (request, variables) => {
  const subscribeObservable = subscriptionClient.request({
    query: request.text,
    operationName: request.name,
    variables,
  });
  // Important: Convert subscriptions-transport-ws observable type to Relay's
  return Observable.from(subscribeObservable);
};

const network = Network.create(fetchQuery, subscribe);
```
</OssOnly>

<FbInternalOnly>

At Facebook, the Network Layer has already been configured to handle GraphQL Subscriptions. For more details on writing subscriptions at Facebook, check out this [guide](../../../guides/writing-subscriptions/). For a guide on setting up subscriptions on the server side, check out this [wiki](https://our.internmc.facebook.com/intern/wiki/GraphQL_Subscriptions/creating-a-new-subscription/).

</FbInternalOnly>

<DocsRating />

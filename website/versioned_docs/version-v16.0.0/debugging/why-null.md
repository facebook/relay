---
id: why-null
title: "Why Is My Field Null?"
slug: /debugging/why-null/
description: Get help figuring out why a given field is unexpectedly null.
keywords:
- "null"
- missing
- optional
- nullthrows
---

import {FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';
import DocsRating from '@site/src/core/DocsRating';

There are a number of reasons that a field read by Relay can be null and some of them are obscure or unintuitive. When debugging an unexpectedly null value, it can be helpful to understand both the common cases and edge cases that can cause a field to be read as null. This document enumerates the cases that can lead to null or missing values with tips for figuring determining which case you are in.

## Server Returned Null

The simplest reason a field might be null is that the server explicitly returned null. This can happen in two cases:

1. The server’s field resolver returned an explicit null
2. The field resolver throws. In this case GraphQL will return null for that field. *This is true even if the server resolver’s return type is non-nullable.* The one exceptions is fields annotated as non-null. In that case server should *never* return null. If an exception is encountered the entire parent object will be nulled out.

<FbInternalOnly>

:::note
At Meta, non-nullable fields are implemented using [`KillsParentOnException`](https://www.internalfb.com/intern/wiki/Graphql-for-hack-developers/fields/return-type/#non-nullable-fields).
:::

</FbInternalOnly>

**🕵️‍♀️ How to tell:** Inspect the server’s response using Relay Dev tools, or in your browser’s dev tools’s network tab, to see if the field is null.

## Graph Relationship Change

If a different query/mutation/subscription observes a relationship change in the graph, you may end up trying to read fields off of an object which your query never fetched.

Imagine you have a query that reads your best friend’s name:

```graphql
query MyQuery {
  me {
    best_friend {
      # id: 1
      name
    }
  }
}
```

After you get your query response, *who* your best friend is *changes* on the server. Then a *different* query/mutation/subscription fetches a different set of fields off of `best_friend`.

```graphql
query OtherQuery {
  me {
    best_friend {
      # new id: 2
      # Note: name is not fetched here
      age
    }
  }
}
```

Because the Relay store is normalized, we will update the `me` record to indicate that `best_friend` linked field now points to the user with ID 2, and the only information we know about that user is their age.

This will trigger a rerender of `MyQuery`. However, when we try to read the `name` field off of the user with ID 2, we won’t find it, since the only thing we know about the user with ID 2 is their `age`. Note that a relationship “change” in this case, could also mean a relationship that is new. For example, if you start with no best friend but a subsequent response returns *some* best friend, but does not fetch all fields your component needs.

**Note**: In theory, Relay *could* refetch your query when this state is encountered, but some queries are not safe to re-issue arbitrarily, and more generally, UI state changing in a way that’s not tied to a direct user action can lead to confusion. For this reason, we have chosen not to perform refetches in this scenario.

**🕵️‍♀️ How to tell:** You can place a breakpoint/`console.log` at the finale return statement of `readWithIdentifier` in `FragmentResource` ([code pointer](https://github.com/facebook/relay/blob/2b9876fcbf0845cd23728d4d720712525ff424c4/packages/react-relay/relay-hooks/FragmentResource.js#L475). This is the point in Relay at which we know that we are missing data, but there is not query in flight to get it.

## Inconsistent Server Response

This is a **rare edge case**, *but* if the server does not correctly implement the [field stability](https://graphql.org/learn/global-object-identification/#field-stability) semantics of the id field, it’s possible that a field could be present in one part of the response, but *explicitly null* in another.

```graphql
{
  me {
    id: 1
    name: "Alice"
  }
  me_elsewhere_in_the_graph {
    id: 1 # Note this is the same as the `me` field above...
    name: null
  }
}
```

In this case, Relay first learns that user 1’s `name` is Alice, but later in the query finds that user 1’s `name` has now `null`. Because Relay stores data in a normalized store, user 1 can only have one value for `name` and Relay will end in a state where user 1’s `name` is `null`.

**🕵️‍♀️ How to tell:** Relay is smart enough to detect when this has happened, and will [log an error to the console](https://github.com/facebook/relay/blob/2b9876fcbf0845cd23728d4d720712525ff424c4/packages/relay-runtime/store/RelayResponseNormalizer.js#L505) in dev that looks like: “RelayResponseNormalizer: Invalid record. The record contains two instances of the same id: 1 with conflicting field, name and its values: Alice and null.". Additionally, you can manually inspect the query response.

Note that if the unstable field is a linked field (edge to another object), this type of bug can cause a Graph Relationship Change (described above) to occur *within a single response*. For example, if a user with the same `id` appears in two places in the response, but their `best_friend` is different in those two locations.

**🕵️‍♀️ How to tell:** Relay is also smart enough to detect this case, and will show a [similar console warning](https://github.com/facebook/relay/blob/2b9876fcbf0845cd23728d4d720712525ff424c4/packages/relay-runtime/store/RelayResponseNormalizer.js#L844) in dev.

<FbInternalOnly>

:::note
Because these errors existing in the code base and can cause noisy console outout, these warnings are [disabled](https://www.internalfb.com/code/www/[5b26a6bd37e8]/html/shared/core/WarningFilter.js?lines=559) in dev mode.
:::

</FbInternalOnly>


## Client-side Deletion or Incomplete Update

Imperative store updates, or optimistic updates could have deleted the record or field. If an imperative store update, or optimistic update, writes a new record to the store, it may not supply a value for a field which you expected to be able to read. This is a fundamental problem, since an updater cannot statically know all the data that might be accessed off of a new object.

**🕵️‍♀️ How to tell:** Due to React and Relay’s batching, it’s not always possible to associate a component update with the store update that triggered it. Here, your best bet is to set a breakpoint in your component for when your value is null, and then use the Relay Dev Tools to look at the last few updates.

This can happen due to a newly created object which did not supply a specific field or, as mentioned above, an update which causes a new or changed relationship in the graph. In this case, use the “How do tell” tip from that section.

<DocsRating />

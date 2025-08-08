---
id: connections
title: Why Connections?
slug: /guided-tour/list-data/connections/
description: Relay guide for connections
keywords:
- pagination
- connections
---

import DocsRating from '@site/src/core/DocsRating';

# Why Connections?

:::info
For a video format of how the connection spec was derived, check out [Sabrina Wasserman's GraphQL talk](../../guides/graphql-server-specification.md#graphql-conf-talk)!
:::

Relay does a lot of the work for you when handling paginated collections of items. But to do that, it relies on a specific convention for how those collections are modeled in your schema. This convention is powerful and flexible, and comes out of experience building many products with collections of items. Let’s step through the design process for this schema convention so that we can understand why it works this way.

There are three important points to understand:

* You may need to model data about an item's inclusion in the collection, such as in a list of friends where you may wish to model the date you friended that person. We handle this by creating nodes that represent the edges, the relationship between the item in the collection and the collection itself.
* The page itself has properties, such as whether or not there is a next page available. We handle this with a node that represents the current page info.
* Pagination is done by *cursors* — opaque symbols that point to the next page of results — rather than offsets.

Imagine we want to show a list of the user’s friends. At a high level, we imagine a graph where the viewer and their friends are each nodes. From the viewer to each friend node is an edge, and the edge itself has properties.

![Conceptual graph with properties on its edges](/img/docs/tutorial/connections-conceptual-graph.png)

Now let’s try to model this situation using GraphQL.

In GraphQL, only nodes can have properties, not edges. So the first thing we’ll do is represent the conceptual edge from you to your friend with its very own node.

![Edge properties modeled using nodes that represent the edges](/img/docs/tutorial/connections-edge-nodes.png)

Now the properties of the edge are represented by a new type of node called a “`FriendsEdge`”.

The GraphQL to query this would like this:

```
// XXX example only, not final code
fragment FriendsFragment1 on Viewer {
  friends {
    since // a property of the edge
    node {
      name // a property of the friend itself
    }
  }
}
```

Now we have a good place in the GraphQL schema to put edge-specific information such as the date when the edge was created (that is, the date you friended that person).

* * *

Now consider what we would need to model in our schema in order to support pagination and infinite scrolling.

* The client must be able to specify how large of a page it wants.
* The client must be informed as to whether any more pages are available, so that it can enable or disable the ‘next page’ button (or, for infinite scrolling, can stop making further requests).
* The client must be able to ask for the next page after the one it already has.

How can we use the features of GraphQL to do these things? Specifying the page size is done with field arguments. In other words, instead of just `friends` the query will say `friends(first: 3)`, passing the page size as an argument to the `friends` field.

For the server to say whether there is a next page or not, we need to introduce a node in the graph that has information about the *list of friends itself,* just like we are introducing a node for each edge to store information about the edge itself. This new node is called a *Connection*.

The Connection node represents the connection itself between you and your friends. Metadata about the connection is stored there — for example, it could have a `totalCount` field that says how many friends you have. In addition, it always has two fields which represent the *current* page: a `pageInfo` field with metadata about the current page, such as whether there is another page available — and an `edges` field that points to the edges we saw before:

![The full connection model with page info and edges](/img/docs/tutorial/connections-full-model.png)

Finally, we need a way to request the next page of results. You’ll notice in the above diagram that the `PageInfo` node has a field called `lastCursor`.  This is an opaque token provided by the server that represents the position in the list of the last edge that we were given (the friend “Charmaine”). We can then pass this cursor back to the server in order to retrieve the next page.

By passing the `lastCursor` value back to the server as an argument to the `friends` field, we can ask the server for friends that are *after* the ones we’ve already retrieved:

![After fetching the next page of results](/img/docs/tutorial/connections-full-model-next-page.png)

This overall scheme for modeling paginated lists is specified in detail in the [GraphQL Cursor Connections Spec](https://relay.dev/graphql/connections.htm). It is flexible for many different applications, and although Relay relies on this convention to handle pagination automatically, designing your schema this way is a good idea whether or not you use Relay.

Now that we've stepped through the underlying model for Connections, let’s turn our attention to actually using it to implement Comments for our Newsfeed stories.

<DocsRating />

---
id: adding-and-removing-items
title: Adding and Removing Items from Connections
slug: /guided-tour/list-data/adding-and-removing-items/
---

import DocsRating from '../../../src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

Usually when you're rendering a connection, you'll also want to be able to add or remove items to/from the connection in response to user actions.

As explained in our [Updating Data](../../updating-data/) section, Relay holds a local in-memory store of normalized GraphQL data, where records are stored by their IDs.  When creating mutations, subscriptions, or local data updates with Relay, you must provide an `updater` function, inside which you can access and read records, as well as write and make updates to them. When records are updated, any components affected by the updated data will be notified and re-rendered.


## Connection Records

In Relay, connection fields that are marked with the `@connection` directive are stored as special records in the store, and they hold and accumulate *all* of the items that have been fetched for the connection so far. In order to add or remove items from a connection, we need to access the connection record using the connection `*key*`, which was provided when declaring a `@connection`; specifically, this allows us to access a connection inside an `updater` function using the `ConnectionHandler` APIs.

For example, given the following fragment that declares a `@connection`:

```js
const {graphql} = require('react-relay');

const storyFragment = graphql`
  fragment StoryComponent_story on Story {
    comments @connection(key: "StoryComponent_story_comments_connection") {
      nodes {
        body {
          text
        }
      }
    }
  }
`;
```


We can access the connection record inside an `updater` function using `ConnectionHandler.getConnection`:

```js
const {ConnectionHandler} = require('relay-runtime');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // ...
}
```

## Adding Edges

Once we have a connection record, we also need a record for the new edge that we want to add to the connection. Usually, mutation or subscription payloads will contain the new edge that was added; if not, you can also construct a new edge from scratch.

For example, in the following mutation we can query for the newly created edge in the mutation response:

```js
const {graphql} = require('react-relay');

const createCommentMutation = graphql`
  mutation CreateCommentMutation($input: CommentCreateData!) {
    comment_create(input: $input) {
      comment_edge {
        cursor
        node {
          body {
            text
          }
        }
      }
    }
  }
`;
```

* Note that we also query for the `cursor` for the new edge; this isn't strictly necessary, but it is information that will be required if we need to perform pagination based on that `cursor`.


Inside an `updater`, we can access the edge inside the mutation response using Relay store APIs:

```js
const {ConnectionHandler} = require('relay-runtime');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // Get the payload returned from the server
  const payload = store.getRootField('comment_create');

  // Get the edge inside the payload
  const serverEdge = payload.getLinkedRecord('comment_edge');

  // Build edge for adding to the connection
  const newEdge = ConnectionHandler.buildConnectionEdge(
    store,
    connectionRecord,
    serverEdge,
  );

  // ...
}
```

* The mutation payload is available as a root field on that store, which can be read using the `store.getRootField` API. In our case, we're reading `comment_create`, which is the root field in the response.
* Note that we need to construct the new edge from the edge received from the server using `ConnectionHandler.buildConnectionEdge` before we can add it to the connection.



If you need to create a new edge from scratch, you can use `ConnectionHandler.createEdge`:

```js
const {ConnectionHandler} = require('relay-runtime');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // Create a new local Comment record
  const id = `client:new_comment:${randomID()}`;
  const newCommentRecord = store.create(id, 'Comment');

  // Create new edge
  const newEdge = ConnectionHandler.createEdge(
    store,
    connectionRecord,
    newCommentRecord,
    'CommentEdge', /* GraphQl Type for edge */
  );

  // ...
}
```


Once we have a new edge record, we can add it to the the connection using `ConnectionHandler.insertEdgeAfter` or `ConnectionHandler.insertEdgeBefore`:

```js
const {ConnectionHandler} = require('relay-runtime');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  const newEdge = (...);

  // Add edge to the end of the connection
  ConnectionHandler.insertEdgeAfter(
    connectionRecord,
    newEdge,
  );

  // Add edge to the beginning of the connection
  ConnectionHandler.insertEdgeBefore(
    connectionRecord,
    newEdge,
  );
}
```

* Note that these APIs will *mutate* the connection in place



> NOTE: Check out our complete Relay Store APIs [here](https://facebook.github.io/relay/docs/en/relay-store.html)



## Removing Edges

`ConnectionHandler` provides a similar API to remove an edge from a connection, via `ConnectionHandler.deleteNode`:

```js
const {ConnectionHandler} = require('RelayModern');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);
  const connectionRecord = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
  );

  // Remove edge from the connection, given the ID of the node
  ConnectionHandler.deleteNode(
    connectionRecord,
    commentIDToDelete,
  );
}
```

* In this case `ConnectionHandler.deleteNode` will remove an edge given a *`node` ID*. This means it will look up which edge in the connection contains a node with the provided ID, and remove that edge.
* Note that this API will *mutate* the connection in place.




> Remember: When performing any of the operations described here to mutate a connection, any fragment or query components that are rendering the affected connection will be notified and re-render with the latest version of the connection.


## Connection Identity With Filters

In our previous examples, our connections didn't take any arguments as filters. If you declared a connection that takes arguments as filters, the values used for the filters will be part of the connection identifier. In other words, *each of the values passed in as connection filters will be used to identify the connection in the Relay store.*


> Note that this excludes pagination arguments, i.e. it excludes `first`, `last`, `before`, and `after`.


For example, let's say the `comments` field took the following arguments, which we pass in as GraphQL [variables](../../rendering/variables/):

```js
const {graphql} = require('RelayModern');

const storyFragment = graphql`
  fragment StoryComponent_story on Story {
    comments(
      order_by: $orderBy,
      filter_mode: $filterMode,
      language: $language,
    ) @connection(key: "StoryComponent_story_comments_connection") {
      edges {
        nodes {
          body {
            text
          }
        }
      }
    }
  }
`;
```

In the example above, this means that whatever values we used for `$orderBy`, `$filterMode` and `$language` when we queried for the `comments` field will be part of the connection identifier, and we'll need to use those values when accessing the connection record from the Relay store.

In order to do so, we need to pass a third argument to `ConnectionHandler.getConnection`, with concrete filter values to identify the connection:

```js
const {ConnectionHandler} = require('RelayModern');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);

  // Get the connection instance for the connection with comments sorted
  // by the date they were added
  const connectionRecordSortedByDate = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: '*DATE_ADDED*', filter_mode: null, language: null}
  );

  // Get the connection instance for the connection that only contains
  // comments made by friends
  const connectionRecordFriendsOnly = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: null, filter_mode: '*FRIENDS_ONLY*', langugage: null}
  );
}
```

This implies that by default, *each combination of values used for filters will produce a different record for the connection.*

When making updates to a connection, you will need to make sure to update all of the relevant records affected by a change. For example, if we were to add a new comment to our example connection, we'd need to make sure *not* to add the comment to the `FRIENDS_ONLY` connection, if the new comment wasn't made by a friend of the user:

```js
const {ConnectionHandler} = require('relay-runtime');

function updater(store: RecordSourceSelectorProxy) {
  const storyRecord = store.get(storyID);

  // Get the connection instance for the connection with comments sorted
  // by the date they were added
  const connectionRecordSortedByDate = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: '*DATE_ADDED*', filter_mode: null, language: null}
  );

  // Get the connection instance for the connection that only contains
  // comments made by friends
  const connectionRecordFriendsOnly = ConnectionHandler.getConnection(
    storyRecord,
    'StoryComponent_story_comments_connection',
    {order_by: null, filter_mode: '*FRIENDS_ONLY*', language: null}
  );

  const newComment = (...);
  const newEdge = (...);

  ConnectionHandler.insertEdgeAfter(
    connectionRecordSortedByDate,
    newEdge,
  );

  if (isMadeByFriend(storyRecord, newComment) {
    // Only add new comment to friends-only connection if the comment
    // was made by a friend
    ConnectionHandler.insertEdgeAfter(
      connectionRecordFriendsOnly,
      newEdge,
    );
  }
}
```



_Managing connections with many filters:_

As you can see, just adding a few filters to a connection can make the complexity and number of connection records that need to be managed explode. In order to more easily manage this, Relay provides 2 strategies:

1) Specify exactly *which* filters should be used as connection identifiers.

By default, *all* non-pagination filters will be used as part of the connection identifier. However, when declaring a `@connection`, you can specify the exact set of filters to use for connection identity:

```js
const {graphql} = require('relay-runtime');

const storyFragment = graphql`
  fragment StoryComponent_story on Story {
    comments(
      order_by: $orderBy
      filter_mode: $filterMode
      language: $language
    )
      @connection(
        key: "StoryComponent_story_comments_connection"
        filters: ["order_by", "filter_mode"]
      ) {
      edges {
        nodes {
          body {
            text
          }
        }
      }
    }
  }
`;
```

* By specifying `filters` when declaring the `@connection`, we're indicating to Relay the exact set of filter values that should be used as part of connection identity. In this case, we're excluding `language`, which means that only values for `order_by` and `filter_mode` will affect connection identity and thus produce new connection records.
* Conceptually, this means that we're specifying which arguments affect the output of the connection from the server, or in other words, which arguments are *actually* *filters*. If one of the connection arguments doesn't actually change the set of items that are returned from the server, or their ordering, then it isn't really a filter on the connection, and we don't need to identify the connection differently when that value changes. In our example, changing the `language` of the comments we request doesn't change the set of comments that are returned by the connection, so it is safe to exclude it from `filters`.
* This can also be useful if we know that any of the connection arguments will never change in our app, in which case it would also be safe to exclude from `filters`.



2) An easier API alternative to manage multiple connections with multiple filter values is still pending


> TBD



<DocsRating />

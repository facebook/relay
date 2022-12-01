---
id: imperatively-modifying-store-data-unsafe
title: Imperatively modifying store data (unsafe)
slug: /guided-tour/updating-data/imperatively-modifying-store-data-unsafe/
description: Imperatively modifying store data
keywords:
- record source
- store
- updater
---

import DocsRating from '@site/src/core/DocsRating';
import {OssOnly, FbInternalOnly} from 'docusaurus-plugin-internaldocs-fb/internal';

Data in Relay stores can be imperatively modified within updater functions.

## When to use updaters

### Complex client updates

You might provide an updater function if the changes to local data are more complex than what can be achieved by simply writing a network response to the store and cannot be handled by the declarative mutation directives.

### Client schema extensions

In addition, since the network response necessarily will not include data for fields defined in client schema extensions, you may wish to use an updater to initialize data defined in client schema extensions.

### Use of other APIs

Lastly, there are things you can only achieve using updaters, such as invalidating nodes, deleting nodes, finding all connections at a given field, etc.

### If multiple optimistic responses modify a given store value

If two optimistic responses affect a given value, and the first optimistic response is rolled back, the second one will remain applied.

For example, if two optimistic responses each increase a story's like count by one, and the first optimistic response is rolled back, the second optimistic response remains applied. Since the second optimistic response **not recalculated**, the value of the like count will remain increased by two.

An optimistic updater, on the other hand, would be re-run in this circumstance.

## When **not** to use updaters

### To trigger other side effects

You should use the `onCompleted` callback to trigger other side effects.

## The various types of updater functions

The `useMutation` and `commitMutation` APIs accept configuration objects which can include `optimisticUpdater` and `updater` fields. The `requestSubscription` and `useSubscription` APIs accept configuration objects which can include `updater` fields.

In addition, there is another API (`commitLocalUpdate`) which also accepts an updater function. It will be discussed in the [Other APIs for modifying local data](../local-data-updates/) section.

## Optimistic updaters vs updaters

Mutations can have both optimistic and regular updaters. Optimistic updaters are executed when a mutation is triggered. When that mutation completes or errors, the optimistic update is rolled back. At that point, the mutation response is written to the store and regular updaters are executed. See [order of execution of updater functions](../graphql-mutations/#order-of-execution-of-updater-functions).

Regular updaters are executed when a mutation completes successfully.

## Example

Let's consider an example that provides an updater to `commitMutation`.

```js
import type {Environment} from 'react-relay';
import type {CommentCreateData, CreateCommentMutation} from 'CreateCommentMutation.graphql';

const {commitMutation, graphql} = require('react-relay');
const {ConnectionHandler} = require('relay-runtime');

function commitCommentCreateMutation(
  environment: Environment,
  feedbackID: string,
  input: CommentCreateData,
) {
  return commitMutation<CreateCommentMutation>(environment, {
    mutation: graphql`
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
    `,
    variables: {input},
    updater: (store: RecordSourceSelectorProxy, _response: ?CreateCommentMutation$data) => {
      // we are not using _response in this example, but it is
      // provided and statically typed.

      const feedbackRecord = store.get(feedbackID);

      // Get connection record
      const connectionRecord = ConnectionHandler.getConnection(
        feedbackRecord,
        'CommentsComponent_comments_connection',
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

      // Add edge to the end of the connection
      ConnectionHandler.insertEdgeAfter(
        connectionRecord,
        newEdge,
      );
    },
  });
}

module.exports = {commit: commitCommentCreateMutation};
```

Let's distill this example:

* The updater receives a `store` argument, which is an instance of a [`RecordSourceSelectorProxy`](../../../api-reference/store/);  this interface allows you to *imperatively* write and read data directly to and from the Relay store. This means that you have full control over how to update the store in response to the mutation response: you can *create entirely new records*, or *update or delete existing ones*.
* The updater receives a second `data` argument, which contains the data selected by the mutation fragment. This can be used to retrieve the payload data without interacting with the *`store`*. The type of this mutation response can be imported from the auto-generated `Mutation.graphql.js` file, and is given the name `MutationName$data`.
    * The type of this `data` argument is a nullable version of the `$data` type.
    * The `data` arguments contains just the data selected directly by the mutation argument. In other words, if another fragment is spread in the mutation, the data from that fragment will not be available within `data` by default.
* In our specific example, we're adding a new comment to our local store after it has successfully been added on the server. Specifically, we're adding a new item to a connection; for more details on the specifics of how that works, check out our section on [adding and removing items from a connection](../../list-data/updating-connections/).
    * There is no need for an updater in this example — it would be a great place to use the `@appendEdge` directive instead!
* Note that the mutation response is a *root field* record that can be read from the `store` using the `store.getRootField` API. In our case, we're reading the `comment_create` root field, which is a root field in the mutation response.
* Note that the `root` field of the mutation is different from the `root` of queries, and `store.getRootField` in the mutation updater can only get the record from the mutation response. To get records from the root that's not in the mutation response, use `store.getRoot().getLinkedRecord` instead.
* Once the updater completes, any local data updates caused by the mutation `updater` will automatically cause components subscribed to the data to be notified of the change and re-render.

## Learn more

See the full APIs [here](../../../api-reference/store/).

<DocsRating />

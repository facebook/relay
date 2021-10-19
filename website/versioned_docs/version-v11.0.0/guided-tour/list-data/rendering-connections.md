---
id: rendering-connections
title: Rendering Connections
slug: /guided-tour/list-data/rendering-connections/
---

import DocsRating from '@site/src/core/DocsRating';
import FbSuspenseListAlternative from './fb/FbSuspenseListAlternative.md';
import FbRenderingConnectionsUsingSuspenseList from './fb/FbRenderingConnectionsUsingSuspenseList.md';
import {OssOnly, FbInternalOnly} from 'internaldocs-fb-helpers';

In Relay, in order to display a list of data that is backed by a GraphQL connection, first you need to declare a fragment that queries for a connection:

```js
const {graphql} = require('RelayModern');

const userFragment = graphql`
  fragment UserFragment on User {
    name
    friends(after: $cursor, first: $count)
      @connection(key: "UserFragment_friends") {
      edges {
        node {
          ...FriendComponent
        }
      }
    }
  }
`;
```

* In the example above, we're querying for the `friends` field, which is a connection; in other words, it adheres to the connection spec. Specifically, we can query the `edges` and `node`s in the connection; the `edges` usually contain information about the relationship between the entities, while the `node`s are the actual entities at the other end of the relationship; in this case, the `node`s are objects of type `User` representing the user's friends.
* In order to indicate to Relay that we want to perform pagination over this connection, we need to mark the field with the `@connection` directive. We must also provide a *static* unique identifier for this connection, known as the `key`. We recommend the following naming convention for the connection key: `<fragment_name>_<field_name>`.
* We will go into more detail later as to why it is necessary to mark the field as a `@connection` and give it a unique `key` in our [Updating Connections](../updating-connections/) section.


In order to render this fragment which queries for a connection, we can use the `usePaginationFragment` Hook:

<FbInternalOnly>
  <FbRenderingConnectionsUsingSuspenseList />
</FbInternalOnly>

<OssOnly>

```js
import type {FriendsListPaginationQuery} from 'FriendsListPaginationQuery.graphql';
import type {FriendsListComponent_user$key} from 'FriendsList_user.graphql';

const React = require('React');
const {Suspense} = require('React');

const {graphql, usePaginationFragment} = require('react-relay');

type Props = {
  user: FriendsListComponent_user$key,
};

function FriendsListComponent(props: Props) {
  const {data} = usePaginationFragment<FriendsListPaginationQuery, _>(
    graphql`
      fragment FriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @connection(key: "FriendsList_user_friends") {
          edges {
            node {
              ...FriendComponent
            }
          }
        }
      }
    `,
    props.user,
  );


  return (
    <>
      {data.name != null ? <h1>Friends of {data.name}:</h1> : null}

      <div>
        {/* Extract each friend from the resulting data */}
        {(data.friends?.edges ?? []).map(edge => {
          const node = edge.node;
          return (
            <Suspense fallback={<Glimmer />}>
              <FriendComponent user={node} />
            </Suspense>
          );
        })}
      </div>
    </>
  );
}

module.exports = FriendsListComponent;
```
<FbSuspenseListAlternative />

* `usePaginationFragment` behaves the same way as a `useFragment` (see the [Fragments](../../rendering/fragments/) section), so our list of friends is available under `data.friends.edges.node`, as declared by the fragment. However, it also has a few additions:
    * It expects a fragment that is a connection field annotated with the `@connection` directive
    * It expects a fragment that is annotated with the `@refetchable` directive. Note that  `@refetchable` directive can only be added to fragments that are "refetchable", that is, on fragments that are on `Viewer`, on `Query`, on any type that implements `Node` (i.e. a type that has an `id` field), or on a `@fetchable` type. <FbInternalOnly> For more info on `@fetchable` types, see [this post](https://fb.workplace.com/groups/graphql.fyi/permalink/1539541276187011/). </FbInternalOnly>
* It takes two Flow type parameters: the type of the generated query (in our case  `FriendsListPaginationQuery`), and a second type which can always be inferred, so you only need to pass underscore (`_`).

</OssOnly>

<DocsRating />

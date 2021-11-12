/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

graphql`
  query AppQuery($count: Int, $cursor: ID) {
    node(_id: "test") {
      ...Component_node
    }
    me {
      ...AppFriendsListComponent_user
    }
  }
`;

graphql`
      fragment AppFriendsListComponent_user on User
      @refetchable(queryName: "FriendsListPaginationQuery") {
        name
        friends(first: $count, after: $cursor)
        @connection(key: "FriendsList_user_friends") {
          edges {
            node {
              name
            }
          }
        }
      }
    `,


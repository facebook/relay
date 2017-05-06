/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @format
 */

'use strict';

jest.autoMockOff().mock('generateClientID');

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayReferenceMarker = require('RelayReferenceMarker');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');
const Set = require('Set');

const {mark} = RelayReferenceMarker;
const {ROOT_ID} = RelayStoreUtils;

describe('RelayReferenceMarker', () => {
  const {generateAndCompile} = RelayModernTestUtils;
  let source;

  beforeEach(() => {
    jest.resetModules();

    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        'friends{"first":3}': {__ref: 'client:1'},
        'profilePicture{"size":32}': {__ref: 'client:4'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
        firstName: 'Bob',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
        firstName: 'Claire',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2', null, 'client:3'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:3': {
        __id: 'client:3',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:3',
        node: {__ref: '3'},
      },
      'client:4': {
        __id: 'client:4',
        __typename: 'Photo',
        uri: 'https://...',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node{"id":"1"}': {__ref: '1'},
      },
    };

    source = new RelayInMemoryRecordSource(data);
  });

  it('marks referenced records', () => {
    const {FooQuery} = generateAndCompile(
      `
      query FooQuery($id: ID, $size: [Int]) {
        node(id: $id) {
          id
          __typename
          ... on Page {
            actors {
              name
            }
          }
          ...UserProfile @arguments(size: $size)
        }
      }

      fragment UserProfile on User @argumentDefinitions(
        size: {type: "[Int]"}
      ) {
        ... on User {
          firstName
          friends(first: 3) {
            edges {
              cursor
              node {
                id
                firstName
              }
            }
          }
          profilePicture(size: $size) {
            uri
          }
        }
      }
    `,
    );
    const references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: FooQuery.query,
        variables: {id: '1', size: 32},
      },
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3',
      'client:1',
      'client:2',
      'client:3',
      'client:4',
      'client:root',
    ]);
  });

  it('marks "handle" nodes for queries', () => {
    const data = {
      '1': {
        __id: '1',
        __typename: 'User',
        'friends{"first":1}': {__ref: 'client:1'},
        __friends_bestFriends: {__ref: 'client:bestFriends'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:bestFriends': {
        __id: 'client:bestFriends',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:bestFriendsEdge'],
        },
      },
      'client:bestFriendsEdge': {
        __id: 'client:bestFriendsEdge',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:bestFriendsEdge',
        node: {__ref: '3'},
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node{"id":"1"}': {__ref: '1'},
      },
    };
    source = new RelayInMemoryRecordSource(data);
    const {UserProfile} = generateAndCompile(
      `
      query UserProfile($id: ID!) {
        node(id: $id) {
          ... on User {
            friends(first: 1) @__clientField(handle: "bestFriends") {
              edges {
                cursor
                node {
                  id
                  name @__clientField(handle: "friendsName")
                }
              }
            }
          }
        }
      }
    `,
    );
    const references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: UserProfile.query,
        variables: {id: '1'},
      },
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3', // bestFriends.edges[0].node
      'client:1',
      'client:2',
      'client:bestFriends', // bestFriends
      'client:bestFriendsEdge', // bestFriends.edges[0]
      'client:root',
    ]);
  });

  it('marks "handle" nodes with key and filters for queries', () => {
    const data = {
      '1': {
        __id: '1',
        __typename: 'User',
        'friends{"first":1,"orderby":["first name"]}': {__ref: 'client:1'},
        '__UserProfile_friends_bestFriends{"orderby":["first name"]}': {
          __ref: 'client:bestFriends',
        },
        '__UserProfile_friends_bestFriends{"orderby":["last name"]}': {
          __ref: 'client:bestFriendsByLastName',
        },
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
      },
      '3': {
        __id: '3',
        __typename: 'User',
        id: '3',
      },
      'client:1': {
        __id: 'client:1',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:2'],
        },
      },
      'client:2': {
        __id: 'client:2',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      'client:bestFriends': {
        __id: 'client:bestFriends',
        __typename: 'FriendsConnection',
        edges: {
          __refs: ['client:bestFriendsEdge'],
        },
      },
      'client:bestFriendsByLastName': {
        __id: 'client:bestFriendsByLastName',
        __typename: 'FriendsConnection',
        edges: {
          __refs: [],
        },
      },
      'client:bestFriendsEdge': {
        __id: 'client:bestFriendsEdge',
        __typename: 'FriendsConnectionEdge',
        cursor: 'cursor:bestFriendsEdge',
        node: {__ref: '3'},
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node{"id":"1"}': {__ref: '1'},
      },
    };
    source = new RelayInMemoryRecordSource(data);
    const {UserProfile} = generateAndCompile(
      `
      query UserProfile($id: ID!, $orderby: [String]) {
        node(id: $id) {
          ... on User {
            friends(first: 1, orderby: $orderby) @__clientField(
              handle: "bestFriends"
              key: "UserProfile_friends"
              filters: ["orderby"]
            ) {
              edges {
                cursor
                node {
                  id
                  name @__clientField(handle: "friendsName")
                }
              }
            }
          }
        }
      }
    `,
    );
    let references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: UserProfile.query,
        variables: {id: '1', orderby: ['first name']},
      },
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      '2',
      '3', // bestFriends.edges[0].node
      'client:1',
      'client:2',
      'client:bestFriends', // bestFriends
      'client:bestFriendsEdge', // bestFriends.edges[0]
      'client:root',
    ]);

    references = new Set();
    mark(
      source,
      {
        dataID: ROOT_ID,
        node: UserProfile.query,
        variables: {id: '1', orderby: ['last name']},
      },
      references,
    );
    expect(Array.from(references).sort()).toEqual([
      '1',
      'client:bestFriendsByLastName',
      'client:root',
    ]);
  });
});

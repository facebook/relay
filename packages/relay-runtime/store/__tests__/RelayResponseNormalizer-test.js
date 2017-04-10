/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

jest
  .autoMockOff()
  .mock('generateClientID');

const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayStaticRecord = require('RelayStaticRecord');
const {normalize} = require('RelayResponseNormalizer');
const {ROOT_ID, ROOT_TYPE} = require('RelayStoreUtils');
const RelayStaticTestUtils = require('RelayStaticTestUtils');

describe('RelayResponseNormalizer', () => {
  const {
    generateAndCompile,
    generateWithTransforms,
    matchers,
  } = RelayStaticTestUtils;

  beforeEach(() => {
    jest.resetModules();
    jest.addMatchers(matchers);
  });

  it('normalizes queries', () => {
    const {FooQuery} = generateWithTransforms(`
      query FooQuery($id: ID, $size: Int) {
        node(id: $id) {
          id
          __typename
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
      }
    `);
    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        friends: {
          edges: [
            {
              cursor: 'cursor:2',
              node: {
                id: '2',
                firstName: 'Bob',
              },
            },
            null,
            {
              cursor: 'cursor:3',
              node: {
                id: '3',
                firstName: 'Claire',
              },
            },
          ],
        },
        profilePicture: {
          uri: 'https://...',
        },
      },
    };
    const recordSource = new RelayInMemoryRecordSource();
    recordSource.set(ROOT_ID, RelayStaticRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      {
        dataID: ROOT_ID,
        node: FooQuery,
        variables: {id: '1', size: 32},
      },
      payload
    );
    const friendsID = 'client:1:friends{"first":3}';
    const edgeID1 = `${friendsID}:edges:0`;
    const edgeID2 = `${friendsID}:edges:2`;
    const pictureID = 'client:1:profilePicture{"size":32}';
    expect(recordSource.toJSON()).toEqual({
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        'friends{"first":3}': {__ref: friendsID},
        'profilePicture{"size":32}': {__ref: pictureID},
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
      [friendsID]: {
        __id: friendsID,
        __typename: 'FriendsConnection',
        edges: {
          __refs: [edgeID1, null, edgeID2],
        },
      },
      [edgeID1]: {
        __id: edgeID1,
        __typename: 'FriendsEdge',
        cursor: 'cursor:2',
        node: {__ref: '2'},
      },
      [edgeID2]: {
        __id: edgeID2,
        __typename: 'FriendsEdge',
        cursor: 'cursor:3',
        node: {__ref: '3'},
      },
      [pictureID]: {
        __id: pictureID,
        __typename: 'Image',
        uri: 'https://...',
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node{"id":"1"}': {__ref: '1'},
      },
    });
  });

  it('normalizes queries with "handle" fields', () => {
    const {UserFriends} = generateAndCompile(`
      query UserFriends($id: ID!) {
        node(id: $id) {
          id
          __typename
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
    `);

    const payload = {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [{
            cursor: 'cursor:bestFriends',
            node: {
              id: 'pet',
              name: 'Beast',
            },
          }],
        },
      },
    };
    const recordSource = new RelayInMemoryRecordSource();
    recordSource.set(ROOT_ID, RelayStaticRecord.create(ROOT_ID, ROOT_TYPE));
    const handleFieldPayloads = normalize(
      recordSource,
      {
        dataID: ROOT_ID,
        node: UserFriends.query,
        variables: {id: '1'},
      },
      payload
    );
    expect(recordSource.toJSON()).toMatchSnapshot();
    expect(handleFieldPayloads.length).toBe(2);
    expect(handleFieldPayloads[0]).toEqual({
      args: {},
      dataID: 'pet',
      fieldKey: 'name',
      handle: 'friendsName',
      handleKey: '__name_friendsName',
    });
    expect(handleFieldPayloads[1]).toEqual({
      args: {first: 1},
      dataID: '4',
      fieldKey: 'friends{"first":1}',
      handle: 'bestFriends',
      handleKey: '__friends_bestFriends',
    });
  });

  it('normalizes queries with "filters"', () => {
    const {UserFriends} = generateAndCompile(`
      query UserFriends(
        $id: ID!,
        $orderBy: [String],
        $isViewerFriend: Boolean,
      ) {
        node(id: $id) {
          id
          __typename
          ... on User {
            friends(first: 1, orderby: $orderBy, isViewerFriend: $isViewerFriend)@__clientField(
              handle: "bestFriends",
              key: "UserFriends_friends",
              filters: ["orderby", "isViewerFriend"]
            ){
              edges {
                cursor
                node {
                  id
                }
              }
              pageInfo {
                hasNextPage
                endCursor
              }
            }
          }
        }
      }
    `);

    const payload1 = {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [{
            cursor: 'cursor:bestFriends',
            node: {
              id: 'pet',
              name: 'Beast',
            },
          }],
        },
      },
    };

    const recordSource = new RelayInMemoryRecordSource();
    recordSource.set(ROOT_ID, RelayStaticRecord.create(ROOT_ID, ROOT_TYPE));
    let handleFieldPayloads = normalize(
      recordSource,
      {
        dataID: ROOT_ID,
        node: UserFriends.query,
        variables: {id: '1', orderBy: ['last name'], isViewerFriend: true},
      },
      payload1
    );
    expect(recordSource.toJSON()).toMatchSnapshot();
    expect(handleFieldPayloads.length).toBe(1);
    expect(handleFieldPayloads[0]).toEqual({
      args: {first: 1, orderby: ['last name'], isViewerFriend: true},
      dataID: '4',
      fieldKey: 'friends{"first":1,"isViewerFriend":true,"orderby":["last name"]}',
      handle: 'bestFriends',
      handleKey: '__UserFriends_friends_bestFriends{"isViewerFriend":true,"orderby":["last name"]}',
    });

    const payload2 = {
      node: {
        id: '4',
        __typename: 'User',
        friends: {
          edges: [{
            cursor: 'cursor:bestFriends:2',
            node: {
              id: 'cat',
              name: 'Betty',
            },
          }],
        },
      },
    };
    handleFieldPayloads = normalize(
      recordSource,
      {
        dataID: ROOT_ID,
        node: UserFriends.query,
        variables: {id: '1', orderBy: ['first name'], isViewerFriend: true},
      },
      payload2,
    );
    expect(recordSource.toJSON()).toMatchSnapshot();
    expect(handleFieldPayloads.length).toBe(1);
    expect(handleFieldPayloads[0]).toEqual({
      args: {first: 1, orderby: ['first name'], isViewerFriend: true},
      dataID: '4',
      fieldKey: 'friends{"first":1,"isViewerFriend":true,"orderby":["first name"]}',
      handle: 'bestFriends',
      handleKey: '__UserFriends_friends_bestFriends{"isViewerFriend":true,"orderby":["first name"]}',
    });
  });

  it('warns in __DEV__ if payload data is missing an expected field', () => {
    jest.mock('warning');

    const {BarQuery} = generateWithTransforms(`
      query BarQuery($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            firstName
            profilePicture(size: 100) {
              uri
            }
          }
        }
      }
    `);
    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        profilePicture: {
          uri: 'https://...',
        },
      },
    };
    const recordSource = new RelayInMemoryRecordSource();
    recordSource.set(ROOT_ID, RelayStaticRecord.create(ROOT_ID, ROOT_TYPE));
    expect(() => {
      normalize(
        recordSource,
        {
          dataID: ROOT_ID,
          node: BarQuery,
          variables: {id: '1'},
        },
        payload,
        {handleStrippedNulls: true},
      );
    }).toWarn([
      'RelayResponseNormalizer(): Payload did not contain a value for ' +
      'field `%s: %s`. Check that you are parsing with the same query that ' +
      'was used to fetch the payload.',
      'firstName',
      'firstName',
    ]);
  });

  it('warns in __DEV__ if payload contains inconsistent types for a record', () => {
    jest.mock('warning');

    const {BarQuery} = generateWithTransforms(`
      query BarQuery($id: ID) {
        node(id: $id) {
          id
          __typename
          ... on User {
            actor {
              id
              __typename
            }
            actors {
              id
              __typename
            }
          }
        }
      }
    `);
    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        actor: {
          id: '1',
          __typename: 'Actor', // <- invalid
        },
        actors: [{
          id: '1',
          __typename: 'Actors', // <- invalid
        }],
      },
    };
    const recordSource = new RelayInMemoryRecordSource();
    recordSource.set(ROOT_ID, RelayStaticRecord.create(ROOT_ID, ROOT_TYPE));
    expect(() => {
      normalize(
        recordSource,
        {
          dataID: ROOT_ID,
          node: BarQuery,
          variables: {id: '1'},
        },
        payload,
        {handleStrippedNulls: true},
      );
    }).toWarn([
      'RelayResponseNormalizer: Invalid record `%s`. Expected %s to be ' +
      'be consistent, but the record was assigned conflicting types ' +
      '`%s` and `%s`.',
      '1',
      '__typename',
      'User',
      'Actor',
    ]);
    expect(() => {
      normalize(
        recordSource,
        {
          dataID: ROOT_ID,
          node: BarQuery,
          variables: {id: '1'},
        },
        payload,
        {handleStrippedNulls: true},
      );
    }).toWarn([
      'RelayResponseNormalizer: Invalid record `%s`. Expected %s to be ' +
      'be consistent, but the record was assigned conflicting types ' +
      '`%s` and `%s`.',
      '1',
      '__typename',
      'Actor', // `User` is already overwritten when the plural field is reached
      'Actors',
    ]);
  });

  it('leaves undefined fields unset, as handleStrippedNulls == false', () => {
    const {StrippedQuery} = generateWithTransforms(`
      query StrippedQuery($id: ID, $size: Int) {
        node(id: $id) {
          id
          __typename
          ... on User {
            firstName
            profilePicture(size: $size) {
              uri
            }
          }
        }
      }
    `);
    const payload = {
      node: {
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
      },
    };
    const recordSource = new RelayInMemoryRecordSource();
    recordSource.set(ROOT_ID, RelayStaticRecord.create(ROOT_ID, ROOT_TYPE));
    normalize(
      recordSource,
      {
        dataID: ROOT_ID,
        node: StrippedQuery,
        variables: {id: '1', size: 32},
      },
      payload,
      {handleStrippedNulls: false}
    );
    expect(recordSource.toJSON()).toEqual({
      '1': {
        __id: '1',
        __typename: 'User',
        id: '1',
        firstName: 'Alice',
        // `profilePicture` is excluded
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node{"id":"1"}': {
          __ref: '1',
        },
      },
    });
  });
});

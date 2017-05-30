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
const RelayRecordSourceMutator = require('RelayRecordSourceMutator');
const RelayRecordSourceProxy = require('RelayRecordSourceProxy');
const RelayRecordProxyReader = require('RelayRecordProxyReader');
const RelayReader = require('RelayReader');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayModernTestUtils = require('RelayModernTestUtils');
const RelayModernRecord = require('RelayModernRecord');

const simpleClone = require('simpleClone');

const {read} = RelayReader;
const {ROOT_ID} = RelayStoreUtils;

function getProxyStore(source) {
  const backupData = {};
  const sinkData = {};
  const baseData = simpleClone(source);
  const baseSource = new RelayInMemoryRecordSource(baseData);
  const backupSource = new RelayInMemoryRecordSource(backupData);
  const sinkSource = new RelayInMemoryRecordSource(sinkData);
  const mutator = new RelayRecordSourceMutator(
    baseSource,
    sinkSource,
    backupSource,
  );
  return new RelayRecordSourceProxy(mutator);
}

describe('RelayReader', () => {
  const {generateAndCompile, generateWithTransforms} = RelayModernTestUtils;
  let source;
  let proxy;

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
    proxy = getProxyStore(data);
  });

  it('reads query data', () => {
    const {FooQuery} = generateWithTransforms(
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
    `,
    );
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      const {data, seenRecords} = read(
        store,
        {
          dataID: ROOT_ID,
          node: FooQuery,
          variables: {id: '1', size: 32},
        },
        reader,
      );
      expect(data).toEqual({
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
      });
      expect(Object.keys(seenRecords)).toEqual([
        '1',
        '2',
        '3',
        'client:root',
        'client:1',
        'client:2',
        'client:3',
        'client:4',
      ]);
    });
  });

  it('reads fragment data', () => {
    const {BarFragment} = generateWithTransforms(
      `
      fragment BarFragment on User @argumentDefinitions(
        size: {type: "[Int]"}
      ) {
        id
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
    `,
    );
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      const {data, seenRecords} = read(
        store,
        {
          dataID: '1',
          node: BarFragment,
          variables: {size: 32},
        },
        reader,
      );
      expect(data).toEqual({
        id: '1',
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
      });
      expect(Object.keys(seenRecords)).toEqual([
        '1',
        '2',
        '3',
        'client:1',
        'client:2',
        'client:3',
        'client:4',
      ]);
    });
  });

  it('creates fragment pointers', () => {
    const {UserProfile} = generateAndCompile(
      `
      fragment UserProfile on User @argumentDefinitions(
        size: {type: "[Int]"}
      ) {
        id
        ...UserProfilePicture @arguments(size: $size)
      }

      fragment UserProfilePicture on User @argumentDefinitions(
        size: {type: "[Int]"}
      ) {
        profilePicture(size: $size) {
          uri
        }
      }
    `,
    );
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      const {data, seenRecords} = read(
        store,
        {
          dataID: '1',
          node: UserProfile,
          variables: {size: 42},
        },
        reader,
      );
      expect(data).toEqual({
        id: '1',
        __id: '1',
        __fragments: {
          UserProfilePicture: {
            size: 42,
          },
        },
      });
      expect(Object.keys(seenRecords)).toEqual(['1']);
    });
  });

  it('reads data when the root is deleted', () => {
    const {UserProfile} = generateAndCompile(
      `
      fragment UserProfile on User {
        name
      }
    `,
    );
    source = new RelayInMemoryRecordSource();
    proxy = getProxyStore({});
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      store.delete('4');
      const {data, seenRecords} = read(
        store,
        {
          dataID: '4',
          node: UserProfile,
          variables: {},
        },
        reader,
      );
      expect(data).toBe(null);
      expect(Object.keys(seenRecords)).toEqual(['4']);
    });
  });

  it('reads data when the root is unfetched', () => {
    const {UserProfile} = generateAndCompile(
      `
      fragment UserProfile on User {
        name
      }
    `,
    );
    source = new RelayInMemoryRecordSource();
    proxy = getProxyStore({});
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      const {data, seenRecords} = read(
        store,
        {
          dataID: '4',
          node: UserProfile,
          variables: {},
        },
        reader,
      );
      expect(data).toBe(undefined);
      expect(Object.keys(seenRecords)).toEqual(['4']);
    });
  });

  it('reads "handle" fields for query root fragments', () => {
    const records = {
      '1': {
        __id: '1',
        __typename: 'User',
        __friends_bestFriends: {__ref: 'client:bestFriends'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
        __name_friendsName: 'handleName',
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
        node: {__ref: '2'},
      },
      'client:root': {
        __id: 'client:root',
        __typename: '__Root',
        'node{"id":"1"}': {__ref: '1'},
      },
    };
    source = new RelayInMemoryRecordSource(records);
    proxy = getProxyStore(records);
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      const {UserFriends} = generateAndCompile(`
        query UserFriends($id: ID!) {
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
      `);
      const {data, seenRecords} = read(
        store,
        {
          dataID: ROOT_ID,
          node: UserFriends.fragment,
          variables: {id: '1'},
        },
        reader,
      );
      expect(data).toEqual({
        node: {
          friends: {
            edges: [
              {
                cursor: 'cursor:bestFriendsEdge',
                node: {
                  id: '2',
                  name: 'handleName',
                },
              },
            ],
          },
        },
      });
      expect(Object.keys(seenRecords).sort()).toEqual([
        '1',
        '2',
        'client:bestFriends',
        'client:bestFriendsEdge',
        'client:root',
      ]);
    });
  });

  it('reads "handle" fields for fragments', () => {
    const records = {
      '1': {
        __id: '1',
        __typename: 'User',
        __friends_bestFriends: {__ref: 'client:bestFriends'},
      },
      '2': {
        __id: '2',
        __typename: 'User',
        id: '2',
        __name_friendsName: 'handleName',
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
        node: {__ref: '2'},
      },
    };
    source = new RelayInMemoryRecordSource(records);
    proxy = getProxyStore(records);
    const instances = [
      {
        store: source,
        reader: RelayModernRecord,
      },
      {
        store: proxy,
        reader: RelayRecordProxyReader,
      },
    ];

    instances.map(({store, reader}) => {
      const {UserFriends} = generateAndCompile(`
        fragment UserFriends on User {
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
      `);
      const {data, seenRecords} = read(
        store,
        {
          dataID: '1',
          node: UserFriends,
          variables: {},
        },
        reader,
      );
      expect(data).toEqual({
        friends: {
          edges: [
            {
              cursor: 'cursor:bestFriendsEdge',
              node: {
                id: '2',
                name: 'handleName',
              },
            },
          ],
        },
      });
      expect(Object.keys(seenRecords).sort()).toEqual([
        '1',
        '2',
        'client:bestFriends',
        'client:bestFriendsEdge',
      ]);
    });
  });
});

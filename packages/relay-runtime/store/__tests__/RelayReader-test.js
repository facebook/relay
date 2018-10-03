/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @emails oncall+relay
 */

'use strict';

jest.mock('generateClientID');

const RelayInMemoryRecordSource = require('../RelayInMemoryRecordSource');
const RelayModernTestUtils = require('RelayModernTestUtils');

const {read} = require('../RelayReader');
const {ROOT_ID} = require('../RelayStoreUtils');

describe('RelayReader', () => {
  const {generateAndCompile, generateWithTransforms} = RelayModernTestUtils;
  let source;

  beforeEach(() => {
    jest.resetModules();

    const data = {
      '1': {
        __id: '1',
        id: '1',
        __typename: 'User',
        firstName: 'Alice',
        'friends(first:3)': {__ref: 'client:1'},
        'profilePicture(size:32)': {__ref: 'client:4'},
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
        'node(id:"1")': {__ref: '1'},
      },
    };

    source = new RelayInMemoryRecordSource(data);
  });

  it('reads query data', () => {
    const {FooQuery} = generateWithTransforms(`
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
    `);
    const {data, seenRecords} = read(source, {
      dataID: ROOT_ID,
      node: FooQuery.fragment,
      variables: {id: '1', size: 32},
    });
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

  it('reads fragment data', () => {
    const {BarFragment} = generateWithTransforms(`
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
    `);
    const {data, seenRecords} = read(source, {
      dataID: '1',
      node: BarFragment,
      variables: {size: 32},
    });
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

  it('creates fragment pointers', () => {
    const {UserProfile} = generateAndCompile(`
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
    `);

    const {data, seenRecords} = read(source, {
      dataID: '1',
      node: UserProfile,
      variables: {size: 42},
    });
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

  it('reads data when the root is deleted', () => {
    const {UserProfile} = generateAndCompile(`
      fragment UserProfile on User {
        name
      }
    `);
    source = new RelayInMemoryRecordSource();
    source.delete('4');
    const {data, seenRecords} = read(source, {
      dataID: '4',
      node: UserProfile,
      variables: {},
    });
    expect(data).toBe(null);
    expect(Object.keys(seenRecords)).toEqual(['4']);
  });

  it('reads data when the root is unfetched', () => {
    const {UserProfile} = generateAndCompile(`
      fragment UserProfile on User {
        name
      }
    `);
    source = new RelayInMemoryRecordSource();
    const {data, seenRecords} = read(source, {
      dataID: '4',
      node: UserProfile,
      variables: {},
    });
    expect(data).toBe(undefined);
    expect(Object.keys(seenRecords)).toEqual(['4']);
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
        'node(id:"1")': {__ref: '1'},
      },
    };
    source = new RelayInMemoryRecordSource(records);
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
    const {data, seenRecords} = read(source, {
      dataID: ROOT_ID,
      node: UserFriends.fragment,
      variables: {id: '1'},
    });
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
    const {data, seenRecords} = read(source, {
      dataID: '1',
      node: UserFriends,
      variables: {},
    });
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

  describe('`isMissingData` field', () => {
    describe('readScalar', () => {
      it('should have `isMissingData = false` if data is available', () => {
        const {UserProfile} = generateAndCompile(`
          fragment UserProfile on User {
            id
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: UserProfile,
          variables: {},
        });
        expect(data.id).toBe('1');
        expect(isMissingData).toBe(false);
      });

      it('should have `isMissingData = true` if data is missing', () => {
        const {UserProfile} = generateAndCompile(`
          fragment UserProfile on User {
            id
            username
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: UserProfile,
          variables: {},
        });
        expect(data.id).toBe('1');
        expect(data.username).not.toBeDefined();
        expect(isMissingData).toBe(true);
      });
    });

    describe('readLink', () => {
      it('should have `isMissingData = false` if data is available', () => {
        const {ProfilePicture} = generateAndCompile(`
          fragment ProfilePicture on User {
            id
            profilePicture(size: $size) {
              uri
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: ProfilePicture,
          variables: {
            size: 32,
          },
        });
        expect(data.profilePicture.uri).toEqual('https://...');
        expect(isMissingData).toBe(false);
      });

      it('should have `isMissingData = true` if data is missing', () => {
        const {Address} = generateAndCompile(`
          fragment Address on User {
            id
            address {
              city
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: Address,
          variables: {},
        });
        expect(data.id).toBe('1');
        expect(data.address).not.toBeDefined();
        expect(isMissingData).toBe(true);
      });

      it('should have `isMissingData = true` if data is missing (variables)', () => {
        const {ProfilePicture} = generateAndCompile(`
          fragment ProfilePicture on User {
            id
            profilePicture(size: $size) {
              uri
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: ProfilePicture,
          variables: {
            size: 48,
          },
        });
        expect(data.id).toBe('1');
        expect(data.profilePicture).not.toBeDefined();
        expect(isMissingData).toBe(true);
      });
    });

    describe('readPluralLink', () => {
      beforeEach(() => {
        const data = {
          '1': {
            __id: '1',
            id: '1',
            __typename: 'User',
            firstName: 'Alice',
            'friends(first:3)': {__ref: 'client:1'},
          },
          '2': {
            __id: '2',
            __typename: 'User',
            id: '2',
            firstName: 'Bob',
            'friends(first:2)': {__ref: 'client:4'},
          },
          '3': {
            __id: '3',
            __typename: 'User',
            id: '3',
            firstName: 'Claire',
            'friends(first:1)': {__ref: 'client:5'},
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
            __id: 'client:2',
            __typename: 'FriendsConnection',
          },
          'client:5': {
            __id: 'client:3',
            __typename: 'FriendsConnection',
            edges: {
              __refs: [undefined],
            },
          },
          'client:root': {
            __id: 'client:root',
            __typename: '__Root',
            'node(id:"1")': {__ref: '1'},
          },
        };

        source = new RelayInMemoryRecordSource(data);
      });

      it('should have `isMissingData = false` if data is available', () => {
        const {UserFriends} = generateAndCompile(`
          fragment UserFriends on User {
            id
            friends(first: 3) {
              edges {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: UserFriends,
          variables: {},
        });
        expect(data.friends.edges).toEqual([
          {
            cursor: 'cursor:2',
            node: {
              id: '2',
            },
          },
          null,
          {
            cursor: 'cursor:3',
            node: {
              id: '3',
            },
          },
        ]);
        expect(isMissingData).toBe(false);
      });

      it('should have `isMissingData = true` if data is missing in the node', () => {
        const {UserFriends} = generateAndCompile(`
          fragment UserFriends on User {
            id
            friends(first: 3) {
              edges {
                cursor
                node {
                  id
                  username
                }
              }
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '1',
          node: UserFriends,
          variables: {},
        });
        expect(data.friends.edges).toEqual([
          {
            cursor: 'cursor:2',
            node: {
              id: '2',
            },
          },
          null,
          {
            cursor: 'cursor:3',
            node: {
              id: '3',
            },
          },
        ]);
        expect(isMissingData).toBe(true);
      });

      it('should have `isMissingData = true` if data is missing for connection', () => {
        const {UserFriends} = generateAndCompile(`
          fragment UserFriends on User {
            id
            friends(first: 2) {
              edges {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '2',
          node: UserFriends,
          variables: {},
        });
        expect(data.id).toBe('2');
        expect(data.friends.edges).not.toBeDefined();
        expect(isMissingData).toBe(true);
      });

      it('should have `isMissingData = true` if data is missing for edge in the connection', () => {
        const {UserFriends} = generateAndCompile(`
          fragment UserFriends on User {
            id
            friends(first: 1) {
              edges {
                cursor
                node {
                  id
                }
              }
            }
          }
        `);
        const {data, isMissingData} = read(source, {
          dataID: '3',
          node: UserFriends,
          variables: {},
        });
        expect(data.id).toBe('3');
        expect(data.friends.edges).toEqual([undefined]);
        expect(isMissingData).toBe(true);
      });
    });
  });
});

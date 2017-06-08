/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest.enableAutomock();

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayTestUtils = require('RelayTestUtils');

const generateRQLFieldAlias = require('generateRQLFieldAlias');
const transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('transformClientPayload()', () => {
  const {getNode} = RelayTestUtils;

  it('transforms singular root payloads', () => {
    const query = getNode(
      Relay.QL`
      query {
        node(id: "123") {
          friends(first: 1) {
            count
            edges {
              node {
                id
                ... on User {
                  profilePicture(size: 32) {
                    uri
                  }
                }
              }
            }
          }
        }
      }
    `,
    );
    const payload = {
      node: {
        id: '123',
        friends: {
          count: 1,
          edges: [
            {
              cursor: 'friend:cursor',
              node: {
                id: 'client:1',
                profilePicture: {
                  uri: 'friend.jpg',
                },
              },
            },
          ],
        },
      },
    };
    expect(transformRelayQueryPayload(query, payload)).toEqual({
      node: {
        id: '123',
        [generateRQLFieldAlias('friends.first(1)')]: {
          count: 1,
          edges: [
            {
              cursor: 'friend:cursor',
              node: {
                id: 'client:1',
                [generateRQLFieldAlias('profilePicture.size(32)')]: {
                  uri: 'friend.jpg',
                },
              },
            },
          ],
        },
      },
    });
  });

  it('transforms plural root payloads of arrays', () => {
    const query = getNode(
      Relay.QL`
      query {
        nodes(ids: ["123", "456"]) {
          ... on User {
            profilePicture(size: 32) {
              uri
            }
          }
        }
      }
    `,
    );
    const payload = {
      123: {
        id: '123',
        profilePicture: {
          uri: '123.jpg',
        },
      },
      456: {
        id: '456',
        profilePicture: {
          uri: '456.jpg',
        },
      },
    };
    expect(transformRelayQueryPayload(query, payload)).toEqual({
      123: {
        id: '123',
        [generateRQLFieldAlias('profilePicture.size(32)')]: {
          uri: '123.jpg',
        },
      },
      456: {
        id: '456',
        [generateRQLFieldAlias('profilePicture.size(32)')]: {
          uri: '456.jpg',
        },
      },
    });
  });

  it('transforms plural root payloads of objects (OSS)', () => {
    const query = getNode(
      Relay.QL`
      query {
        nodes(ids: ["123", "456"]) {
          ... on User {
            profilePicture(size: 32) {
              uri
            }
          }
        }
      }
    `,
    );
    const payload = {
      nodes: [
        {
          id: '123',
          profilePicture: {
            uri: '123.jpg',
          },
        },
        {
          id: '456',
          profilePicture: {
            uri: '456.jpg',
          },
        },
      ],
    };
    expect(transformRelayQueryPayload(query, payload)).toEqual({
      nodes: [
        {
          id: '123',
          [generateRQLFieldAlias('profilePicture.size(32)')]: {
            uri: '123.jpg',
          },
        },
        {
          id: '456',
          [generateRQLFieldAlias('profilePicture.size(32)')]: {
            uri: '456.jpg',
          },
        },
      ],
    });
  });

  it('transforms plural root payloads of objects (FB)', () => {
    const query = getNode(
      Relay.QL`
      query {
        nodes(ids: ["123", "456"]) {
          ... on User {
            profilePicture(size: 32) {
              uri
            }
          }
        }
      }
    `,
    );
    const payload = {
      nodes: [
        {
          id: '123',
          profilePicture: {
            uri: '123.jpg',
          },
        },
        {
          id: '456',
          profilePicture: {
            uri: '456.jpg',
          },
        },
      ],
    };
    expect(transformRelayQueryPayload(query, payload)).toEqual({
      nodes: [
        {
          id: '123',
          [generateRQLFieldAlias('profilePicture.size(32)')]: {
            uri: '123.jpg',
          },
        },
        {
          id: '456',
          [generateRQLFieldAlias('profilePicture.size(32)')]: {
            uri: '456.jpg',
          },
        },
      ],
    });
  });

  it('uses the query interface to construct keys', () => {
    const queryInterface = {
      getKeyForClientData: jest.fn(field =>
        Array.from(field.getApplicationName()).reverse().join(''),
      ),
      traverseChildren: jest.fn((node, callback, context) =>
        node
          .getChildren()
          .reverse()
          .forEach((...args) => callback.apply(context, args)),
      ),
    };
    const query = getNode(
      Relay.QL`
      query {
        me {
          id
          name
          profilePicture {
            uri
          }
        }
      }
    `,
    );
    const payload = {
      me: {
        erutciPeliforp: {
          iru: 'abc.jpg',
        },
        eman: 'ABC',
        di: '123',
      },
    };
    expect(transformRelayQueryPayload(query, payload, queryInterface)).toEqual({
      me: {
        id: '123',
        name: 'ABC',
        profilePicture: {
          uri: 'abc.jpg',
        },
      },
    });

    // `getKeyForClientData` should be called on every field.
    expect(
      queryInterface.getKeyForClientData.mock.calls.map(([field]) =>
        field.getApplicationName(),
      ),
    ).toEqual(['profilePicture', 'uri', 'name', 'id']);

    // `traverseChildren` should be called on every field with children.
    expect(
      queryInterface.traverseChildren.mock.calls.map(
        ([node]) =>
          node instanceof RelayQuery.Root
            ? node.getFieldName()
            : node.getApplicationName(),
      ),
    ).toEqual(['me', 'profilePicture']);
  });
});

/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayTestUtils = require('RelayTestUtils');

const generateRQLFieldAlias = require('generateRQLFieldAlias');
const transformRelayQueryPayload = require('transformRelayQueryPayload');

describe('transformClientPayload()', () => {
  var {getNode} = RelayTestUtils;

  it('transforms singular root payloads', () => {
    var query = getNode(Relay.QL`
      query {
        node(id: "123") {
          friends(first:"1") {
            count,
            edges {
              node {
                id,
                ... on User {
                  profilePicture(size: "32") {
                    uri,
                  },
                },
              },
            },
          },
        }
      }
    `);
    var payload = {
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
        __typename: undefined,
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
          pageInfo: undefined,
        },
      },
    });
  });

  it('transforms plural root payloads of arrays', () => {
    var query = getNode(Relay.QL`
      query {
        nodes(ids: ["123", "456"]) {
          ... on User {
            profilePicture(size: "32") {
              uri,
            },
          },
        },
      }
    `);
    var payload = {
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
        __typename: undefined,
        id: '123',
        [generateRQLFieldAlias('profilePicture.size(32)')]: {
          uri: '123.jpg',
        },
      },
      456: {
        __typename: undefined,
        id: '456',
        [generateRQLFieldAlias('profilePicture.size(32)')]: {
          uri: '456.jpg',
        },
      },
    });
  });

  it('transforms plural root payloads of objects (OSS)', () => {
    var query = getNode(Relay.QL`
      query {
        nodes(ids: ["123", "456"]) {
          ... on User {
            profilePicture(size: "32") {
              uri,
            },
          },
        },
      }
    `);
    var payload = [
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
    ];
    expect(transformRelayQueryPayload(query, payload)).toEqual([
      {
        __typename: undefined,
        id: '123',
        [generateRQLFieldAlias('profilePicture.size(32)')]: {
          uri: '123.jpg',
        },
      },
      {
        __typename: undefined,
        id: '456',
        [generateRQLFieldAlias('profilePicture.size(32)')]: {
          uri: '456.jpg',
        },
      },
    ]);
  });

  it('transforms plural root payloads of objects (FB)', () => {
    var query = getNode(Relay.QL`
      query {
        nodes(ids: ["123", "456"]) {
          ... on User {
            profilePicture(size: "32") {
              uri,
            },
          },
        },
      }
    `);
    var payload = {
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
          __typename: undefined,
          id: '123',
          [generateRQLFieldAlias('profilePicture.size(32)')]: {
            uri: '123.jpg',
          },
        },
        {
          __typename: undefined,
          id: '456',
          [generateRQLFieldAlias('profilePicture.size(32)')]: {
            uri: '456.jpg',
          },
        },
      ],
    });
  });
});

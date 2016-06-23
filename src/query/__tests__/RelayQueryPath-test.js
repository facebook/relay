/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

jest.mock('warning');

const Relay = require('Relay');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStore = require('RelayRecordStore');
const RelayRecordWriter = require('RelayRecordWriter');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryPath', () => {
  const {getNode, getVerbatimNode} = RelayTestUtils;
  let store;
  let writer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    const records = {};
    store = new RelayRecordStore({records});
    writer = new RelayRecordWriter(records);

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('creates root paths', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id
        }
      }
    `);
    const fragment = Relay.QL`
      fragment on Node {
        id
        __typename
        name
      }
    `;

    const path = RelayQueryPath.create(query);
    expect(RelayQueryPath.getName(path)).toBe(query.getName());
    expect(RelayQueryPath.getRouteName(path)).toBe(query.getRoute().name);

    writer.putRecord('123', 'User');
    const pathQuery = RelayQueryPath.getQuery(store, path, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            ${fragment}
            id
            __typename
          }
        }
      }
    `));
  });

  it('creates root paths for argument-less root calls with IDs', () => {
    const query = getNode(Relay.QL`
      query {
        me {
          id
        }
      }
    `);
    const fragment = Relay.QL`
      fragment on Actor {
        name
      }
    `;
    const path = RelayQueryPath.create(query);
    const pathQuery = RelayQueryPath.getQuery(store, path, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        me {
          id
          ${fragment}
        }
      }
    `));
    expect(RelayQueryPath.getName(path)).toBe(query.getName());
    expect(RelayQueryPath.getRouteName(path)).toBe(query.getRoute().name);
  });

  it('creates root paths for argument-less root calls without IDs', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    const fragment = Relay.QL`
      fragment on Viewer {
        actor {
          name
        }
      }
    `;
    const path = RelayQueryPath.create(query);
    const pathQuery = RelayQueryPath.getQuery(store, path, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${fragment}
        }
      }
    `));
    expect(RelayQueryPath.getName(path)).toBe(query.getName());
    expect(RelayQueryPath.getRouteName(path)).toBe(query.getRoute().name);
  });

  it('creates paths to non-refetchable fields', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id
        }
      }
    `);
    const address = getNode(Relay.QL`
      fragment on Actor {
        address {
          city
        }
      }
    `).getFieldByStorageKey('address');
    const city = getNode(Relay.QL`
      fragment on StreetAddress {
        city
      }
    `).getFieldByStorageKey('city');

    // address is not refetchable, has client ID
    writer.putRecord('123', 'User');
    const root = RelayQueryPath.create(query);
    const path = RelayQueryPath.getPath(root, address, 'client:1');
    const pathQuery = RelayQueryPath.getQuery(store, path, city);
    expect(pathQuery).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            id
            __typename
            address {
              city
            }
          }
        }
      }
    `));
    expect(RelayQueryPath.getName(path)).toBe(query.getName());
    expect(pathQuery.getName()).toBe(query.getName());
    expect(pathQuery.getRoute().name).toBe(query.getRoute().name);
    expect(pathQuery.isAbstract()).toBe(true);
  });

  it('creates roots for refetchable fields', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    const actor = query.getFieldByStorageKey('actor');
    const fragment = Relay.QL`
      fragment on Node {
        name
      }
    `;

    // actor has an ID and is refetchable
    writer.putRecord('123', 'User');
    const root = RelayQueryPath.create(query);
    const path = RelayQueryPath.getPath(root, actor, '123');
    const pathQuery = RelayQueryPath.getQuery(store, path, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            id
            __typename
            ... on Node {
              id
              __typename
              name
            }
          }
        }
      }
    `));
    expect(pathQuery.getName()).toBe(query.getName());
    expect(pathQuery.getRoute().name).toBe(query.getRoute().name);
  });

  it('warns if the root record\'s type is unknown', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    const actor = query.getFieldByStorageKey('actor');
    const fragment = Relay.QL`
      fragment on Node {
        name
      }
    `;

    // actor has an ID and is refetchable, but the type of actor is unknown.
    const root = RelayQueryPath.create(query);
    const path = RelayQueryPath.getPath(root, actor, '123');
    const pathQuery = RelayQueryPath.getQuery(store, path, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          # not wrapped in a concrete fragment because the type is unknown.
          ... on Node {
            name
            id
            __typename
          }
          id
          __typename
        }
      }
    `));
    expect(pathQuery.getName()).toBe(query.getName());
    expect(pathQuery.getRoute().name).toBe(query.getRoute().name);
    expect([
      'RelayQueryPath: No typename found for %s record `%s`. Generating a ' +
      'possibly invalid query.',
      'unknown',
      '123',
    ]).toBeWarnedNTimes(1);
  });

  describe('getPath()', () => {
    it('returns a client path given no `dataID`', () => {
      const query = getNode(Relay.QL`
        query {
          viewer {
            actor {
              id
            }
          }
        }
      `);
      const actor = query.getFieldByStorageKey('actor');
      const path = RelayQueryPath.getPath(query, actor);  // No `dataID`
      expect(path).toEqual({
        node: actor,
        parent: query,
        type: 'client',
      });
    });
  });
});

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
  var {getNode, getVerbatimNode} = RelayTestUtils;
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
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id
        }
      }
    `);
    var fragment = Relay.QL`
      fragment on Node {
        id
        __typename
        name
      }
    `;

    var path = new RelayQueryPath(query);
    expect(path.getName()).toBe(query.getName());

    writer.putRecord('123', 'User');
    var pathQuery = path.getQuery(store, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          ... on User {
            id
            __typename
            ${fragment}
          }
        }
      }
    `));
  });

  it('creates root paths for argument-less root calls with IDs', () => {
    var query = getNode(Relay.QL`
      query {
        me {
          id
        }
      }
    `);
    var fragment = Relay.QL`
      fragment on Actor {
        name
      }
    `;
    var path = new RelayQueryPath(query);
    var pathQuery = path.getQuery(store, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        me {
          id
          ${fragment}
        }
      }
    `));
    expect(path.getName()).toBe(query.getName());
  });

  it('creates root paths for argument-less root calls without IDs', () => {
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    var fragment = Relay.QL`
      fragment on Viewer {
        actor {
          name
        }
      }
    `;
    var path = new RelayQueryPath(query);
    var pathQuery = path.getQuery(store, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${fragment}
        }
      }
    `));
    expect(path.getName()).toBe(query.getName());
  });

  it('creates paths to non-refetchable fields', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id
        }
      }
    `);
    var address = getNode(Relay.QL`
      fragment on Actor {
        address {
          city
        }
      }
    `).getFieldByStorageKey('address');
    var city = getNode(Relay.QL`
      fragment on StreetAddress {
        city
      }
    `).getFieldByStorageKey('city');

    // address is not refetchable, has client ID
    writer.putRecord('123', 'User');
    var root = new RelayQueryPath(query);
    var path = root.getPath(address, 'client:1');
    var pathQuery = path.getQuery(store, city);
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
    expect(path.getName()).toBe(query.getName());
    expect(pathQuery.getName()).toBe(query.getName());
    expect(pathQuery.isAbstract()).toBe(true);
  });

  it('creates roots for refetchable fields', () => {
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    var actor = query.getFieldByStorageKey('actor');
    var fragment = Relay.QL`
      fragment on Node {
        name
      }
    `;

    // actor has an ID and is refetchable
    writer.putRecord('123', 'User');
    var root = new RelayQueryPath(query);
    var path = root.getPath(actor, '123');
    var pathQuery = path.getQuery(store, getNode(fragment));
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
    expect(path.getName()).toBe(query.getName());
  });

  it('warns if the root record\'s type is unknown', () => {
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    var actor = query.getFieldByStorageKey('actor');
    var fragment = Relay.QL`
      fragment on Node {
        name
      }
    `;

    // actor has an ID and is refetchable, but the type of actor is unknown.
    var root = new RelayQueryPath(query);
    var path = root.getPath(actor, '123');
    var pathQuery = path.getQuery(store, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getVerbatimNode(Relay.QL`
      query {
        node(id:"123") {
          # not wrapped in a concrete fragment because the type is unknown.
          id
          __typename
          ... on Node {
            id
            __typename
            name
          }
        }
      }
    `));
    expect(path.getName()).toBe(query.getName());
    expect([
      'RelayQueryPath: No typename found for %s record `%s`. Generating a ' +
      'possibly invalid query.',
      'unknown',
      '123',
    ]).toBeWarnedNTimes(1);
  });
});

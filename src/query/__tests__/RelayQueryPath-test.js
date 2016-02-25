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

const Relay = require('Relay');
const RelayQueryPath = require('RelayQueryPath');
const RelayRecordStore = require('RelayRecordStore');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryPath', () => {
  var {getNode} = RelayTestUtils;
  let store;

  beforeEach(() => {
    jest.resetModuleRegistry();

    store = new RelayRecordStore({record: {}});

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
        name
      }
    `;

    var path = new RelayQueryPath(query);
    expect(path.getName()).toBe(query.getName());

    var pathQuery = path.getQuery(store, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          id
          __typename
          ${fragment}
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
    var root = new RelayQueryPath(query);
    var path = root.getPath(address, 'client:1');
    var pathQuery = path.getQuery(store, city);
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          id
          __typename
          address {
            city
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
    var root = new RelayQueryPath(query);
    var path = root.getPath(actor, '123');
    var pathQuery = path.getQuery(store, getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          id
          __typename
          ${fragment}
        }
      }
    `));
    expect(path.getName()).toBe(query.getName());
  });
});

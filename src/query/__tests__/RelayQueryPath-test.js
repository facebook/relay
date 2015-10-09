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

var RelayTestUtils = require('RelayTestUtils');
RelayTestUtils.unmockRelay();

var Relay = require('Relay');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayQueryPath = require('RelayQueryPath');

describe('RelayQueryPath', () => {
  var fromJSON;
  var {getNode} = RelayTestUtils;

  var EMPTY_FRAGMENT = {
    kind: 'FragmentDefinition',
    name: '$RelayQueryPath',
    type: 'Node',
    children: [],
    metadata: {
      isDeferred: false,
      isContainerFragment: false,
    },
  };

  beforeEach(() => {
    jest.resetModuleRegistry();

    fromJSON = RelayQueryPath.fromJSON;

    jest.addMatchers(RelayTestUtils.matchers);
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

    var pathQuery = path.getQuery(getNode(fragment));
    expect(pathQuery).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          ${fragment},
        }
      }
    `));

    // Ensure that the generated `id` field contains necessary metadata.
    var idField = pathQuery.getFieldByStorageKey('id');
    expect(idField.getParentType()).toBe(RelayNodeInterface.NODE_TYPE);
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
    expect(path.getQuery(getNode(fragment))).toEqualQueryRoot(getNode(Relay.QL`
      query {
        me {
          id,
          ${fragment},
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
    expect(path.getQuery(getNode(fragment))).toEqualQueryRoot(getNode(Relay.QL`
      query {
        viewer {
          ${fragment},
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
    expect(path.getQuery(city)).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
          address {
            city
          }
        }
      }
    `));
    expect(path.getName()).toBe(query.getName());
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
    expect(path.getQuery(getNode(fragment))).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          ${fragment},
        }
      }
    `));
    expect(path.getName()).toBe(query.getName());
  });

  it('serializes root paths', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
        }
      }
    `);
    var root = new RelayQueryPath(query);

    expect(root.toJSON()).toEqual([{
      kind: 'Query',
      name: 'RelayQueryPath',
      fieldName: 'node',
      calls: [{name: 'id', value: '123'}],
      children: [
        {
          kind: 'Field',
          name: 'id',
          alias: null,
          calls: [],
          children: [],
          metadata: {
            requisite: true,
            parentType: 'Node'
          },
        },
        {
          kind: 'Field',
          name: '__typename',
          alias: null,
          calls: [],
          children: [],
          metadata: {
            generated: true,
            requisite: true,
            parentType: 'Node'
          },
        },
      ],
      metadata: {
        identifyingArgName: 'id',
      },
    }]);

    var fragment = Relay.QL`fragment on Node { name }`;
    var clone = fromJSON(root.toJSON());
    expect(clone.getQuery(getNode(fragment))).toEqualQueryRoot(
      getNode(Relay.QL`
        query {
          node(id:"123") {
            id,
            ${fragment},
          }
        }
      `)
    );
    expect(clone.getName()).toBe(root.getName());
  });

  it('serializes root paths without a primary key', () => {
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id,
          },
        }
      }
    `);
    var root = new RelayQueryPath(query);

    expect(root.toJSON()).toEqual([{
      kind: 'Query',
      name: 'RelayQueryPath',
      fieldName: 'viewer',
      calls: [],
      children: [EMPTY_FRAGMENT],
      metadata: {},
    }]);

    var fragment = Relay.QL`fragment on Viewer { pendingPosts { count } }`;
    var clone = fromJSON(root.toJSON());
    expect(clone.getQuery(getNode(fragment))).toEqualQueryRoot(
      getNode(Relay.QL`
        query {
          viewer {
            ${fragment},
          }
        }
      `)
    );
    expect(clone.getName()).toBe(root.getName());
  });

  it('serializes non-root paths wihout a primary key', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
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

    var root = new RelayQueryPath(query);
    var path = root.getPath(address, 'client:1');

    expect(path.toJSON()).toEqual([
      {
        kind: 'Query',
        name: 'RelayQueryPath',
        fieldName: 'node',
        calls: [{name: 'id', value: '123'}],
        children: [
          {
            kind: 'Field',
            name: 'id',
            alias: null,
            calls: [],
            children: [],
            metadata: {
              requisite: true,
              parentType: 'Node'
            },
          },
          {
            kind: 'Field',
            name: '__typename',
            alias: null,
            calls: [],
            children: [],
            metadata: {
              generated: true,
              requisite: true,
              parentType: 'Node'
            },
          }
        ],
        metadata: {
          identifyingArgName: 'id',
        },
      },
      {
        kind: 'Field',
        name: 'address',
        alias: null,
        calls: [],
        children: [EMPTY_FRAGMENT],
        metadata: {
          parentType: 'Actor'
        },
      },
    ]);

    var fragment = Relay.QL`fragment on StreetAddress { country }`;
    var clone = fromJSON(path.toJSON());
    expect(clone.getQuery(getNode(fragment))).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          address {
            ${fragment},
          },
        }
      }
    `));
    expect(clone.getName()).toBe(path.getName());
  });
});

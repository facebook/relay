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
  var {getNode} = RelayTestUtils;

  function fromJSON(path) {
    // NOTE: This is needed to force `toJSON`-ing the entire path recursively.
    return RelayQueryPath.fromJSON(JSON.parse(JSON.stringify(path)));
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    jest.addMatchers(RelayTestUtils.matchers);
    jest.addMatchers({
      toSerializeTo(expected) {
        expect(JSON.parse(JSON.stringify(this.actual))).toEqual(expected);
        return true;
      },
    });
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

    expect(root).toSerializeTo([{
      calls: [{
        kind: 'Call',
        metadata: {
          type: null,
        },
        name: 'id',
        value: {
          callValue: '123',
          kind: 'CallValue',
        },
      }],
      children: [
        {
          calls: [],
          children: [],
          fieldName: 'id',
          kind: 'Field',
          metadata: {
            isRequisite: true,
            parentType: 'Node',
          },
        }, {
          calls: [],
          children: [],
          fieldName: '__typename',
          kind: 'Field',
          metadata: {
            isGenerated: true,
            isRequisite: true,
            parentType: 'Node',
          },
        },
      ],
      directives: [],
      fieldName: 'node',
      isDeferred: false,
      kind: 'Query',
      metadata: {
        identifyingArgName: 'id',
      },
      name: 'RelayQueryPath',
    }]);

    var fragment = Relay.QL`fragment on Node { name }`;
    var clone = fromJSON(root);
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

    expect(root).toSerializeTo([{
      calls: [],
      children: [{
        children: [],
        hash: null,
        kind: 'Fragment',
        metadata: {
          isConcrete: false,
          plural: false,
        },
        name: '$RelayQueryPath',
        type: 'Node',
      }],
      directives: [],
      fieldName: 'viewer',
      isDeferred: false,
      kind: 'Query',
      metadata: {},
      name: 'RelayQueryPath',
    }]);

    var fragment = Relay.QL`fragment on Viewer { pendingPosts { count } }`;
    var clone = fromJSON(root);
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

  it('serializes non-root paths without a primary key', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          id,
        }
      }
    `);
    var actorFragment = getNode(Relay.QL`
      fragment on Actor {
        address {
          city
        }
      }
    `);
    var address = actorFragment.getFieldByStorageKey('address');

    var root = new RelayQueryPath(query);
    var path = root
      .getPath(actorFragment, 'client:1')
      .getPath(address, 'client:1');

    var fragment = Relay.QL`fragment on StreetAddress { country }`;
    var clone = fromJSON(path);
    expect(clone.getQuery(getNode(fragment))).toEqualQueryRoot(getNode(Relay.QL`
      query {
        node(id:"123") {
          ... on Actor {
            address {
              ${fragment}
            }
          }
        }
      }
    `));
    expect(clone.getName()).toBe(path.getName());
  });
});

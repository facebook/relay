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

jest.dontMock('RelayQueryTracker');

const Relay = require('Relay');
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const invariant = require('invariant');

describe('RelayQueryTracker', () => {
  const {getNode} = RelayTestUtils;

  function getField(node, ...fieldNames) {
    for (let ii = 0; ii < fieldNames.length; ii++) {
      node = node.getFieldByStorageKey(fieldNames[ii]);
      invariant(
        !!node,
        'getField(): Expected node to have field named `%s`.',
        fieldNames[ii]
      );
    }
    return node;
  }

  function sortChildren(children) {
    return children.sort((a, b) => {
      const aKey = a.getSerializationKey();
      const bKey = b.getSerializationKey();
      return aKey < bKey ?
        -1 :
        (aKey > bKey ? 1 : 0);
    });
  }

  beforeEach(() => {
    jest.resetModuleRegistry();

    jasmine.addMatchers(RelayTestUtils.matchers);
  });

  it('tracks queries for ID-less root records', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    const path = RelayQueryPath.create(query);
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(query, 'client:1', path);
    const trackedChildren = tracker.getTrackedChildrenForID('client:1');
    expect(trackedChildren.length).toBe(1);
    expect(trackedChildren[0])
      .toEqualQueryNode(query.getFieldByStorageKey('actor'));
  });

  it('tracks queries for refetchable root records', () => {
    const query = getNode(Relay.QL`
      query {
        node(id:"123") {
          address {
            city
          }
        }
      }
    `);
    const nodeID = '123';
    const path = RelayQueryPath.create(query);
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(query, nodeID, path);
    const trackedChildren = sortChildren(tracker.getTrackedChildrenForID(nodeID));
    const children = sortChildren(query.getChildren());
    expect(trackedChildren.length).toBe(3);
    children.forEach((child, ii) => {
      expect(trackedChildren[ii]).toEqualQueryNode(child);
    });
  });

  it('tracks queries for refetchable records (with IDs)', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            address {
              city
            }
          }
        }
      }
    `);
    const actor = query.getFieldByStorageKey('actor');
    const actorID = '123';
    const path = RelayQueryPath.getPath(
      RelayQueryPath.create(query),
      getField(query, 'actor'),
      actorID
    );
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(actor, actorID, path);
    const children = sortChildren(actor.getChildren());
    const trackedChildren =
      sortChildren(tracker.getTrackedChildrenForID(actorID));
    children.forEach((child, ii) => {
      expect(trackedChildren[ii]).toEqualQueryNode(child);
    });
  });

  it('does not track queries for non-refetchable records', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            address {
              city
            }
          }
        }
      }
    `);
    const address =
      query.getFieldByStorageKey('actor').getFieldByStorageKey('address');
    const actorID = '123';
    const addressID = 'client:1';
    const path = RelayQueryPath.getPath(
      RelayQueryPath.getPath(
        RelayQueryPath.create(query),
        getField(query, 'actor'),
        actorID
      ),
      getField(query, 'actor', 'address'),
      addressID
    );
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(address, addressID, path);
    const trackedChildren = tracker.getTrackedChildrenForID(addressID);
    expect(trackedChildren.length).toBe(0);
  });

  it('untracks all nodes for the given dataID', () => {
    const query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            address {
              city
            }
          }
        }
      }
    `);
    const actor = query.getFieldByStorageKey('actor');
    const actorID = '123';
    const path = RelayQueryPath.getPath(
      RelayQueryPath.create(query),
      getField(query, 'actor'),
      actorID
    );
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(actor, actorID, path);
    expect(tracker.getTrackedChildrenForID(actorID)).not.toEqual([]);
    tracker.untrackNodesForID(actorID);
    expect(tracker.getTrackedChildrenForID(actorID)).toEqual([]);
  });
});

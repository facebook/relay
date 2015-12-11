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

jest.dontMock('RelayQueryTracker');

const Relay = require('Relay');
const RelayQueryPath = require('RelayQueryPath');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

const invariant = require('invariant');

describe('RelayQueryTracker', () => {
  var {getNode} = RelayTestUtils;

  function getField(node, ...fieldNames) {
    for (var ii = 0; ii < fieldNames.length; ii++) {
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
      var aKey = a.getSerializationKey();
      var bKey = b.getSerializationKey();
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
    var query = getNode(Relay.QL`
      query {
        viewer {
          actor {
            id
          }
        }
      }
    `);
    var path = new RelayQueryPath(query);
    var tracker = new RelayQueryTracker();

    tracker.trackNodeForID(query, 'client:1', path);
    var trackedChildren = tracker.getTrackedChildrenForID('client:1');
    expect(trackedChildren.length).toBe(1);
    expect(trackedChildren[0])
      .toEqualQueryNode(query.getFieldByStorageKey('actor'));
  });

  it('tracks queries for refetchable root records', () => {
    var query = getNode(Relay.QL`
      query {
        node(id:"123") {
          address {
            city
          }
        }
      }
    `);
    var nodeID = '123';
    var path = new RelayQueryPath(query);
    var tracker = new RelayQueryTracker();

    tracker.trackNodeForID(query, nodeID, path);
    var trackedChildren = sortChildren(tracker.getTrackedChildrenForID(nodeID));
    var children = sortChildren(query.getChildren());
    expect(trackedChildren.length).toBe(3);
    children.forEach((child, ii) => {
      expect(trackedChildren[ii]).toEqualQueryNode(child);
    });
  });

  it('tracks queries for refetchable records (with IDs)', () => {
    var query = getNode(Relay.QL`
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
    var actor = query.getFieldByStorageKey('actor');
    var actorID = '123';
    var path = new RelayQueryPath(query)
      .getPath(getField(query, 'actor'), actorID);
    var tracker = new RelayQueryTracker();

    tracker.trackNodeForID(actor, actorID, path);
    var children = sortChildren(actor.getChildren());
    var trackedChildren =
      sortChildren(tracker.getTrackedChildrenForID(actorID));
    children.forEach((child, ii) => {
      expect(trackedChildren[ii]).toEqualQueryNode(child);
    });
  });

  it('does not track queries for non-refetchable records', () => {
    var query = getNode(Relay.QL`
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
    var address =
      query.getFieldByStorageKey('actor').getFieldByStorageKey('address');
    var actorID = '123';
    var addressID = 'client:1';
    var path = new RelayQueryPath(query)
      .getPath(getField(query, 'actor'), actorID)
      .getPath(getField(query, 'actor', 'address'), addressID);
    var tracker = new RelayQueryTracker();

    tracker.trackNodeForID(address, addressID, path);
    var trackedChildren = tracker.getTrackedChildrenForID(addressID);
    expect(trackedChildren.length).toBe(0);
  });

  it('untracks all nodes for the given dataID', () => {
    var query = getNode(Relay.QL`
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
    var actor = query.getFieldByStorageKey('actor');
    var actorID = '123';
    var path = new RelayQueryPath(query)
      .getPath(getField(query, 'actor'), actorID);
    var tracker = new RelayQueryTracker();

    tracker.trackNodeForID(actor, actorID, path);
    expect(tracker.getTrackedChildrenForID(actorID)).not.toEqual([]);
    tracker.untrackNodesForID(actorID);
    expect(tracker.getTrackedChildrenForID(actorID)).toEqual([]);
  });
});

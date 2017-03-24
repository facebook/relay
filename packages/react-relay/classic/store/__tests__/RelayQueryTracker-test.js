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

jest.unmock('RelayQueryTracker');

const Relay = require('Relay');
const RelayQuery = require('RelayQuery');
const RelayQueryTracker = require('RelayQueryTracker');
const RelayTestUtils = require('RelayTestUtils');

describe('RelayQueryTracker', () => {
  const {
    getNode,
    getVerbatimNode,
  } = RelayTestUtils;

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
    jest.resetModules();

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
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(query, 'client:1');
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
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(query, nodeID);
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
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(actor, actorID);
    const children = sortChildren(actor.getChildren());
    const trackedChildren =
      sortChildren(tracker.getTrackedChildrenForID(actorID));
    children.forEach((child, ii) => {
      expect(trackedChildren[ii]).toEqualQueryNode(child);
    });
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
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(actor, actorID);
    expect(tracker.getTrackedChildrenForID(actorID)).not.toEqual([]);
    tracker.untrackNodesForID(actorID);
    expect(tracker.getTrackedChildrenForID(actorID)).toEqual([]);
  });

  it('flattens tracked fields when there exist multiple nodes', () => {
    const firstQuery = getVerbatimNode(Relay.QL`
      query {
        viewer {
          actor {
            id
            __typename
            ... on Node {
              __typename
            }
            ... on User {
              id
            }
          }
        }
      }
    `);
    const secondQuery = getVerbatimNode(Relay.QL`
      query {
        viewer {
          actor {
            id
            __typename
            ... on Node {
              id
            }
            ... on User {
              __typename
            }
          }
        }
      }
    `);
    const firstActor = firstQuery.getFieldByStorageKey('actor');
    const secondActor = secondQuery.getFieldByStorageKey('actor');
    const actorID = '123';
    const tracker = new RelayQueryTracker();

    tracker.trackNodeForID(firstActor, actorID);
    tracker.trackNodeForID(secondActor, actorID);
    const trackedChildren = tracker.getTrackedChildrenForID(actorID);
    expect(trackedChildren.length).toBe(3);
    expect(trackedChildren[0]).toEqualQueryNode(RelayQuery.Field.build({
      fieldName: 'id',
      type: 'ID',
    }));
    expect(trackedChildren[1]).toEqualQueryNode(RelayQuery.Field.build({
      fieldName: '__typename',
      type: 'String',
    }));
    expect(trackedChildren[2]).toEqualQueryNode(RelayQuery.Fragment.build(
      'User',
      'User',
      [
        RelayQuery.Field.build({
          fieldName: '__typename',
          type: 'String',
        }),
        RelayQuery.Field.build({
          fieldName: 'id',
          type: 'ID',
        }),
      ]
    ));
  });
});

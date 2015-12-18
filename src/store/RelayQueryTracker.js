/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryTracker
 * @flow
 * @typechecks
 */

'use strict';

const GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
import type {DataID} from 'RelayInternalTypes';
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
import type RelayQueryPath from 'RelayQueryPath';

const invariant = require('invariant');

const TYPE = '__type__';

class RelayQueryTracker {
  _trackedNodesByID: {[key: string]: {
    isMerged: boolean;
    trackedNodes: Array<RelayQuery.Node>;
  }};

  constructor() {
    this._trackedNodesByID = {};
  }

  trackNodeForID(
    node: RelayQuery.Node,
    dataID: DataID,
    path: ?RelayQueryPath
  ): void {
    // Non-refetchable nodes are tracked via their nearest-refetchable parent
    // (except for root call nodes)
    if (GraphQLStoreDataHandler.isClientID(dataID)) {
      invariant(
        path,
        'RelayQueryTracker.trackNodeForID(): Expected `path` for client ID, ' +
        '`%s`.',
        dataID
      );
      if (!path.isRootPath()) {
        return;
      }
    }
    // Don't track `__type__` fields
    if (node instanceof RelayQuery.Field && node.getSchemaName() === TYPE) {
      return;
    }

    this._trackedNodesByID[dataID] = this._trackedNodesByID[dataID] || {
      trackedNodes: [],
      isMerged: false,
    };
    this._trackedNodesByID[dataID].trackedNodes.push(node);
    this._trackedNodesByID[dataID].isMerged = false;
  }

  /**
   * Get the children that are tracked for the given `dataID`, if any.
   */
  getTrackedChildrenForID(
    dataID: DataID
  ): Array<RelayQuery.Node> {
    const trackedNodesByID = this._trackedNodesByID[dataID];
    if (!trackedNodesByID) {
      return [];
    }
    const {isMerged, trackedNodes} = trackedNodesByID;
    if (!isMerged) {
      const trackedChildren = [];
      trackedNodes.forEach(trackedQuery => {
        trackedChildren.push(...trackedQuery.getChildren());
      });
      trackedNodes.length = 0;
      trackedNodesByID.isMerged = true;
      const containerNode = RelayQuery.Fragment.build(
        'RelayQueryTracker',
        RelayNodeInterface.NODE_TYPE,
        trackedChildren
      );
      if (containerNode) {
        trackedNodes.push(containerNode);
      }
    }
    const trackedNode = trackedNodes[0];
    if (trackedNode) {
      return trackedNode.getChildren();
    }
    return [];
  }

  /**
   * Removes all nodes that are tracking the given DataID from the
   * query-tracker.
   */
  untrackNodesForID(
    dataID: DataID
  ): void {
    delete this._trackedNodesByID[dataID];
  }
}

module.exports = RelayQueryTracker;

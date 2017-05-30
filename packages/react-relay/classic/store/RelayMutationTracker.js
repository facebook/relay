/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationTracker
 * @flow
 * @format
 */

'use strict';

const RelayRecord = require('RelayRecord');

import type {DataID, ClientMutationID} from 'RelayInternalTypes';

// Maintains a map from the client id to the server id of
// optimistically added nodes
const clientIDToServerIDMap = {};

// For node-create mutations, maintains an index of the mutation to the
// client ID of an optimistically created node (if it exists).
const mutationIDToClientNodeIDMap = {};

// For mutations that have errors, maintains a two-directional index of the
// mutation and node with an error.
const clientMutationIDToErrorNodeID = {};
const clientNodeIDToErrorMutationID = {};

/**
 * @internal
 *
 * Records the client ID and error status of mutations as well as maintaining
 * a mapping of optimistic client IDs to server IDs.
 */
const RelayMutationTracker = {
  /**
  * Checks if the given id represents an object only known on the client side
  * or not. In this case, it is both a client id and does not have a
  * corresponding mapping in the client server id map.
  */
  isClientOnlyID: function(dataID: DataID): boolean {
    return RelayRecord.isClientID(dataID) && !clientIDToServerIDMap[dataID];
  },

  /**
   * Updates the map from the client id to the server id for optimistically
   * added nodes.
   */
  updateClientServerIDMap: function(clientID: DataID, serverID: DataID): void {
    clientIDToServerIDMap[clientID] = serverID;
  },

  /**
   * Gets the serverID (if one exists) for a given clientID
   */
  getServerIDForClientID: function(clientID: DataID): ?DataID {
    return clientIDToServerIDMap[clientID] || null;
  },

  /**
   * Record the root node ID associated with the mutation.
   */
  putClientIDForMutation: function(
    clientID: DataID,
    clientMutationID: ClientMutationID,
  ): void {
    mutationIDToClientNodeIDMap[clientMutationID] = clientID;

    // if an error exists for this mutation ID, remove the error on the previous
    // client ID and 'move' the error on the new client ID
    const errorNodeID = RelayMutationTracker.getErrorNodeForMutation(
      clientMutationID,
    );
    if (errorNodeID) {
      RelayMutationTracker.deleteMutationForErrorNode(errorNodeID);
      RelayMutationTracker.putErrorNodeForMutation(clientID, clientMutationID);
    }
  },

  /**
   * Get the root record ID associated with the muation.
   */
  getClientIDForMutation: function(
    clientMutationID: ClientMutationID,
  ): ?string {
    return mutationIDToClientNodeIDMap[clientMutationID];
  },

  /**
   * Delete the root record ID associated with the mutation.
   */
  deleteClientIDForMutation: function(
    clientMutationID: ClientMutationID,
  ): void {
    delete mutationIDToClientNodeIDMap[clientMutationID];
  },

  /**
   * Record that an error occurred while creating the given (client) record ID.
   */
  putErrorNodeForMutation: function(
    clientID: DataID,
    clientMutationID: ClientMutationID,
  ): void {
    clientNodeIDToErrorMutationID[clientID] = clientMutationID;
    clientMutationIDToErrorNodeID[clientMutationID] = clientID;
  },

  /**
   * Find the failed mutation that created the given (client) record ID,
   * if any.
   */
  getMutationForErrorNode: function(clientID: DataID): ?ClientMutationID {
    return clientNodeIDToErrorMutationID[clientID];
  },

  /**
   * Find the (client) ID of the record associated with the given mutation,
   * if any.
   */
  getErrorNodeForMutation: function(
    clientMutationID: ClientMutationID,
  ): ?DataID {
    return clientMutationIDToErrorNodeID[clientMutationID];
  },

  deleteMutationForErrorNode: function(clientID: DataID): void {
    delete clientNodeIDToErrorMutationID[clientID];
  },

  deleteErrorNodeForMutation: function(
    clientMutationID: ClientMutationID,
  ): void {
    delete clientMutationIDToErrorNodeID[clientMutationID];
  },
};

module.exports = RelayMutationTracker;

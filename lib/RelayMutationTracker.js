/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayMutationTracker
 * 
 * @typechecks
 */

// Maintains a map from the client id to the server id of
// optimistically added nodes
'use strict';

var RelayRecord = require('./RelayRecord');

var clientIDToServerIDMap = {};

// For node-create mutations, maintains an index of the mutation to the
// client ID of an optimistically created node (if it exists).
var mutationIDToClientNodeIDMap = {};

// For mutations that have errors, maintains a two-directional index of the
// mutation and node with an error.
var clientMutationIDToErrorNodeID = {};
var clientNodeIDToErrorMutationID = {};

/**
 * @internal
 *
 * Records the client ID and error status of mutations as well as maintaining
 * a mapping of optimistic client IDs to server IDs.
 */
var RelayMutationTracker = {

  /**
   * Checks if the given id represents an object only known on the client side
   * or not. In this case, it is both a client id and does not have a
   * corresponding mapping in the client server id map.
   */
  isClientOnlyID: function isClientOnlyID(dataID) {
    return RelayRecord.isClientID(dataID) && !clientIDToServerIDMap[dataID];
  },

  /**
   * Updates the map from the client id to the server id for optimistically
   * added nodes.
   */
  updateClientServerIDMap: function updateClientServerIDMap(clientID, serverID) {
    clientIDToServerIDMap[clientID] = serverID;
  },

  /**
   * Gets the serverID (if one exists) for a given clientID
   */
  getServerIDForClientID: function getServerIDForClientID(clientID) {
    return clientIDToServerIDMap[clientID] || null;
  },

  /**
   * Record the root node ID associated with the mutation.
   */
  putClientIDForMutation: function putClientIDForMutation(clientID, clientMutationID) {
    mutationIDToClientNodeIDMap[clientMutationID] = clientID;

    // if an error exists for this mutation ID, remove the error on the previous
    // client ID and 'move' the error on the new client ID
    var errorNodeID = RelayMutationTracker.getErrorNodeForMutation(clientMutationID);
    if (errorNodeID) {
      RelayMutationTracker.deleteMutationForErrorNode(errorNodeID);
      RelayMutationTracker.putErrorNodeForMutation(clientID, clientMutationID);
    }
  },

  /**
   * Get the root record ID associated with the muation.
   */
  getClientIDForMutation: function getClientIDForMutation(clientMutationID) {
    return mutationIDToClientNodeIDMap[clientMutationID];
  },

  /**
   * Delete the root record ID associated with the mutation.
   */
  deleteClientIDForMutation: function deleteClientIDForMutation(clientMutationID) {
    delete mutationIDToClientNodeIDMap[clientMutationID];
  },

  /**
   * Record that an error occurred while creating the given (client) record ID.
   */
  putErrorNodeForMutation: function putErrorNodeForMutation(clientID, clientMutationID) {
    clientNodeIDToErrorMutationID[clientID] = clientMutationID;
    clientMutationIDToErrorNodeID[clientMutationID] = clientID;
  },

  /**
   * Find the failed mutation that created the given (client) record ID,
   * if any.
   */
  getMutationForErrorNode: function getMutationForErrorNode(clientID) {
    return clientNodeIDToErrorMutationID[clientID];
  },

  /**
   * Find the (client) ID of the record associated with the given mutation,
   * if any.
   */
  getErrorNodeForMutation: function getErrorNodeForMutation(clientMutationID) {
    return clientMutationIDToErrorNodeID[clientMutationID];
  },

  deleteMutationForErrorNode: function deleteMutationForErrorNode(clientID) {
    delete clientNodeIDToErrorMutationID[clientID];
  },

  deleteErrorNodeForMutation: function deleteErrorNodeForMutation(clientMutationID) {
    delete clientMutationIDToErrorNodeID[clientMutationID];
  }
};

module.exports = RelayMutationTracker;
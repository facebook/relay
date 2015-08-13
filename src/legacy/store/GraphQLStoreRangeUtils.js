/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLStoreRangeUtils
 * @typechecks
 */

'use strict';

var callsFromGraphQL = require('callsFromGraphQL');
var printRelayQueryCall = require('printRelayQueryCall');

var rangeData = {};

/**
 * Utilities used by GraphQLStore for storing ranges
 *
 * GraphQLStore stores all of the parts of a range in a single GraphQLRange
 * object. For example, `node(4808495){friends.first(5){id,name}}` might be
 * stored similar to this (pseudo-code):
 *
 *   "4808495": {
 *     "friends": { __dataID__: "client:1" }
 *   },
 *   "client:1": {
 *     "nodes": new GraphQLRange(...) // all friends, not just the first 5
 *   }
 *
 * and when that query is run, the store would return a result pointing at
 * a specific part of the range, encoded into the data ID:
 *
 * {
 *   "4808495": {
 *     "friends": { __dataID__: "client:1_first(5)" }
 *   }
 * }
 *
 * That "client:1_first(5)" ID can then be used to query for the first 5
 * friends.
 *
 * @internal
 */
var GraphQLStoreRangeUtils = {

  /**
   * Returns a token that can be parsed using parseRangeClientID to recover
   * the attributes needed to retrieve the corresponding items from a
   * GraphQLRange.
   *
   * @param {array<GraphQLCallvNode>} calls
   * @param {object} callValues
   * @param {string} dataID
   * @return {string}
   */
  getClientIDForRangeWithID: function(calls, callValues, dataID) {
    var callsAsString = callsFromGraphQL(calls, callValues)
      .map(call => printRelayQueryCall(call).substring(1))
      .join(',');
    var key = dataID + '_' + callsAsString;
    var edge = rangeData[key];
    if (!edge) {
      rangeData[key] = {
        dataID: dataID,
        calls: calls,
        callValues: callValues,
      };
    }
    return key;
  },

  /**
   * Parses an ID back into its data ID and calls
   *
   * @param {string} rangeSpecificClientID
   * @return {?object}
   */
  parseRangeClientID: function(rangeSpecificClientID) {
    return rangeData[rangeSpecificClientID] || null;
  },

  /**
   * If given the client id for a range view, returns the canonical client id
   * for the entire range. e.g. converts "client:1_first(5)" to "client:1".
   * Otherwise returns the input.
   *
   * @param {string} dataID
   * @return {string}
   */
  getCanonicalClientID: function(dataID) {
    return rangeData[dataID] ? rangeData[dataID].dataID : dataID;
  },
};

module.exports = GraphQLStoreRangeUtils;

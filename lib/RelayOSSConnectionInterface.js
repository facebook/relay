/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOSSConnectionInterface
 * @typechecks
 * 
 */

'use strict';

var _defineProperty = require('babel-runtime/helpers/define-property')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});

var CLIENT_MUTATION_ID = 'clientMutationId';
var CONNECTION_CALLS = {
  'after': true,
  'before': true,
  'find': true,
  'first': true,
  'last': true,
  'surrounds': true
};
var CURSOR = 'cursor';
var EDGES = 'edges';
var END_CURSOR = 'endCursor';
var HAS_NEXT_PAGE = 'hasNextPage';
var HAS_PREV_PAGE = 'hasPreviousPage';
var NODE = 'node';
var PAGE_INFO = 'pageInfo';
var REQUIRED_RANGE_CALLS = {
  'find': true,
  'first': true,
  'last': true
};
var START_CURSOR = 'startCursor';

/**
 * @internal
 *
 * Defines logic relevant to the informal "Connection" GraphQL interface.
 */
var RelayOSSConnectionInterface = {
  CLIENT_MUTATION_ID: CLIENT_MUTATION_ID,
  CURSOR: CURSOR,
  EDGES: EDGES,
  END_CURSOR: END_CURSOR,
  HAS_NEXT_PAGE: HAS_NEXT_PAGE,
  HAS_PREV_PAGE: HAS_PREV_PAGE,
  NODE: NODE,
  PAGE_INFO: PAGE_INFO,
  START_CURSOR: START_CURSOR,

  /**
   * Whether `edges` fields are expected to have `source` fields.
   */
  EDGES_HAVE_SOURCE_FIELD: false,

  /**
   * Checks whether a call exists strictly to encode which parts of a connection
   * to fetch. Fields that only differ by connection call values should have the
   * same identity.
   */
  isConnectionCall: function isConnectionCall(call) {
    return CONNECTION_CALLS.hasOwnProperty(call.name);
  },

  /**
   * Checks whether a set of calls on a connection supply enough information to
   * fetch the range fields (i.e. `edges` and `page_info`).
   */
  hasRangeCalls: function hasRangeCalls(calls) {
    return calls.some(function (call) {
      return REQUIRED_RANGE_CALLS.hasOwnProperty(call.name);
    });
  },

  /**
   * Gets a default record representing a connection's `PAGE_INFO`.
   */
  getDefaultPageInfo: function getDefaultPageInfo() {
    var _ref;

    return _ref = {}, _defineProperty(_ref, END_CURSOR, undefined), _defineProperty(_ref, HAS_NEXT_PAGE, false), _defineProperty(_ref, HAS_PREV_PAGE, false), _defineProperty(_ref, START_CURSOR, undefined), _ref;
  }
};

module.exports = RelayOSSConnectionInterface;
/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayFBConnectionInterface
 * @typechecks
 * @flow
 */

'use strict';

import type {Call} from 'RelayInternalTypes';

var CONNECTION_CALLS = {
  'after': true,
  'before': true,
  'find': true,
  'first': true,
  'last': true,
  'surrounds': true,
};
var REQUIRED_RANGE_CALLS = {
  'find': true,
  'first': true,
  'last': true,
};

/**
 * @internal
 *
 * Defines logic relevant to the informal "Connection" GraphQL interface.
 */
var RelayFBConnectionInterface = {
  CLIENT_MUTATION_ID: 'client_mutation_id',
  CURSOR: 'cursor',
  EDGES: 'edges',
  END_CURSOR: 'end_cursor',
  HAS_NEXT_PAGE: 'has_next_page',
  HAS_PREV_PAGE: 'has_previous_page',
  NODE: 'node',
  PAGE_INFO: 'page_info',
  START_CURSOR: 'start_cursor',

  /**
   * Whether `edges` fields are expected to have `source` fields.
   */
  EDGES_HAVE_SOURCE_FIELD: true,

  /**
   * Checks whether a call exists strictly to encode which parts of a connection
   * to fetch. Fields that only differ by connection call values should have the
   * same identity.
   */
  isConnectionCall(call: Call): boolean {
    return CONNECTION_CALLS.hasOwnProperty(call.name);
  },

  /**
   * Checks whether a set of calls on a connection supply enough information to
   * fetch the range fields (i.e. `edges` and `page_info`).
   */
  hasRangeCalls(calls: Array<Call>): boolean {
    return calls.some(call => REQUIRED_RANGE_CALLS.hasOwnProperty(call.name));
  },

  /**
   * Gets a default record representing a connection's `PAGE_INFO`.
   */
  getDefaultPageInfo(): {[key: string]: mixed} {
    var pageInfo = {};
    pageInfo[RelayFBConnectionInterface.START_CURSOR] = undefined;
    pageInfo[RelayFBConnectionInterface.END_CURSOR] = undefined;
    pageInfo[RelayFBConnectionInterface.HAS_NEXT_PAGE] = false;
    pageInfo[RelayFBConnectionInterface.HAS_PREV_PAGE] = false;

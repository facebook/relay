/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOSSConnectionInterface
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
var RelayOSSConnectionInterface = {
  CLIENT_MUTATION_ID: 'clientMutationId',
  CURSOR: 'cursor',
  EDGES: 'edges',
  END_CURSOR: 'endCursor',
  HAS_NEXT_PAGE: 'hasNextPage',
  HAS_PREV_PAGE: 'hasPreviousPage',
  NODE: 'node',
  PAGE_INFO: 'pageInfo',
  START_CURSOR: 'startCursor',

  /**
   * Whether `edges` fields are expected to have `source` fields.
   */
  EDGES_HAVE_SOURCE_FIELD: false,

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
    pageInfo[RelayOSSConnectionInterface.START_CURSOR] = undefined;
    pageInfo[RelayOSSConnectionInterface.END_CURSOR] = undefined;
    pageInfo[RelayOSSConnectionInterface.HAS_NEXT_PAGE] = false;
    pageInfo[RelayOSSConnectionInterface.HAS_PREV_PAGE] = false;
    return pageInfo;
  },
};

module.exports = RelayOSSConnectionInterface;

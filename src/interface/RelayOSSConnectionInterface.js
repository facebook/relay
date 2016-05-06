/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayOSSConnectionInterface
 * @flow
 */

'use strict';

import type {Call} from 'RelayInternalTypes';
import type {Record} from 'RelayRecord';

export type EdgeRecord = Record & {
  cursor: mixed;
  node: Record;
};
export type PageInfo = {
  endCursor: ?string;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  startCursor: ?string;
};

const CLIENT_MUTATION_ID = 'clientMutationId';
const CONNECTION_CALLS = {
  'after': true,
  'before': true,
  'find': true,
  'first': true,
  'last': true,
  'surrounds': true,
};
const CURSOR = 'cursor';
const EDGES = 'edges';
const END_CURSOR = 'endCursor';
const HAS_NEXT_PAGE = 'hasNextPage';
const HAS_PREV_PAGE = 'hasPreviousPage';
const NODE = 'node';
const PAGE_INFO = 'pageInfo';
const REQUIRED_RANGE_CALLS = {
  'find': true,
  'first': true,
  'last': true,
};
const START_CURSOR = 'startCursor';

/**
 * @internal
 *
 * Defines logic relevant to the informal "Connection" GraphQL interface.
 */
const RelayOSSConnectionInterface = {
  CLIENT_MUTATION_ID,
  CURSOR,
  EDGES,
  END_CURSOR,
  HAS_NEXT_PAGE,
  HAS_PREV_PAGE,
  NODE,
  PAGE_INFO,
  START_CURSOR,

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
  getDefaultPageInfo(): PageInfo {
    return {
      [END_CURSOR]: undefined,
      [HAS_NEXT_PAGE]: false,
      [HAS_PREV_PAGE]: false,
      [START_CURSOR]: undefined,
    };
  },
};

module.exports = RelayOSSConnectionInterface;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {Record} from 'react-relay/classic/store/RelayRecord';
import type {Call} from 'react-relay/classic/tools/RelayInternalTypes';

export type EdgeRecord = Record & {
  cursor: mixed,
  node: Record,
};
export type PageInfo = {
  endCursor: ?string,
  hasNextPage: boolean,
  hasPreviousPage: boolean,
  startCursor: ?string,
};

const CONNECTION_CALLS = {
  after: true,
  before: true,
  find: true,
  first: true,
  last: true,
  surrounds: true,
};

const REQUIRED_RANGE_CALLS = {
  find: true,
  first: true,
  last: true,
};

let config = {
  CLIENT_MUTATION_ID: 'clientMutationId',
  CURSOR: 'cursor',
  /**
   * Whether `edges` fields are expected to have `source` fields.
   */
  EDGES_HAVE_SOURCE_FIELD: false,
  EDGES: 'edges',
  END_CURSOR: 'endCursor',
  HAS_NEXT_PAGE: 'hasNextPage',
  HAS_PREV_PAGE: 'hasPreviousPage',
  NODE: 'node',
  PAGE_INFO_TYPE: 'PageInfo',
  PAGE_INFO: 'pageInfo',
  START_CURSOR: 'startCursor',
};

/**
 * @internal
 *
 * Defines logic relevant to the informal "Connection" GraphQL interface.
 */
const RelayConnectionInterface = {
  inject(newConfig: typeof config) {
    config = newConfig;
  },

  get(): typeof config {
    return config;
  },

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
      [config.END_CURSOR]: null,
      [config.HAS_NEXT_PAGE]: false,
      [config.HAS_PREV_PAGE]: false,
      [config.START_CURSOR]: null,
    };
  },
};

module.exports = RelayConnectionInterface;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

const GraphQLMutatorConstants = {
  // TODO(T24615823, jkassens) Remove in favor of RelayRuntime.RangeOperation
  APPEND: 'append',
  IGNORE: 'ignore',
  PREPEND: 'prepend',
  REFETCH: 'refetch',
  REMOVE: 'remove',
  RANGE_OPERATIONS: {
    append: true,
    ignore: true,
    prepend: true,
    refetch: true,
    remove: true,
  },

  NODE_DELETE_HANDLER: 'node_delete',
  RANGE_ADD_HANDLER: 'range_add',
  RANGE_DELETE_HANDLER: 'range_delete',
  HANDLER_TYPES: {
    node_delete: true,
    range_add: true,
    range_delete: true,
  },

  OPTIMISTIC_UPDATE: 'optimistic',
  SERVER_UPDATE: 'server',
  POLLER_UPDATE: 'poller',
  UPDATE_TYPES: {
    optimistic: true,
    server: true,
    poller: true,
  },
};

module.exports = GraphQLMutatorConstants;

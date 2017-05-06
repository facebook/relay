/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GraphQLMutatorConstants
 * @format
 */

'use strict';

const GraphQLMutatorConstants = {
  APPEND: 'append',
  IGNORE: 'ignore',
  PREPEND: 'prepend',
  REFETCH: 'refetch',
  REMOVE: 'remove',

  NODE_DELETE_HANDLER: 'node_delete',
  RANGE_ADD_HANDLER: 'range_add',
  RANGE_DELETE_HANDLER: 'range_delete',

  HANDLER_TYPES: {},

  OPTIMISTIC_UPDATE: 'optimistic',
  SERVER_UPDATE: 'server',
  POLLER_UPDATE: 'poller',

  UPDATE_TYPES: {},

  RANGE_OPERATIONS: {},
};

GraphQLMutatorConstants.HANDLER_TYPES[
  GraphQLMutatorConstants.NODE_DELETE_HANDLER
] = true;
GraphQLMutatorConstants.HANDLER_TYPES[
  GraphQLMutatorConstants.RANGE_ADD_HANDLER
] = true;
GraphQLMutatorConstants.HANDLER_TYPES[
  GraphQLMutatorConstants.RANGE_DELETE_HANDLER
] = true;

GraphQLMutatorConstants.UPDATE_TYPES[
  GraphQLMutatorConstants.OPTIMISTIC_UPDATE
] = true;
GraphQLMutatorConstants.UPDATE_TYPES[
  GraphQLMutatorConstants.SERVER_UPDATE
] = true;
GraphQLMutatorConstants.UPDATE_TYPES[
  GraphQLMutatorConstants.POLLER_UPDATE
] = true;

GraphQLMutatorConstants.RANGE_OPERATIONS[GraphQLMutatorConstants.APPEND] = true;
GraphQLMutatorConstants.RANGE_OPERATIONS[GraphQLMutatorConstants.IGNORE] = true;
GraphQLMutatorConstants.RANGE_OPERATIONS[
  GraphQLMutatorConstants.PREPEND
] = true;
GraphQLMutatorConstants.RANGE_OPERATIONS[
  GraphQLMutatorConstants.REFETCH
] = true;
GraphQLMutatorConstants.RANGE_OPERATIONS[GraphQLMutatorConstants.REMOVE] = true;

module.exports = GraphQLMutatorConstants;

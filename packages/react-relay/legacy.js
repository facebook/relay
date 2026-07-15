/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

/* eslint relay-internal/esm-compatible-cjs: error */

const ReactRelayContext = require('./ReactRelayContext');
const ReactRelayFragmentContainer = require('./ReactRelayFragmentContainer');
const ReactRelayLocalQueryRenderer = require('./ReactRelayLocalQueryRenderer');
const ReactRelayPaginationContainer = require('./ReactRelayPaginationContainer');
const ReactRelayQueryRenderer = require('./ReactRelayQueryRenderer');
const ReactRelayRefetchContainer = require('./ReactRelayRefetchContainer');
const RelayRuntime = require('relay-runtime');

export type {
  $FragmentRef,
  $RelayProps,
  RelayFragmentContainer,
  RelayPaginationContainer,
  RelayPaginationProp,
  RelayProp,
  RelayRefetchContainer,
  RelayRefetchProp,
} from './ReactRelayTypes';
export type {
  DataID,
  DeclarativeMutationConfig,
  Disposable,
  // RelayRuntime has two environment exports: one interface, one concrete.
  IEnvironment as Environment,
  GraphQLTaggedNode,
  MutationType,
  NormalizationSelector,
  OperationDescriptor,
  RangeOperation,
  ReaderSelector,
  RelayContext,
  Snapshot,
  Variables,
  FetchPolicy,
} from 'relay-runtime';

const {
  ConnectionHandler,
  MutationTypes,
  RangeOperations,
  applyOptimisticMutation,
  commitLocalUpdate,
  commitMutation,
  fetchQuery_DEPRECATED,
  graphql,
  readInlineData,
  requestSubscription,
} = RelayRuntime;

const createFragmentContainer = ReactRelayFragmentContainer.createContainer;
const createPaginationContainer = ReactRelayPaginationContainer.createContainer;
const createRefetchContainer = ReactRelayRefetchContainer.createContainer;

/**
 * Legacy react-relay exports.
 * Should prefer using interface defined in ./hooks.js
 */
module.exports = {
  ConnectionHandler,
  QueryRenderer: ReactRelayQueryRenderer,
  LocalQueryRenderer: ReactRelayLocalQueryRenderer,

  MutationTypes,
  RangeOperations,

  ReactRelayContext,

  applyOptimisticMutation,
  commitLocalUpdate,
  commitMutation,
  createFragmentContainer,
  createPaginationContainer,
  createRefetchContainer,
  fetchQuery_DEPRECATED,
  graphql,
  readInlineData,
  requestSubscription,
};

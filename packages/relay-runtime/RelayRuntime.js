/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayRuntime
 * @flow
 * @format
 */

'use strict';

const RelayConnectionHandler = require('RelayConnectionHandler');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayCore = require('RelayCore');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayModernGraphQLTag = require('RelayModernGraphQLTag');
const RelayNetwork = require('RelayNetwork');
const RelayObservable = require('RelayObservable');
const RelayQueryResponseCache = require('RelayQueryResponseCache');
const RelayViewerHandler = require('RelayViewerHandler');

const applyRelayModernOptimisticMutation = require('applyRelayModernOptimisticMutation');
const commitLocalUpdate = require('commitLocalUpdate');
const commitRelayModernMutation = require('commitRelayModernMutation');
const fetchRelayModernQuery = require('fetchRelayModernQuery');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const requestRelaySubscription = require('requestRelaySubscription');

// There's a lint false positive for opaque types
// eslint-disable-next-line no-undef
export opaque type FragmentReference<T> = mixed;

export type {
  GeneratedNode,
  ConcreteBatch,
  ConcreteFragment,
} from 'RelayConcreteNode';
export type {
  ObservableFromValue,
  Subscribable,
  Subscription,
} from 'RelayObservable';

// As early as possible, check for the existence of the JavaScript globals which
// Relay Runtime relies upon, and produce a clear message if they do not exist.
if (__DEV__) {
  if (
    typeof Map !== 'function' ||
    typeof Set !== 'function' ||
    typeof Promise !== 'function' ||
    typeof Object.assign !== 'function'
  ) {
    throw new Error(
      'relay-runtime requires Map, Set, Promise, and Object.assign to exist. ' +
        'Use a polyfill to provide these for older browsers.',
    );
  }
}

/**
 * The public interface to Relay Runtime.
 */
module.exports = {
  // Core API
  Environment: RelayModernEnvironment,
  Network: RelayNetwork,
  Observable: RelayObservable,
  QueryResponseCache: RelayQueryResponseCache,
  RecordSource: RelayInMemoryRecordSource,
  Store: RelayMarkSweepStore,

  areEqualSelectors: RelayCore.areEqualSelectors,
  createFragmentSpecResolver: RelayCore.createFragmentSpecResolver,
  createOperationSelector: RelayCore.createOperationSelector,
  getDataIDsFromObject: RelayCore.getDataIDsFromObject,
  getFragment: RelayModernGraphQLTag.getFragment,
  getOperation: RelayModernGraphQLTag.getOperation,
  getSelector: RelayCore.getSelector,
  getSelectorList: RelayCore.getSelectorList,
  getSelectorsFromObject: RelayCore.getSelectorsFromObject,
  getVariablesFromObject: RelayCore.getVariablesFromObject,
  graphql: RelayModernGraphQLTag.graphql,

  // Extensions
  ConnectionHandler: RelayConnectionHandler,
  ViewerHandler: RelayViewerHandler,

  // Helpers (can be implemented via the above API)
  applyOptimisticMutation: applyRelayModernOptimisticMutation,
  commitLocalUpdate: commitLocalUpdate,
  commitMutation: commitRelayModernMutation,
  fetchQuery: fetchRelayModernQuery,
  isRelayModernEnvironment: isRelayModernEnvironment,
  requestSubscription: requestRelaySubscription,

  // Configuration interface for legacy or special uses
  ConnectionInterface: RelayConnectionInterface,
};

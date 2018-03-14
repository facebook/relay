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

const RelayConcreteNode = require('RelayConcreteNode');
const RelayConnectionHandler = require('RelayConnectionHandler');
const RelayConnectionInterface = require('RelayConnectionInterface');
const RelayCore = require('RelayCore');
const RelayDeclarativeMutationConfig = require('RelayDeclarativeMutationConfig');
const RelayInMemoryRecordSource = require('RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('RelayMarkSweepStore');
const RelayModernEnvironment = require('RelayModernEnvironment');
const RelayModernGraphQLTag = require('RelayModernGraphQLTag');
const RelayNetwork = require('RelayNetwork');
const RelayObservable = require('RelayObservable');
const RelayProfiler = require('RelayProfiler');
const RelayQueryResponseCache = require('RelayQueryResponseCache');
const RelayStoreUtils = require('RelayStoreUtils');
const RelayViewerHandler = require('RelayViewerHandler');

const applyRelayModernOptimisticMutation = require('applyRelayModernOptimisticMutation');
const commitLocalUpdate = require('commitLocalUpdate');
const commitRelayModernMutation = require('commitRelayModernMutation');
const fetchRelayModernQuery = require('fetchRelayModernQuery');
const isRelayModernEnvironment = require('isRelayModernEnvironment');
const recycleNodesInto = require('recycleNodesInto');
const requestRelaySubscription = require('requestRelaySubscription');
const simpleClone = require('simpleClone');

export type {
  CacheConfig,
  DataID,
  Disposable,
  RerunParam,
  Variables,
} from './util/RelayRuntimeTypes';
export type {
  GeneratedNode,
  ConcreteRequest,
  ConcreteBatchRequest,
  ConcreteOperation,
  ConcreteFragment,
  RequestNode,
} from 'RelayConcreteNode';
export type {ConnectionMetadata} from 'RelayConnectionHandler';
export type {EdgeRecord, PageInfo} from 'RelayConnectionInterface';
export type {
  DeclarativeMutationConfig,
  MutationType,
  RangeOperation,
} from 'RelayDeclarativeMutationConfig';
export type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
export type {
  GraphQLResponse,
  PayloadError,
  UploadableMap,
} from 'RelayNetworkTypes';
export type {
  ObservableFromValue,
  Observer,
  Subscribable,
  Subscription,
} from 'RelayObservable';
export type {RecordState} from 'RelayRecordState';
export type {
  Environment as IEnvironment,
  FragmentMap,
  FragmentReference,
  OperationSelector,
  RelayContext,
  Selector,
  SelectorStoreUpdater,
  Snapshot,
} from 'RelayStoreTypes';
export type {
  OptimisticMutationConfig,
} from 'applyRelayModernOptimisticMutation';
export type {MutationConfig} from 'commitRelayModernMutation';

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
  getRequest: RelayModernGraphQLTag.getRequest,
  // TODO (T23201154) remove in a future Relay release.
  getOperation: function() {
    if (__DEV__) {
      require('warning')(false, 'getOperation() deprecated. Use getRequest().');
    }
    return RelayModernGraphQLTag.getRequest.apply(null, arguments);
  },
  getSelector: RelayCore.getSelector,
  getSelectorList: RelayCore.getSelectorList,
  getSelectorsFromObject: RelayCore.getSelectorsFromObject,
  getStorageKey: RelayStoreUtils.getStorageKey,
  getVariablesFromObject: RelayCore.getVariablesFromObject,
  graphql: RelayModernGraphQLTag.graphql,

  // Declarative mutation API
  MutationTypes: RelayDeclarativeMutationConfig.MutationTypes,
  RangeOperations: RelayDeclarativeMutationConfig.RangeOperations,

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

  // Utilities
  RelayProfiler: RelayProfiler,

  // TODO T22766889 remove cross-cell imports of internal modules
  // INTERNAL-ONLY: these WILL be removed from this API in the next release
  recycleNodesInto: recycleNodesInto,
  simpleClone: simpleClone,
  ROOT_ID: RelayStoreUtils.ROOT_ID,
  RelayConcreteNode: RelayConcreteNode,
};

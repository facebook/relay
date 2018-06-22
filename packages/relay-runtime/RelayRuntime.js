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

const RelayConcreteNode = require('./util/RelayConcreteNode');
const RelayConnectionHandler = require('./handlers/connection/RelayConnectionHandler');
const RelayConnectionInterface = require('./handlers/connection/RelayConnectionInterface');
const RelayCore = require('./store/RelayCore');
const RelayDeclarativeMutationConfig = require('./mutations/RelayDeclarativeMutationConfig');
const RelayDefaultHandleKey = require('./util/RelayDefaultHandleKey');
const RelayInMemoryRecordSource = require('./store/RelayInMemoryRecordSource');
const RelayMarkSweepStore = require('./store/RelayMarkSweepStore');
const RelayModernEnvironment = require('./store/RelayModernEnvironment');
const RelayModernGraphQLTag = require('./query/RelayModernGraphQLTag');
const RelayNetwork = require('./network/RelayNetwork');
const RelayObservable = require('./network/RelayObservable');
const RelayProfiler = require('./util/RelayProfiler');
const RelayQueryResponseCache = require('./network/RelayQueryResponseCache');
const RelayStoreUtils = require('./store/RelayStoreUtils');
const RelayViewerHandler = require('./handlers/viewer/RelayViewerHandler');

const applyRelayModernOptimisticMutation = require('./mutations/applyRelayModernOptimisticMutation');
const commitLocalUpdate = require('./mutations/commitLocalUpdate');
const commitRelayModernMutation = require('./mutations/commitRelayModernMutation');
const deepFreeze = require('./util/deepFreeze');
const fetchRelayModernQuery = require('./query/fetchRelayModernQuery');
const getRelayHandleKey = require('./util/getRelayHandleKey');
const isRelayModernEnvironment = require('./store/isRelayModernEnvironment');
const isScalarAndEqual = require('./util/isScalarAndEqual');
const recycleNodesInto = require('./util/recycleNodesInto');
const requestRelaySubscription = require('./subscription/requestRelaySubscription');
const simpleClone = require('./util/simpleClone');
const stableCopy = require('./util/stableCopy');

export type {
  ConnectionMetadata,
} from './handlers/connection/RelayConnectionHandler';
export type {
  EdgeRecord,
  PageInfo,
} from './handlers/connection/RelayConnectionInterface';
export type {
  DeclarativeMutationConfig,
  MutationType,
  RangeOperation,
} from './mutations/RelayDeclarativeMutationConfig';
export type {
  OptimisticMutationConfig,
} from './mutations/applyRelayModernOptimisticMutation';
export type {MutationConfig} from './mutations/commitRelayModernMutation';
export type {
  GraphQLResponse,
  PayloadError,
  UploadableMap,
} from './network/RelayNetworkTypes';
export type {
  ObservableFromValue,
  Observer,
  Subscribable,
  Subscription,
} from './network/RelayObservable';
export type {GraphQLTaggedNode} from './query/RelayModernGraphQLTag';
export type {RecordState} from './store/RelayRecordState';
export type {
  Environment as IEnvironment,
  FragmentMap,
  FragmentReference,
  OperationSelector,
  RelayContext,
  Selector,
  SelectorStoreUpdater,
  Snapshot,
} from './store/RelayStoreTypes';
export type {
  GraphQLSubscriptionConfig,
} from './subscription/requestRelaySubscription';
export type {
  GeneratedNode,
  ConcreteRequest,
  ConcreteBatchRequest,
  ConcreteOperation,
  ConcreteFragment,
  RequestNode,
} from './util/RelayConcreteNode';
export type {
  CacheConfig,
  DataID,
  Disposable,
  RerunParam,
  Variables,
} from './util/RelayRuntimeTypes';

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

  // INTERNAL-ONLY: These exports might be removed at any point.
  RelayConcreteNode: RelayConcreteNode,
  DEFAULT_HANDLE_KEY: RelayDefaultHandleKey.DEFAULT_HANDLE_KEY,
  ROOT_ID: RelayStoreUtils.ROOT_ID,

  deepFreeze: deepFreeze,
  getRelayHandleKey: getRelayHandleKey,
  isScalarAndEqual: isScalarAndEqual,
  recycleNodesInto: recycleNodesInto,
  simpleClone: simpleClone,
  stableCopy: stableCopy,
};

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

const RelayConcreteNode = require('./util/RelayConcreteNode');
const RelayConcreteVariables = require('./store/RelayConcreteVariables');
const RelayConnectionHandler = require('./handlers/connection/RelayConnectionHandler');
const RelayConnectionInterface = require('./handlers/connection/RelayConnectionInterface');
const RelayConnectionResolver = require('./store/RelayConnectionResolver');
const RelayDeclarativeMutationConfig = require('./mutations/RelayDeclarativeMutationConfig');
const RelayDefaultHandleKey = require('./util/RelayDefaultHandleKey');
const RelayDefaultHandlerProvider = require('./handlers/RelayDefaultHandlerProvider');
const RelayDefaultMissingFieldHandlers = require('./handlers/RelayDefaultMissingFieldHandlers');
const RelayError = require('./util/RelayError');
const RelayFeatureFlags = require('./util/RelayFeatureFlags');
const RelayModernEnvironment = require('./store/RelayModernEnvironment');
const RelayModernGraphQLTag = require('./query/RelayModernGraphQLTag');
const RelayModernOperationDescriptor = require('./store/RelayModernOperationDescriptor');
const RelayModernRecord = require('./store/RelayModernRecord');
const RelayModernSelector = require('./store/RelayModernSelector');
const RelayModernStore = require('./store/RelayModernStore');
const RelayNetwork = require('./network/RelayNetwork');
const RelayObservable = require('./network/RelayObservable');
const RelayOperationTracker = require('./store/RelayOperationTracker');
const RelayProfiler = require('./util/RelayProfiler');
const RelayQueryResponseCache = require('./network/RelayQueryResponseCache');
const RelayRecordSource = require('./store/RelayRecordSource');
const RelayReplaySubject = require('./util/RelayReplaySubject');
const RelayStoreUtils = require('./store/RelayStoreUtils');
const ViewerPattern = require('./store/ViewerPattern');

const applyOptimisticMutation = require('./mutations/applyOptimisticMutation');
const commitLocalUpdate = require('./mutations/commitLocalUpdate');
const commitMutation = require('./mutations/commitMutation');
const createFragmentSpecResolver = require('./store/createFragmentSpecResolver');
const createPayloadFor3DField = require('./util/createPayloadFor3DField');
const createRelayContext = require('./store/createRelayContext');
const deepFreeze = require('./util/deepFreeze');
const fetchQuery = require('./query/fetchQuery');
const fetchQueryInternal = require('./query/fetchQueryInternal');
const getFragmentIdentifier = require('./util/getFragmentIdentifier');
const getFragmentSpecIdentifier = require('./util/getFragmentSpecIdentifier');
const getRelayHandleKey = require('./util/getRelayHandleKey');
const getRequestIdentifier = require('./util/getRequestIdentifier');
const isPromise = require('./util/isPromise');
const isRelayModernEnvironment = require('./store/isRelayModernEnvironment');
const isScalarAndEqual = require('./util/isScalarAndEqual');
const readInlineData = require('./store/readInlineData');
const recycleNodesInto = require('./util/recycleNodesInto');
const requestSubscription = require('./subscription/requestSubscription');
const stableCopy = require('./util/stableCopy');

const {generateClientID, generateUniqueClientID} = require('./store/ClientID');

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
  RangeBehaviors,
  RangeOperation,
} from './mutations/RelayDeclarativeMutationConfig';
export type {
  OptimisticMutationConfig,
} from './mutations/applyOptimisticMutation';
export type {
  DEPRECATED_MutationConfig,
  MutationConfig,
  MutationParameters,
} from './mutations/commitMutation';
export type {
  ExecuteFunction,
  FetchFunction,
  GraphQLResponse,
  LogRequestInfoFunction,
  INetwork,
  PayloadData,
  PayloadError,
  SubscribeFunction,
  Uploadable,
  UploadableMap,
} from './network/RelayNetworkTypes';
export type {
  ObservableFromValue,
  Observer,
  Subscribable,
  Subscription,
} from './network/RelayObservable';
export type {GraphQLTaggedNode} from './query/RelayModernGraphQLTag';
export type {
  ConnectionEvent,
  ConnectionID,
  ConnectionReference,
  ConnectionReferenceObject,
  ConnectionResolver,
  ConnectionSnapshot,
} from './store/RelayConnection';
export type {ConnectionState} from './store/RelayConnectionResolver';
export type {TaskScheduler} from './store/RelayModernQueryExecutor';
export type {RecordState} from './store/RelayRecordState';
export type {
  FragmentMap,
  FragmentPointer,
  FragmentReference,
  FragmentSpecResolver,
  HandleFieldPayload,
  IEnvironment,
  LogEvent,
  LogFunction,
  MissingFieldHandler,
  ModuleImportPointer,
  NormalizationSelector,
  OperationDescriptor,
  OperationLoader,
  OperationTracker,
  OptimisticResponseConfig,
  OptimisticUpdate,
  OptimisticUpdateFunction,
  PluralReaderSelector,
  Props,
  PublishQueue,
  ReaderSelector,
  ReadOnlyRecordProxy,
  RecordProxy,
  RecordSourceProxy,
  RecordSourceSelectorProxy,
  RelayContext,
  RequestDescriptor,
  SelectorData,
  SelectorStoreUpdater,
  SingularReaderSelector,
  Snapshot,
  StoreUpdater,
} from './store/RelayStoreTypes';
export type {
  GraphQLSubscriptionConfig,
} from './subscription/requestSubscription';
export type {
  NormalizationArgument,
  NormalizationDefer,
  NormalizationConnection,
  NormalizationField,
  NormalizationLinkedField,
  NormalizationLinkedHandle,
  NormalizationLocalArgumentDefinition,
  NormalizationModuleImport,
  NormalizationScalarField,
  NormalizationSelection,
  NormalizationSplitOperation,
  NormalizationStream,
} from './util/NormalizationNode';
export type {NormalizationOperation} from './util/NormalizationNode';
export type {
  ReaderArgument,
  ReaderArgumentDefinition,
  ReaderConnection,
  ReaderField,
  ReaderFragment,
  ReaderInlineDataFragment,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderPaginationMetadata,
  ReaderRefetchableFragment,
  ReaderRefetchMetadata,
  ReaderScalarField,
  ReaderSelection,
} from './util/ReaderNode';
export type {
  ConcreteRequest,
  GeneratedNode,
  RequestParameters,
} from './util/RelayConcreteNode';
export type {
  CacheConfig,
  DataID,
  Disposable,
  OperationType,
  Variables,
} from './util/RelayRuntimeTypes';
export type {Local3DPayload} from './util/createPayloadFor3DField';

// As early as possible, check for the existence of the JavaScript globals which
// Relay Runtime relies upon, and produce a clear message if they do not exist.
if (__DEV__) {
  const mapStr = typeof Map !== 'function' ? 'Map' : null;
  const setStr = typeof Set !== 'function' ? 'Set' : null;
  const promiseStr = typeof Promise !== 'function' ? 'Promise' : null;
  const objStr = typeof Object.assign !== 'function' ? 'Object.assign' : null;
  if (mapStr || setStr || promiseStr || objStr) {
    throw new Error(
      `relay-runtime requires ${[mapStr, setStr, promiseStr, objStr]
        .filter(Boolean)
        .join(', and ')} to exist. ` +
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
  RecordSource: RelayRecordSource,
  Record: RelayModernRecord,
  ReplaySubject: RelayReplaySubject,
  Store: RelayModernStore,

  areEqualSelectors: RelayModernSelector.areEqualSelectors,
  createFragmentSpecResolver: createFragmentSpecResolver,
  createNormalizationSelector: RelayModernSelector.createNormalizationSelector,
  createOperationDescriptor:
    RelayModernOperationDescriptor.createOperationDescriptor,
  createReaderSelector: RelayModernSelector.createReaderSelector,
  createRequestDescriptor:
    RelayModernOperationDescriptor.createRequestDescriptor,
  getDataIDsFromFragment: RelayModernSelector.getDataIDsFromFragment,
  getDataIDsFromObject: RelayModernSelector.getDataIDsFromObject,
  getFragment: RelayModernGraphQLTag.getFragment,
  getInlineDataFragment: RelayModernGraphQLTag.getInlineDataFragment,
  getModuleComponentKey: RelayStoreUtils.getModuleComponentKey,
  getModuleOperationKey: RelayStoreUtils.getModuleOperationKey,
  getPaginationFragment: RelayModernGraphQLTag.getPaginationFragment,
  getPluralSelector: RelayModernSelector.getPluralSelector,
  getRefetchableFragment: RelayModernGraphQLTag.getRefetchableFragment,
  getRequest: RelayModernGraphQLTag.getRequest,
  getRequestIdentifier: getRequestIdentifier,
  getSelector: RelayModernSelector.getSelector,
  getSelectorsFromObject: RelayModernSelector.getSelectorsFromObject,
  getSingularSelector: RelayModernSelector.getSingularSelector,
  getStorageKey: RelayStoreUtils.getStorageKey,
  getVariablesFromFragment: RelayModernSelector.getVariablesFromFragment,
  getVariablesFromObject: RelayModernSelector.getVariablesFromObject,
  getVariablesFromPluralFragment:
    RelayModernSelector.getVariablesFromPluralFragment,
  getVariablesFromSingularFragment:
    RelayModernSelector.getVariablesFromSingularFragment,
  graphql: RelayModernGraphQLTag.graphql,
  readInlineData,

  // Declarative mutation API
  MutationTypes: RelayDeclarativeMutationConfig.MutationTypes,
  RangeOperations: RelayDeclarativeMutationConfig.RangeOperations,

  // Extensions
  DefaultHandlerProvider: RelayDefaultHandlerProvider,
  DefaultMissingFieldHandlers: RelayDefaultMissingFieldHandlers,
  ConnectionHandler: RelayConnectionHandler,
  ConnectionResolver_UNSTABLE: RelayConnectionResolver,
  VIEWER_ID: ViewerPattern.VIEWER_ID,
  VIEWER_TYPE: ViewerPattern.VIEWER_TYPE,

  // Helpers (can be implemented via the above API)
  applyOptimisticMutation,
  commitLocalUpdate,
  commitMutation,
  fetchQuery,
  isRelayModernEnvironment,
  requestSubscription,

  // Configuration interface for legacy or special uses
  ConnectionInterface: RelayConnectionInterface,

  // Utilities
  RelayProfiler: RelayProfiler,
  createPayloadFor3DField: createPayloadFor3DField,

  // INTERNAL-ONLY: These exports might be removed at any point.
  RelayConcreteNode: RelayConcreteNode,
  RelayError: RelayError,
  RelayFeatureFlags: RelayFeatureFlags,
  DEFAULT_HANDLE_KEY: RelayDefaultHandleKey.DEFAULT_HANDLE_KEY,
  FRAGMENTS_KEY: RelayStoreUtils.FRAGMENTS_KEY,
  FRAGMENT_OWNER_KEY: RelayStoreUtils.FRAGMENT_OWNER_KEY,
  ID_KEY: RelayStoreUtils.ID_KEY,
  REF_KEY: RelayStoreUtils.REF_KEY,
  REFS_KEY: RelayStoreUtils.REFS_KEY,
  ROOT_ID: RelayStoreUtils.ROOT_ID,
  ROOT_TYPE: RelayStoreUtils.ROOT_TYPE,
  TYPENAME_KEY: RelayStoreUtils.TYPENAME_KEY,

  deepFreeze: deepFreeze,
  generateClientID: generateClientID,
  generateUniqueClientID: generateUniqueClientID,
  getRelayHandleKey: getRelayHandleKey,
  isPromise: isPromise,
  isScalarAndEqual: isScalarAndEqual,
  recycleNodesInto: recycleNodesInto,
  stableCopy: stableCopy,
  getFragmentIdentifier: getFragmentIdentifier,
  getFragmentSpecIdentifier: getFragmentSpecIdentifier,
  __internal: {
    OperationTracker: RelayOperationTracker,
    createRelayContext: createRelayContext,
    getModernOperationVariables: RelayConcreteVariables.getOperationVariables,
    fetchQuery: fetchQueryInternal.fetchQuery,
    fetchQueryDeduped: fetchQueryInternal.fetchQueryDeduped,
    getPromiseForRequestInFlight:
      fetchQueryInternal.getPromiseForRequestInFlight,
    getObservableForRequestInFlight:
      fetchQueryInternal.getObservableForRequestInFlight,
    hasRequestInFlight: fetchQueryInternal.hasRequestInFlight,
  },
};

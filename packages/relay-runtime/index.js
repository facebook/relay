/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

const ConnectionHandler = require('./handlers/connection/ConnectionHandler');
const ConnectionInterface = require('./handlers/connection/ConnectionInterface');
const MutationHandlers = require('./handlers/connection/MutationHandlers');
const RelayDefaultHandlerProvider = require('./handlers/RelayDefaultHandlerProvider');
const applyOptimisticMutation = require('./mutations/applyOptimisticMutation');
const commitLocalUpdate = require('./mutations/commitLocalUpdate');
const commitMutation = require('./mutations/commitMutation');
const RelayDeclarativeMutationConfig = require('./mutations/RelayDeclarativeMutationConfig');
const RelayNetwork = require('./network/RelayNetwork');
const RelayObservable = require('./network/RelayObservable');
const RelayQueryResponseCache = require('./network/RelayQueryResponseCache');
const fetchQuery = require('./query/fetchQuery');
const fetchQuery_DEPRECATED = require('./query/fetchQuery_DEPRECATED');
const fetchQueryInternal = require('./query/fetchQueryInternal');
const GraphQLTag = require('./query/GraphQLTag');
const PreloadableQueryRegistry = require('./query/PreloadableQueryRegistry');
const {
  generateClientID,
  generateUniqueClientID,
  isClientID,
} = require('./store/ClientID');
const createFragmentSpecResolver = require('./store/createFragmentSpecResolver');
const createRelayContext = require('./store/createRelayContext');
const isRelayModernEnvironment = require('./store/isRelayModernEnvironment');
const readInlineData = require('./store/readInlineData');
const RelayConcreteVariables = require('./store/RelayConcreteVariables');
const RelayModernEnvironment = require('./store/RelayModernEnvironment');
const RelayModernOperationDescriptor = require('./store/RelayModernOperationDescriptor');
const RelayModernRecord = require('./store/RelayModernRecord');
const RelayModernSelector = require('./store/RelayModernSelector');
const RelayModernStore = require('./store/RelayModernStore');
const RelayOperationTracker = require('./store/RelayOperationTracker');
const RelayRecordSource = require('./store/RelayRecordSource');
const RelayStoreUtils = require('./store/RelayStoreUtils');
const ViewerPattern = require('./store/ViewerPattern');
const requestSubscription = require('./subscription/requestSubscription');
const createPayloadFor3DField = require('./util/createPayloadFor3DField');
const deepFreeze = require('./util/deepFreeze');
const getFragmentIdentifier = require('./util/getFragmentIdentifier');
const getPaginationMetadata = require('./util/getPaginationMetadata');
const getPaginationVariables = require('./util/getPaginationVariables');
const getPendingOperationsForFragment = require('./util/getPendingOperationsForFragment');
const getRefetchMetadata = require('./util/getRefetchMetadata');
const getRelayHandleKey = require('./util/getRelayHandleKey');
const getRequestIdentifier = require('./util/getRequestIdentifier');
const getValueAtPath = require('./util/getValueAtPath');
const isPromise = require('./util/isPromise');
const isScalarAndEqual = require('./util/isScalarAndEqual');
const recycleNodesInto = require('./util/recycleNodesInto');
const RelayConcreteNode = require('./util/RelayConcreteNode');
const RelayDefaultHandleKey = require('./util/RelayDefaultHandleKey');
const RelayError = require('./util/RelayError');
const RelayFeatureFlags = require('./util/RelayFeatureFlags');
const RelayProfiler = require('./util/RelayProfiler');
const RelayReplaySubject = require('./util/RelayReplaySubject');
const reportMissingRequiredFields = require('./util/reportMissingRequiredFields');
const stableCopy = require('./util/stableCopy');

export type {ConnectionMetadata} from './handlers/connection/ConnectionHandler';
export type {
  EdgeRecord,
  PageInfo,
} from './handlers/connection/ConnectionInterface';
export type {
  DeclarativeMutationConfig,
  MutationType,
  RangeBehaviors,
  RangeOperation,
} from './mutations/RelayDeclarativeMutationConfig';
export type {OptimisticMutationConfig} from './mutations/applyOptimisticMutation';
export type {
  DEPRECATED_MutationConfig,
  MutationConfig,
} from './mutations/commitMutation';
export type {
  ExecuteFunction,
  FetchFunction,
  GraphQLResponse,
  GraphQLResponseWithData,
  GraphQLResponseWithoutData,
  GraphQLSingularResponse,
  INetwork,
  LogRequestInfoFunction,
  PayloadData,
  PayloadError,
  ReactFlightPayloadData,
  ReactFlightPayloadQuery,
  ReactFlightServerTree,
  ReactFlightServerError,
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
export type {GraphQLTaggedNode} from './query/GraphQLTag';
export type {TaskScheduler} from './store/OperationExecutor';
export type {EnvironmentConfig} from './store/RelayModernEnvironment';
export type {RecordState} from './store/RelayRecordState';
export type {
  ExecuteMutationConfig,
  FragmentMap,
  // DEPRECATED: use FragmentType instead of FragmentReference
  FragmentType as FragmentReference,
  FragmentType,
  FragmentSpecResolver,
  HandleFieldPayload,
  IEnvironment,
  InvalidationState,
  LogEvent,
  LogFunction,
  MissingFieldHandler,
  MissingRequiredFields,
  ModuleImportPointer,
  MutationParameters,
  NormalizationSelector,
  OperationAvailability,
  OperationDescriptor,
  OperationLoader,
  OperationTracker,
  OptimisticResponseConfig,
  OptimisticUpdate,
  OptimisticUpdateFunction,
  PluralReaderSelector,
  Props,
  PublishQueue,
  ReactFlightClientResponse,
  ReactFlightPayloadDeserializer,
  ReactFlightServerErrorHandler,
  ReaderSelector,
  ReadOnlyRecordProxy,
  RecordProxy,
  RecordSourceProxy,
  RecordSourceSelectorProxy,
  RelayContext,
  RequestDescriptor,
  RequiredFieldLogger,
  SelectorData,
  SelectorStoreUpdater,
  SingularReaderSelector,
  Snapshot,
  StoreUpdater,
} from './store/RelayStoreTypes';
export type {
  DEPRECATED_GraphQLSubscriptionConfig,
  GraphQLSubscriptionConfig,
  SubscriptionParameters,
} from './subscription/requestSubscription';
export type {JSResourceReference} from './util/JSResourceTypes.flow';
export type {
  NormalizationArgument,
  NormalizationDefer,
  NormalizationField,
  NormalizationFlightField,
  NormalizationLinkedField,
  NormalizationLinkedHandle,
  NormalizationLocalArgumentDefinition,
  NormalizationModuleImport,
  NormalizationScalarField,
  NormalizationSelection,
  NormalizationSplitOperation,
  NormalizationStream,
  NormalizationTypeDiscriminator,
  NormalizationOperation,
} from './util/NormalizationNode';
export type {
  ReaderArgument,
  ReaderArgumentDefinition,
  ReaderField,
  ReaderFlightField,
  ReaderFragment,
  ReaderInlineDataFragment,
  ReaderInlineDataFragmentSpread,
  ReaderLinkedField,
  ReaderModuleImport,
  ReaderPaginationMetadata,
  ReaderRefetchableFragment,
  ReaderRefetchMetadata,
  ReaderRequiredField,
  ReaderScalarField,
  ReaderSelection,
  RequiredFieldAction,
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
  FetchPolicy,
  FetchQueryFetchPolicy,
  Fragment,
  GraphQLSubscription,
  InlineFragment,
  Mutation,
  Operation,
  OperationType,
  Query,
  RefetchableFragment,
  RenderPolicy,
  Variables,
  VariablesOf,
} from './util/RelayRuntimeTypes';
export type {Local3DPayload} from './util/createPayloadFor3DField';
export type {Direction} from './util/getPaginationVariables';
export type {RequestIdentifier} from './util/getRequestIdentifier';

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
  getNode: GraphQLTag.getNode,
  getFragment: GraphQLTag.getFragment,
  getInlineDataFragment: GraphQLTag.getInlineDataFragment,
  getModuleComponentKey: RelayStoreUtils.getModuleComponentKey,
  getModuleOperationKey: RelayStoreUtils.getModuleOperationKey,
  getPaginationFragment: GraphQLTag.getPaginationFragment,
  getPluralSelector: RelayModernSelector.getPluralSelector,
  getRefetchableFragment: GraphQLTag.getRefetchableFragment,
  getRequest: GraphQLTag.getRequest,
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
  reportMissingRequiredFields,
  graphql: GraphQLTag.graphql,
  isFragment: GraphQLTag.isFragment,
  isInlineDataFragment: GraphQLTag.isInlineDataFragment,
  isRequest: GraphQLTag.isRequest,
  readInlineData,

  // Declarative mutation API
  MutationTypes: RelayDeclarativeMutationConfig.MutationTypes,
  RangeOperations: RelayDeclarativeMutationConfig.RangeOperations,

  // Extensions
  DefaultHandlerProvider: RelayDefaultHandlerProvider,
  ConnectionHandler,
  MutationHandlers,
  VIEWER_ID: ViewerPattern.VIEWER_ID,
  VIEWER_TYPE: ViewerPattern.VIEWER_TYPE,

  // Helpers (can be implemented via the above API)
  applyOptimisticMutation,
  commitLocalUpdate,
  commitMutation,
  fetchQuery: fetchQuery,
  fetchQuery_DEPRECATED,
  isRelayModernEnvironment,
  requestSubscription,

  // Configuration interface for legacy or special uses
  ConnectionInterface,

  // Utilities
  PreloadableQueryRegistry,
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
  isClientID: isClientID,
  isPromise: isPromise,
  isScalarAndEqual: isScalarAndEqual,
  recycleNodesInto: recycleNodesInto,
  stableCopy: stableCopy,
  getFragmentIdentifier: getFragmentIdentifier,
  getRefetchMetadata: getRefetchMetadata,
  getPaginationMetadata: getPaginationMetadata,
  getPaginationVariables: getPaginationVariables,
  getPendingOperationsForFragment: getPendingOperationsForFragment,
  getValueAtPath: getValueAtPath,
  __internal: {
    OperationTracker: RelayOperationTracker,
    createRelayContext: createRelayContext,
    getOperationVariables: RelayConcreteVariables.getOperationVariables,
    fetchQuery: fetchQueryInternal.fetchQuery,
    fetchQueryDeduped: fetchQueryInternal.fetchQueryDeduped,
    getPromiseForActiveRequest: fetchQueryInternal.getPromiseForActiveRequest,
    getObservableForActiveRequest:
      fetchQueryInternal.getObservableForActiveRequest,
  },
};

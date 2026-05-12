/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import * as ConnectionHandler from './handlers/connection/ConnectionHandler';
import ConnectionInterface from './handlers/connection/ConnectionInterface';
// Extensions
import RelayDefaultHandlerProvider from './handlers/RelayDefaultHandlerProvider';
import QueryResponseCache from './network/RelayQueryResponseCache';
import * as fetchQueryInternal from './query/fetchQueryInternal';
import * as RelayResolverFragments from './store/ResolverFragments';
import withProvidedVariables from './util/withProvidedVariables';

export { ConnectionInterface };
export { ConnectionMetadata } from './handlers/connection/ConnectionHandler';
export { EdgeRecord, PageInfo } from './handlers/connection/ConnectionInterface';
export { OptimisticMutationConfig } from './mutations/applyOptimisticMutation';
export { MutationConfig, MutationParameters } from './mutations/commitMutation';
export {
    DeclarativeMutationConfig,
    MutationTypes,
    RangeBehaviors,
    RangeOperations,
} from './mutations/RelayDeclarativeMutationConfig';
export {
    MutationTypes as MutationType,
    RangeOperations as RangeOperation,
} from './mutations/RelayDeclarativeMutationConfig';
export {
    ExecuteFunction,
    FetchFunction,
    GraphQLResponse,
    GraphQLResponseWithData,
    GraphQLResponseWithoutData,
    GraphQLSingularResponse,
    LogRequestInfoFunction,
    Network as INetwork,
    PayloadData,
    PayloadError,
    ReactFlightPayloadData,
    ReactFlightPayloadQuery,
    ReactFlightServerTree,
    SubscribeFunction,
    Uploadable,
    UploadableMap,
} from './network/RelayNetworkTypes';
export { ObservableFromValue, Observer, Subscribable, Subscription } from './network/RelayObservable';
export {
    getFragment,
    getInlineDataFragment,
    getNode,
    getPaginationFragment,
    getRefetchableFragment,
    getRequest,
    graphql,
    GraphQLTaggedNode,
    isFragment,
    isInlineDataFragment,
    isRequest,
} from './query/GraphQLTag';
export { generateClientID, generateUniqueClientID, isClientID } from './store/ClientID';
export { TaskScheduler } from './store/OperationExecutor';
export { RecordState } from './store/RelayRecordState';
export {
    Environment as IEnvironment,
    FragmentMap,
    FragmentPointer,
    FragmentSpecResolver,
    FragmentType,
    /** @deprecated use FragmentType instead of FragmentReference */
    FragmentType as FragmentReference,
    HandleFieldPayload,
    HasUpdatableSpread,
    InvalidationState,
    LiveState,
    LogEvent,
    LogFunction,
    MissingFieldHandler,
    ModuleImportPointer,
    MutableRecordSource,
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
    ReaderSelector,
    ReadOnlyRecordProxy,
    RecordProxy,
    RecordSourceProxy,
    RecordSourceSelectorProxy,
    RelayContext,
    RelayFieldLogger,
    RequestDescriptor,
    SelectorData,
    SelectorStoreUpdater,
    SingularReaderSelector,
    Snapshot,
    StoreUpdater,
    suspenseSentinel,
    UpdatableFragmentData,
    UpdatableQueryData,
} from './store/RelayStoreTypes';
export { GraphQLSubscriptionConfig } from './subscription/requestSubscription';
export {
    NormalizationArgument,
    NormalizationDefer,
    NormalizationField,
    NormalizationFlightField,
    NormalizationLinkedField,
    NormalizationLinkedHandle,
    NormalizationLocalArgumentDefinition,
    NormalizationModuleImport,
    NormalizationOperation,
    NormalizationRootNode,
    NormalizationScalarField,
    NormalizationSelection,
    NormalizationSplitOperation,
    NormalizationStream,
    NormalizationTypeDiscriminator,
} from './util/NormalizationNode';
export {
    ReaderArgument,
    ReaderArgumentDefinition,
    ReaderCondition,
    ReaderField,
    ReaderFlightField,
    ReaderFragment,
    ReaderInlineDataFragment,
    ReaderInlineDataFragmentSpread,
    ReaderInlineFragment,
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
export {
    ConcreteRequest,
    ConcreteUpdatableQuery,
    GeneratedNode,
    PreloadableConcreteRequest,
    RequestParameters,
} from './util/RelayConcreteNode';
export { RelayReplaySubject as ReplaySubject } from './util/RelayReplaySubject';
export * from './util/RelayRuntimeTypes';
// Core API
export { RelayNetwork as Network } from './network/RelayNetwork';
export { RelayObservable as Observable } from './network/RelayObservable';
export { default as Environment, EnvironmentConfig } from './store/RelayModernEnvironment';
export { QueryResponseCache };
export { RelayModernRecord as Record } from './store/RelayModernRecord';
export { default as Store } from './store/RelayModernStore';
export { RelayRecordSource as RecordSource } from './store/RelayRecordSource';
export { type IdOf, isErrorResult, isValueResult, type Result } from './experimental';
export { createFragmentSpecResolver } from './store/createFragmentSpecResolver';
export { readInlineData } from './store/readInlineData';
export { createOperationDescriptor, createRequestDescriptor } from './store/RelayModernOperationDescriptor';
export {
    areEqualSelectors,
    createNormalizationSelector,
    createReaderSelector,
    getDataIDsFromFragment,
    getDataIDsFromObject,
    getPluralSelector,
    getSelector,
    getSelectorsFromObject,
    getSingularSelector,
    getVariablesFromFragment,
    getVariablesFromObject,
    getVariablesFromPluralFragment,
    getVariablesFromSingularFragment,
} from './store/RelayModernSelector';
export {
    FRAGMENT_OWNER_KEY,
    FRAGMENTS_KEY,
    getModuleComponentKey,
    getModuleOperationKey,
    getStorageKey,
    ID_KEY,
    REF_KEY,
    REFS_KEY,
    ROOT_ID,
    ROOT_TYPE,
    TYPENAME_KEY,
} from './store/RelayStoreUtils';
export { readFragment } from './store/ResolverFragments';
export { RelayDefaultHandlerProvider as DefaultHandlerProvider };
export declare function getDefaultMissingFieldHandlers(): import('./store/RelayStoreTypes').MissingFieldHandler[];
export { ConnectionHandler };
export { MutationHandlers } from './handlers/connection/MutationHandlers';
export { VIEWER_ID, VIEWER_TYPE } from './store/ViewerPattern';
// Helpers (can be implemented via the above API)
export { applyOptimisticMutation } from './mutations/applyOptimisticMutation';
export { commitLocalUpdate } from './mutations/commitLocalUpdate';
export { commitMutation } from './mutations/commitMutation';
export { fetchQuery } from './query/fetchQuery';
export { fetchQuery_DEPRECATED } from './query/fetchQuery_DEPRECATED';
export { isRelayModernEnvironment } from './store/isRelayModernEnvironment';
export { requestSubscription } from './subscription/requestSubscription';
// Utilities
export { default as createPayloadFor3DField } from './util/createPayloadFor3DField';
export { default as getFragmentIdentifier } from './util/getFragmentIdentifier';
export { default as getPaginationMetadata } from './util/getPaginationMetadata';
export { default as getPaginationVariables } from './util/getPaginationVariables';
export { Direction } from './util/getPaginationVariables';
export { default as getRefetchMetadata } from './util/getRefetchMetadata';
export { default as getRelayHandleKey } from './util/getRelayHandleKey';
export { default as getRequestIdentifier } from './util/getRequestIdentifier';
export { default as getValueAtPath } from './util/getValueAtPath';
export { default as handlePotentialSnapshotErrors } from './util/handlePotentialSnapshotErrors';
export declare const PreloadableQueryRegistry: {
    set(key: string, value: import('./util/RelayConcreteNode').ConcreteRequest): void;
    get(key: string): import('./util/RelayConcreteNode').ConcreteRequest | null | undefined;
    onLoad(key: string, callback: (concreteRequest: import('./util/RelayConcreteNode').ConcreteRequest) => void): import('./util/RelayRuntimeTypes').Disposable;
    clear(): void;
};
export { RelayProfiler } from './util/RelayProfiler';
// INTERNAL-ONLY
export { RelayConcreteNode } from './util/RelayConcreteNode';
export { default as RelayError } from './util/RelayError';
export { RelayFeatureFlags } from './util/RelayFeatureFlags';
export const DEFAULT_HANDLE_KEY = '';
export { default as deepFreeze } from './util/deepFreeze';
export { default as getPendingOperationsForFragment } from './util/getPendingOperationsForFragment';
export { default as isPromise } from './util/isPromise';
export { default as isScalarAndEqual } from './util/isScalarAndEqual';
export { default as recycleNodesInto } from './util/recycleNodesInto';
export { default as stableCopy } from './util/stableCopy';

interface Internal {
    fetchQuery: typeof fetchQueryInternal.fetchQuery;
    fetchQueryDeduped: typeof fetchQueryInternal.fetchQueryDeduped;
    getPromiseForActiveRequest: typeof fetchQueryInternal.getPromiseForActiveRequest;
    getObservableForActiveRequest: typeof fetchQueryInternal.getObservableForActiveRequest;
    ResolverFragments: typeof RelayResolverFragments;
    withProvidedVariables: typeof withProvidedVariables;
}

export const __internal: Internal;

/**
 * relay-compiler-language-typescript support for fragment references
 */

export interface _RefType<Ref extends string> {
    ' $fragmentType': Ref;
}

export interface _FragmentRefs<Refs extends string> {
    ' $fragmentSpreads': FragmentRefs<Refs>;
}

// This is used in the actual artifacts to define the various fragment references a container holds.
export type FragmentRefs<Refs extends string> = {
    [ref in Refs]: true;
};

// This is a utility type for converting from a data type to a fragment reference that will resolve to that data type.
export type FragmentRef<Fragment> = Fragment extends _RefType<infer U> ? _FragmentRefs<U> : never;

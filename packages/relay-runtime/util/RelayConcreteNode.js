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

import type {
  NormalizationOperation,
  NormalizationSplitOperation,
} from './NormalizationNode';
import type {ReaderFragment, ReaderInlineDataFragment} from './ReaderNode';

/**
 * Represents a common GraphQL request that can be executed, an `operation`
 * containing information to normalize the results, and a `fragment` derived
 * from that operation to read the response data (masking data from child
 * fragments).
 */
export type ConcreteRequest = {
  +kind: 'Request',
  +fragment: ReaderFragment,
  +operation: NormalizationOperation,
  +params: RequestParameters,
};

export type ConcreteUpdatableQuery = {
  +kind: 'UpdatableQuery',
  +fragment: ReaderFragment,
};

export type NormalizationRootNode =
  | ConcreteRequest
  | NormalizationSplitOperation;

export type ProvidedVariablesType = {+[key: string]: {get(): mixed}};

/**
 * Contains the parameters required for executing a GraphQL request.
 * The operation can either be provided as a persisted `id` or `text` or both.
 * If `text` format is provided, a `cacheID` as a hash of the text should be set
 * to be used for local caching.
 */
export type RequestParameters =
  | {
      +id: string,
      +text: string | null,
      // common fields
      +name: string,
      +operationKind: 'mutation' | 'query' | 'subscription',
      +providedVariables?: ProvidedVariablesType,
      +metadata: {[key: string]: mixed, ...},
    }
  | {
      +cacheID: string,
      +id: null,
      +text: string | null,
      // common fields
      +name: string,
      +operationKind: 'mutation' | 'query' | 'subscription',
      +providedVariables?: ProvidedVariablesType,
      +metadata: {[key: string]: mixed, ...},
    };

export type ClientRequestParameters = {
  +cacheID: string,
  +id: null,
  +text: null,
  // common fields
  +name: string,
  +operationKind: 'query' | 'mutation',
  +providedVariables?: ProvidedVariablesType,
  +metadata: {[key: string]: mixed, ...},
};

export type ClientRequest = {
  +kind: 'Request',
  +fragment: ReaderFragment,
  +operation: NormalizationOperation,
  +params: ClientRequestParameters,
};

export type GeneratedNode =
  | ConcreteRequest
  | ReaderFragment
  | ReaderInlineDataFragment
  | NormalizationSplitOperation
  | ConcreteUpdatableQuery;

const RelayConcreteNode = {
  ACTOR_CHANGE: 'ActorChange',
  CATCH_FIELD: 'CatchField',
  CONDITION: 'Condition',
  CLIENT_COMPONENT: 'ClientComponent',
  CLIENT_EDGE_TO_SERVER_OBJECT: 'ClientEdgeToServerObject',
  CLIENT_EDGE_TO_CLIENT_OBJECT: 'ClientEdgeToClientObject',
  CLIENT_EXTENSION: 'ClientExtension',
  DEFER: 'Defer',
  CONNECTION: 'Connection',
  FRAGMENT: 'Fragment',
  FRAGMENT_SPREAD: 'FragmentSpread',
  INLINE_DATA_FRAGMENT_SPREAD: 'InlineDataFragmentSpread',
  INLINE_DATA_FRAGMENT: 'InlineDataFragment',
  INLINE_FRAGMENT: 'InlineFragment',
  LINKED_FIELD: 'LinkedField',
  LINKED_HANDLE: 'LinkedHandle',
  LITERAL: 'Literal',
  LIST_VALUE: 'ListValue',
  LOCAL_ARGUMENT: 'LocalArgument',
  MODULE_IMPORT: 'ModuleImport',
  ALIASED_FRAGMENT_SPREAD: 'AliasedFragmentSpread',
  ALIASED_INLINE_FRAGMENT_SPREAD: 'AliasedInlineFragmentSpread',
  RELAY_RESOLVER: 'RelayResolver',
  RELAY_LIVE_RESOLVER: 'RelayLiveResolver',
  REQUIRED_FIELD: 'RequiredField',
  OBJECT_VALUE: 'ObjectValue',
  OPERATION: 'Operation',
  REQUEST: 'Request',
  ROOT_ARGUMENT: 'RootArgument',
  SCALAR_FIELD: 'ScalarField',
  SCALAR_HANDLE: 'ScalarHandle',
  SPLIT_OPERATION: 'SplitOperation',
  STREAM: 'Stream',
  TYPE_DISCRIMINATOR: 'TypeDiscriminator',
  UPDATABLE_QUERY: 'UpdatableQuery',
  VARIABLE: 'Variable',
} as const;

module.exports = RelayConcreteNode;

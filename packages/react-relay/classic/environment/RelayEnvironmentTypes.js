/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  ConcreteFragment,
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from '../query/ConcreteQuery';
import type {
  CEnvironment,
  CFragmentMap,
  CFragmentSpecResolver,
  CNormalizationSelector,
  COperationDescriptor,
  CReaderSelector,
  CRelayContext,
  CSnapshot,
  CUnstableEnvironmentCore,
} from 'relay-runtime';
import type {
  DeclarativeMutationConfig,
  Disposable,
  GraphQLTaggedNode,
  UploadableMap,
  Variables,
} from 'relay-runtime';

type TEnvironment = Environment;
type TFragment = ConcreteFragmentDefinition;
type TGraphQLTaggedNode = GraphQLTaggedNode;
type TReaderNode = ConcreteFragment;
type TNormalizationNode = ConcreteFragment;
type TPayload = ReaderSelector;
type TRequest = ConcreteOperationDefinition;
type TReaderSelector = CReaderSelector<TReaderNode>;

export type FragmentMap = CFragmentMap<TFragment>;
export type OperationDescriptor = COperationDescriptor<
  TReaderNode,
  TNormalizationNode,
  TRequest,
>;
export type RelayContext = CRelayContext<TEnvironment>;
export type ReaderSelector = TReaderSelector;
export type NormalizationSelector = CNormalizationSelector<TNormalizationNode>;
export type Snapshot = CSnapshot<TReaderNode, OperationDescriptor>;
export type UnstableEnvironmentCore = CUnstableEnvironmentCore<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TReaderNode,
  TNormalizationNode,
  TRequest,
  TReaderSelector,
>;
export interface FragmentSpecResolver extends CFragmentSpecResolver<TRequest> {}

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface Environment
  extends CEnvironment<
    TEnvironment,
    TFragment,
    TGraphQLTaggedNode,
    TReaderNode,
    TNormalizationNode,
    TRequest,
    TPayload,
    TReaderSelector,
  > {
  /**
   * Applies an optimistic mutation to the store without committing it to the
   * server. The returned Disposable can be used to revert this change at a
   * later time.
   */
  applyMutation(config: {|
    configs: Array<DeclarativeMutationConfig>,
    operation: ConcreteOperationDefinition,
    optimisticResponse: Object,
    variables: Variables,
  |}): Disposable;

  /**
   * Applies an optimistic mutation if provided and commits the mutation to the
   * server. The returned Disposable can be used to bypass the `onCompleted`
   * and `onError` callbacks when the server response is returned.
   */
  sendMutation<ResponseType>(config: {|
    configs: Array<DeclarativeMutationConfig>,
    onCompleted?: ?(response: ResponseType) => void,
    onError?: ?(error: Error) => void,
    operation: ConcreteOperationDefinition,
    optimisticOperation?: ?ConcreteOperationDefinition,
    optimisticResponse?: ?Object,
    variables: Variables,
    uploadables?: UploadableMap,
  |}): Disposable;
}

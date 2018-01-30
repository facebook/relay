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

import type {
  ConcreteFragment,
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from '../query/ConcreteQuery';
import type {
  CEnvironment,
  CFragmentMap,
  COperationSelector,
  CRelayContext,
  CSelector,
  CSnapshot,
  CUnstableEnvironmentCore,
} from './RelayCombinedEnvironmentTypes';
import type {
  DeclarativeMutationConfig,
  Disposable,
  GraphQLTaggedNode,
  UploadableMap,
  Variables,
} from 'RelayRuntime';

type TEnvironment = Environment;
type TFragment = ConcreteFragmentDefinition;
type TGraphQLTaggedNode = GraphQLTaggedNode;
type TNode = ConcreteFragment;
type TRequest = ConcreteOperationDefinition;
type TPayload = Selector;
type TOperationCompat = any; // unused type for compat with Modern API

export type FragmentMap = CFragmentMap<TFragment>;
export type OperationSelector = COperationSelector<TNode, TRequest>;
export type RelayContext = CRelayContext<TEnvironment>;
export type Selector = CSelector<TNode>;
export type Snapshot = CSnapshot<TNode>;
export type UnstableEnvironmentCore = CUnstableEnvironmentCore<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TNode,
  TRequest,
  TOperationCompat,
>;

/**
 * The public API of Relay core. Represents an encapsulated environment with its
 * own in-memory cache.
 */
export interface Environment
  extends CEnvironment<
    TEnvironment,
    TFragment,
    TGraphQLTaggedNode,
    TNode,
    TRequest,
    TPayload,
    TOperationCompat,
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

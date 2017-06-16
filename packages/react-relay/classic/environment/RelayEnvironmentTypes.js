/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayEnvironmentTypes
 * @flow
 * @format
 */

'use strict';

import type {
  ConcreteFragment,
  ConcreteFragmentDefinition,
  ConcreteOperationDefinition,
} from 'ConcreteQuery';
import type {
  CEnvironment,
  CFragmentMap,
  COperationSelector,
  CRelayContext,
  CSelector,
  CSnapshot,
  CUnstableEnvironmentCore,
  Disposable,
  Record,
} from 'RelayCombinedEnvironmentTypes';
import type {GraphQLTaggedNode} from 'RelayModernGraphQLTag';
import type {UploadableMap} from 'RelayNetworkTypes';
import type {Variables, RelayMutationConfig} from 'RelayTypes';

type TEnvironment = Environment;
type TFragment = ConcreteFragmentDefinition;
type TGraphQLTaggedNode = GraphQLTaggedNode;
type TNode = ConcreteFragment;
type TOperation = ConcreteOperationDefinition;
type TPayload = Selector;

export type FragmentMap = CFragmentMap<TFragment>;
export type OperationSelector = COperationSelector<TNode, TOperation>;
export type RelayContext = CRelayContext<TEnvironment>;
export type Selector = CSelector<TNode>;
export type Snapshot = CSnapshot<TNode, Record>;
export type UnstableEnvironmentCore = CUnstableEnvironmentCore<
  TEnvironment,
  TFragment,
  TGraphQLTaggedNode,
  TNode,
  TOperation,
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
    TOperation,
    TPayload,
  > {
  /**
   * Applies an optimistic mutation to the store without committing it to the
   * server. The returned Disposable can be used to revert this change at a
   * later time.
   */
  applyMutation(config: {|
    configs: Array<RelayMutationConfig>,
    operation: ConcreteOperationDefinition,
    optimisticResponse: Object,
    variables: Variables,
  |}): Disposable,

  /**
   * Applies an optimistic mutation if provided and commits the mutation to the
   * server. The returned Disposable can be used to bypass the `onCompleted`
   * and `onError` callbacks when the server response is returned.
   */
  sendMutation<ResponseType>(config: {|
    configs: Array<RelayMutationConfig>,
    onCompleted?: ?(response: ResponseType) => void,
    onError?: ?(error: Error) => void,
    operation: ConcreteOperationDefinition,
    optimisticOperation?: ?ConcreteOperationDefinition,
    optimisticResponse?: ?Object,
    variables: Variables,
    uploadables?: UploadableMap,
  |}): Disposable,
}

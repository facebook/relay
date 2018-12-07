/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

import type {ReaderFragment, ReaderFragmentSpread} from './ReaderNode';
import type {
  NormalizationHandle,
  NormalizationOperation,
  NormalizationSplitOperation,
} from './NormalizationNode';

/**
 * Represents a common GraphQL request with `text` (or persisted `id`) can be
 * used to execute it, an `operation` containing information to normalize the
 * results, and a `fragment` derived from that operation to read the response
 * data (masking data from child fragments).
 */
export type ConcreteRequest = {|
  +kind: 'Request',
  +operationKind: 'mutation' | 'query' | 'subscription',
  +name: string,
  +id: ?string,
  text: ?string,
  +metadata: {[key: string]: mixed},
  +fragment: ReaderFragment,
  +operation: NormalizationOperation,
|};

export type GeneratedNode =
  | ConcreteRequest
  | ReaderFragment
  | NormalizationSplitOperation;

const RelayConcreteNode = {
  CONDITION: 'Condition',
  FRAGMENT: 'Fragment',
  FRAGMENT_SPREAD: 'FragmentSpread',
  INLINE_FRAGMENT: 'InlineFragment',
  LINKED_FIELD: 'LinkedField',
  LINKED_HANDLE: 'LinkedHandle',
  LITERAL: 'Literal',
  LOCAL_ARGUMENT: 'LocalArgument',
  MATCH_FIELD: 'MatchField',
  OPERATION: 'Operation',
  ROOT_ARGUMENT: 'RootArgument',
  REQUEST: 'Request',
  SCALAR_FIELD: 'ScalarField',
  SCALAR_HANDLE: 'ScalarHandle',
  SPLIT_OPERATION: 'SplitOperation',
  VARIABLE: 'Variable',
};

module.exports = RelayConcreteNode;

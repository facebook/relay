/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule RelayConcreteNode
 * @flow
 * @format
 */

'use strict';

export type ConcreteArgument = ConcreteLiteral | ConcreteVariable;
export type ConcreteArgumentDefinition =
  | ConcreteLocalArgument
  | ConcreteRootArgument;
/**
 * A wrapper around many operations to request in a batched network request.
 * This provides a place to store multiple concrete operations which should be
 * executed as part of a single request, e.g. in the case of deferred nodes or
 * for streaming connections that are represented as distinct compiled concrete
 * operations but are still conceptually tied to one source operation.
 *
 * Operations may contain data describing their dependencies on other operations
 * or any other implementation-specific API configuration in each operation's
 * metadata dictionary.
 */
export type ConcreteBatchRequest = {
  kind: 'BatchRequest',
  name: string,
  operations: Array<ConcreteOperation>,
};
/**
 * Represents a single ConcreteOperation along containing metadata for
 * processing it at runtime. The `text` (or persisted `id`) can be used to
 * execute the operation, the `fragment` is derived from this operation to
 * read the response data (masking data from child fragments), while
 * the `selections` can be used to normalize server responses.
 */
export type ConcreteOperation = {
  kind: 'Operation',
  operation: 'mutation' | 'query' | 'subscription',
  name: string,
  id: ?string,
  metadata: {[key: string]: mixed},
  argumentDefinitions: Array<ConcreteLocalArgument>,
  selections: Array<ConcreteSelection>,
  fragment: ConcreteFragment,
  text: ?string,
};
export type ConcreteCondition = {
  kind: 'Condition',
  passingValue: boolean,
  condition: string,
  selections: Array<ConcreteSelection>,
};
export type ConcreteField = ConcreteScalarField | ConcreteLinkedField;
export type ConcreteFragment = {
  kind: 'Fragment',
  name: string,
  type: string,
  metadata: ?{[key: string]: mixed},
  argumentDefinitions: Array<ConcreteArgumentDefinition>,
  selections: Array<ConcreteSelection>,
};
export type ConcreteFragmentSpread = {
  kind: 'FragmentSpread',
  name: string,
  args: ?Array<ConcreteArgument>,
};
export type ConcreteHandle = ConcreteScalarHandle | ConcreteLinkedHandle;
export type ConcreteRootArgument = {
  kind: 'RootArgument',
  name: string,
  type: ?string,
};
export type ConcreteInlineFragment = {
  kind: 'InlineFragment',
  selections: Array<ConcreteSelection>,
  type: string,
};
export type ConcreteLinkedField = {
  kind: 'LinkedField',
  alias: ?string,
  name: string,
  storageKey: ?string,
  args: ?Array<ConcreteArgument>,
  concreteType: ?string,
  plural: boolean,
  selections: Array<ConcreteSelection>,
};
export type ConcreteLinkedHandle = {
  kind: 'LinkedHandle',
  alias: ?string,
  name: string,
  args: ?Array<ConcreteArgument>,
  handle: string,
  key: string,
  filters: ?Array<string>,
};
export type ConcreteLiteral = {
  kind: 'Literal',
  name: string,
  type: ?string,
  value: mixed,
};
export type ConcreteLocalArgument = {
  kind: 'LocalArgument',
  name: string,
  type: string,
  defaultValue: mixed,
};
export type ConcreteNode =
  | ConcreteCondition
  | ConcreteLinkedField
  | ConcreteFragment
  | ConcreteInlineFragment
  | ConcreteOperation;
export type ConcreteScalarField = {
  kind: 'ScalarField',
  alias: ?string,
  name: string,
  args: ?Array<ConcreteArgument>,
  storageKey: ?string,
};
export type ConcreteScalarHandle = {
  kind: 'ScalarHandle',
  alias: ?string,
  name: string,
  args: ?Array<ConcreteArgument>,
  handle: string,
  key: string,
  filters: ?Array<string>,
};
export type ConcreteSelection =
  | ConcreteCondition
  | ConcreteField
  | ConcreteFragmentSpread
  | ConcreteHandle
  | ConcreteInlineFragment;
export type ConcreteVariable = {
  kind: 'Variable',
  name: string,
  type: ?string,
  variableName: string,
};
export type ConcreteSelectableNode = ConcreteFragment | ConcreteOperation;
export type RequestNode = ConcreteOperation | ConcreteBatchRequest;
export type GeneratedNode = RequestNode | ConcreteFragment;

const RelayConcreteNode = {
  BATCH_REQUEST: 'BatchRequest',
  CONDITION: 'Condition',
  FRAGMENT: 'Fragment',
  FRAGMENT_SPREAD: 'FragmentSpread',
  INLINE_FRAGMENT: 'InlineFragment',
  LINKED_FIELD: 'LinkedField',
  LINKED_HANDLE: 'LinkedHandle',
  LITERAL: 'Literal',
  LOCAL_ARGUMENT: 'LocalArgument',
  OPERATION: 'Operation',
  ROOT_ARGUMENT: 'RootArgument',
  SCALAR_FIELD: 'ScalarField',
  SCALAR_HANDLE: 'ScalarHandle',
  VARIABLE: 'Variable',
};

module.exports = RelayConcreteNode;

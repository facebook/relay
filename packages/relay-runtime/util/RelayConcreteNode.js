/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayConcreteNode
 * @flow
 */

'use strict';

export type ConcreteArgument = ConcreteLiteral | ConcreteVariable;
export type ConcreteArgumentDefinition =
  ConcreteLocalArgument |
  ConcreteRootArgument;
/**
 * Represents a single ConcreteRoot along with metadata for processing it at
 * runtime. The persisted `id` (or `text`) can be used to fetch the query,
 * the `fragment` can be used to read the root data (masking data from child
 * fragments), and the `query` can be used to normalize server responses.
 *
 * NOTE: The use of "batch" in the name is intentional, as this wrapper around
 * the ConcreteRoot will provide a place to store multiple concrete nodes that
 * are part of the same batch, e.g. in the case of deferred nodes or
 * for streaming connections that are represented as distinct concrete roots but
 * are still conceptually tied to one source query.
 */
export type ConcreteBatch = {
  kind: 'Batch',
  fragment: ConcreteFragment,
  id: ?string,
  metadata: {[key: string]: mixed},
  name: string,
  query: ConcreteRoot,
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
  argumentDefinitions: Array<ConcreteArgumentDefinition>,
  kind: 'Fragment',
  metadata: ?{[key: string]: mixed},
  name: string,
  selections: Array<ConcreteSelection>,
  type: string,
};
export type ConcreteFragmentSpread = {
  args: ?Array<ConcreteArgument>,
  kind: 'FragmentSpread',
  name: string,
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
  alias: ?string,
  args: ?Array<ConcreteArgument>,
  concreteType: ?string,
  kind: 'LinkedField',
  name: string,
  plural: boolean,
  selections: Array<ConcreteSelection>,
  storageKey: ?string,
};
export type ConcreteLinkedHandle = {
  alias: ?string,
  args: ?Array<ConcreteArgument>,
  kind: 'LinkedHandle',
  name: string,
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
  defaultValue: mixed,
  kind: 'LocalArgument',
  name: string,
  type: string,
};
export type ConcreteNode =
  ConcreteCondition |
  ConcreteLinkedField |
  ConcreteFragment |
  ConcreteInlineFragment |
  ConcreteRoot;
export type ConcreteRoot = {
  argumentDefinitions: Array<ConcreteLocalArgument>,
  kind: 'Root',
  name: string,
  operation: 'mutation' | 'query' | 'subscription',
  selections: Array<ConcreteSelection>,
};
export type ConcreteScalarField = {
  alias: ?string,
  args: ?Array<ConcreteArgument>,
  kind: 'ScalarField',
  name: string,
  storageKey: ?string,
};
export type ConcreteScalarHandle = {
  alias: ?string,
  args: ?Array<ConcreteArgument>,
  kind: 'ScalarHandle',
  name: string,
  handle: string,
  key: string,
  filters : ?Array<string>,
};
export type ConcreteSelection =
  ConcreteCondition |
  ConcreteField |
  ConcreteFragmentSpread |
  ConcreteHandle |
  ConcreteInlineFragment;
export type ConcreteVariable = {
  kind: 'Variable',
  name: string,
  type: ?string,
  variableName: string,
};
export type ConcreteSelectableNode =
  ConcreteFragment |
  ConcreteRoot;
export type GeneratedNode =
  ConcreteBatch |
  ConcreteFragment;

const RelayConcreteNode = {
  CONDITION: 'Condition',
  FRAGMENT: 'Fragment',
  FRAGMENT_SPREAD: 'FragmentSpread',
  INLINE_FRAGMENT: 'InlineFragment',
  LINKED_FIELD: 'LinkedField',
  LINKED_HANDLE: 'LinkedHandle',
  LITERAL: 'Literal',
  LOCAL_ARGUMENT: 'LocalArgument',
  ROOT: 'Root',
  ROOT_ARGUMENT: 'RootArgument',
  SCALAR_FIELD: 'ScalarField',
  SCALAR_HANDLE: 'ScalarHandle',
  VARIABLE: 'Variable',
};

module.exports = RelayConcreteNode;

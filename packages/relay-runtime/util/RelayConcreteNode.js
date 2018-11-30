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

export type ConcreteArgument = ConcreteLiteral | ConcreteVariable;

export type ConcreteArgumentDefinition =
  | ConcreteLocalArgument
  | ConcreteRootArgument;

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
  +fragment: ConcreteFragment,
  +operation: ConcreteOperation,
|};

/**
 * Represents a single operation used to processing and normalize runtime
 * request results.
 */
export type ConcreteOperation = {|
  +kind: 'Operation',
  +name: string,
  +argumentDefinitions: $ReadOnlyArray<ConcreteLocalArgument>,
  +selections: $ReadOnlyArray<ConcreteSelection>,
|};

export type ConcreteCondition = {|
  +kind: 'Condition',
  +passingValue: boolean,
  +condition: string,
  +selections: $ReadOnlyArray<ConcreteSelection>,
|};

export type ConcreteField =
  | ConcreteScalarField
  | ConcreteLinkedField
  | ConcreteMatchField;

export type ConcreteFragment = {|
  +kind: 'Fragment',
  +name: string,
  +type: string,
  +metadata: ?{[key: string]: mixed},
  +argumentDefinitions: $ReadOnlyArray<ConcreteArgumentDefinition>,
  +selections: $ReadOnlyArray<ConcreteSelection>,
|};

export type ConcreteFragmentSpread = {|
  +kind: 'FragmentSpread',
  +name: string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
|};

export type ConcreteHandle = ConcreteScalarHandle | ConcreteLinkedHandle;

export type ConcreteRootArgument = {|
  +kind: 'RootArgument',
  +name: string,
  +type: ?string,
|};

export type ConcreteInlineFragment = {|
  +kind: 'InlineFragment',
  +selections: $ReadOnlyArray<ConcreteSelection>,
  +type: string,
|};

export type ConcreteLinkedField = {|
  +kind: 'LinkedField',
  +alias: ?string,
  +name: string,
  +storageKey: ?string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
  +concreteType: ?string,
  +plural: boolean,
  +selections: $ReadOnlyArray<ConcreteSelection>,
|};

export type ConcreteMatchField = {|
  +kind: 'MatchField',
  +alias: ?string,
  +name: string,
  +storageKey: ?string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
  +matchesByType: {
    +[key: string]: {|
      +fragmentPropName: string,
      +fragmentName: string,
    |},
  },
|};

export type ConcreteLinkedHandle = {|
  +kind: 'LinkedHandle',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
  +handle: string,
  +key: string,
  +filters: ?$ReadOnlyArray<string>,
|};

export type ConcreteLiteral = {|
  +kind: 'Literal',
  +name: string,
  +type: ?string,
  +value: mixed,
|};

export type ConcreteLocalArgument = {|
  +kind: 'LocalArgument',
  +name: string,
  +type: string,
  +defaultValue: mixed,
|};

export type ConcreteNode =
  | ConcreteCondition
  | ConcreteLinkedField
  | ConcreteFragment
  | ConcreteInlineFragment
  | ConcreteOperation
  | ConcreteSplitOperation;

export type ConcreteScalarField = {|
  +kind: 'ScalarField',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
  +storageKey: ?string,
|};

export type ConcreteScalarHandle = {|
  +kind: 'ScalarHandle',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
  +handle: string,
  +key: string,
  +filters: ?$ReadOnlyArray<string>,
|};

export type ConcreteSelection =
  | ConcreteCondition
  | ConcreteField
  | ConcreteFragmentSpread
  | ConcreteHandle
  | ConcreteInlineFragment
  | ConcreteMatchField;

export type ConcreteSplitOperation = {
  +kind: 'SplitOperation',
  +name: string,
  +metadata: ?{[key: string]: mixed},
  +selections: $ReadOnlyArray<ConcreteSelection>,
};

export type ConcreteVariable = {|
  +kind: 'Variable',
  +name: string,
  +type: ?string,
  +variableName: string,
|};

export type ConcreteSelectableNode =
  | ConcreteFragment
  | ConcreteOperation
  | ConcreteSplitOperation;

export type GeneratedNode =
  | ConcreteRequest
  | ConcreteFragment
  | ConcreteSplitOperation;

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

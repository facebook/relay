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

import type {
  ConcreteArgument,
  ConcreteArgumentDefinition,
  ConcreteCondition,
  ConcreteField,
  ConcreteRootArgument,
  ConcreteInlineFragment,
  ConcreteLinkedField,
  ConcreteMatchField,
  ConcreteLiteral,
  ConcreteLocalArgument,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteSelection,
  ConcreteSplitOperation,
  ConcreteVariable,
  ConcreteSelectableNode,
  GeneratedNode,
} from './RelayConcreteNode';

/**
 * Represents a single operation used to processing and normalize runtime
 * request results.
 */
export type NormalizationOperation = {|
  +kind: 'Operation',
  +name: string,
  +argumentDefinitions: $ReadOnlyArray<ConcreteLocalArgument>,
  +selections: $ReadOnlyArray<ConcreteSelection>,
|};

export type NormalizationHandle =
  | NormalizationScalarHandle
  | NormalizationLinkedHandle;

export type NormalizationLinkedHandle = {|
  +kind: 'LinkedHandle',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +handle: string,
  +key: string,
  +filters: ?$ReadOnlyArray<string>,
|};

export type NormalizationScalarHandle = {|
  +kind: 'ScalarHandle',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +handle: string,
  +key: string,
  +filters: ?$ReadOnlyArray<string>,
|};

export type NormalizationArgument = ConcreteArgument;
export type NormalizationArgumentDefinition = ConcreteArgumentDefinition;
export type NormalizationCondition = ConcreteCondition;
export type NormalizationField = ConcreteField;
export type NormalizationRootArgument = ConcreteRootArgument;
export type NormalizationInlineFragment = ConcreteInlineFragment;
export type NormalizationLinkedField = ConcreteLinkedField;
export type NormalizationMatchField = ConcreteMatchField;
export type NormalizationLiteral = ConcreteLiteral;
export type NormalizationLocalArgument = ConcreteLocalArgument;
export type NormalizationNode = ConcreteNode;
export type NormalizationScalarField = ConcreteScalarField;
export type NormalizationSelection = ConcreteSelection;
export type NormalizationSplitOperation = ConcreteSplitOperation;
export type NormalizationVariable = ConcreteVariable;
export type NormalizationSelectableNode = ConcreteSelectableNode;
export type NormalizationGeneratedNode = GeneratedNode;

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
  ConcreteHandle,
  ConcreteRootArgument,
  ConcreteInlineFragment,
  ConcreteLinkedField,
  ConcreteMatchField,
  ConcreteLinkedHandle,
  ConcreteLiteral,
  ConcreteLocalArgument,
  ConcreteNode,
  ConcreteScalarField,
  ConcreteScalarHandle,
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

export type NormalizationArgument = ConcreteArgument;
export type NormalizationArgumentDefinition = ConcreteArgumentDefinition;
export type NormalizationCondition = ConcreteCondition;
export type NormalizationField = ConcreteField;
export type NormalizationHandle = ConcreteHandle;
export type NormalizationRootArgument = ConcreteRootArgument;
export type NormalizationInlineFragment = ConcreteInlineFragment;
export type NormalizationLinkedField = ConcreteLinkedField;
export type NormalizationMatchField = ConcreteMatchField;
export type NormalizationLinkedHandle = ConcreteLinkedHandle;
export type NormalizationLiteral = ConcreteLiteral;
export type NormalizationLocalArgument = ConcreteLocalArgument;
export type NormalizationNode = ConcreteNode;
export type NormalizationScalarField = ConcreteScalarField;
export type NormalizationScalarHandle = ConcreteScalarHandle;
export type NormalizationSelection = ConcreteSelection;
export type NormalizationSplitOperation = ConcreteSplitOperation;
export type NormalizationVariable = ConcreteVariable;
export type NormalizationSelectableNode = ConcreteSelectableNode;
export type NormalizationGeneratedNode = GeneratedNode;

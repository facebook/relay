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
  ConcreteFragment,
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

export type ReaderFragmentSpread = {|
  +kind: 'FragmentSpread',
  +name: string,
  +args: ?$ReadOnlyArray<ConcreteArgument>,
|};

export type ReaderArgument = ConcreteArgument;
export type ReaderArgumentDefinition = ConcreteArgumentDefinition;
export type ReaderCondition = ConcreteCondition;
export type ReaderField = ConcreteField;
export type ReaderFragment = ConcreteFragment;
export type ReaderRootArgument = ConcreteRootArgument;
export type ReaderInlineFragment = ConcreteInlineFragment;
export type ReaderLinkedField = ConcreteLinkedField;
export type ReaderMatchField = ConcreteMatchField;
export type ReaderLiteral = ConcreteLiteral;
export type ReaderLocalArgument = ConcreteLocalArgument;
export type ReaderNode = ConcreteNode;
export type ReaderScalarField = ConcreteScalarField;
export type ReaderSelection = ConcreteSelection;
export type ReaderSplitOperation = ConcreteSplitOperation;
export type ReaderVariable = ConcreteVariable;
export type ReaderSelectableNode = ConcreteSelectableNode;
export type ReaderGeneratedNode = GeneratedNode;

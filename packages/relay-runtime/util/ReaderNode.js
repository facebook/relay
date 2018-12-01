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
  ConcreteRequest,
  ConcreteOperation,
  ConcreteCondition,
  ConcreteField,
  ConcreteFragment,
  ConcreteFragmentSpread,
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

export type ReaderArgument = ConcreteArgument;
export type ReaderArgumentDefinition = ConcreteArgumentDefinition;
export type ReaderRequest = ConcreteRequest;
export type ReaderOperation = ConcreteOperation;
export type ReaderCondition = ConcreteCondition;
export type ReaderField = ConcreteField;
export type ReaderFragment = ConcreteFragment;
export type ReaderFragmentSpread = ConcreteFragmentSpread;
export type ReaderHandle = ConcreteHandle;
export type ReaderRootArgument = ConcreteRootArgument;
export type ReaderInlineFragment = ConcreteInlineFragment;
export type ReaderLinkedField = ConcreteLinkedField;
export type ReaderMatchField = ConcreteMatchField;
export type ReaderLinkedHandle = ConcreteLinkedHandle;
export type ReaderLiteral = ConcreteLiteral;
export type ReaderLocalArgument = ConcreteLocalArgument;
export type ReaderNode = ConcreteNode;
export type ReaderScalarField = ConcreteScalarField;
export type ReaderScalarHandle = ConcreteScalarHandle;
export type ReaderSelection = ConcreteSelection;
export type ReaderSplitOperation = ConcreteSplitOperation;
export type ReaderVariable = ConcreteVariable;
export type ReaderSelectableNode = ConcreteSelectableNode;
export type ReaderGeneratedNode = GeneratedNode;

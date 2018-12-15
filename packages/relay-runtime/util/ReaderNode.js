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

export type ReaderFragmentSpread = {|
  +kind: 'FragmentSpread',
  +name: string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
|};

export type ReaderFragment = {|
  +kind: 'Fragment',
  +name: string,
  +type: string,
  +metadata: ?{+[key: string]: mixed},
  +argumentDefinitions: $ReadOnlyArray<ReaderArgumentDefinition>,
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderArgument = ReaderLiteral | ReaderVariable;

export type ReaderArgumentDefinition = ReaderLocalArgument | ReaderRootArgument;

export type ReaderCondition = {|
  +kind: 'Condition',
  +passingValue: boolean,
  +condition: string,
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderField =
  | ReaderScalarField
  | ReaderLinkedField
  | ReaderMatchField;

export type ReaderRootArgument = {|
  +kind: 'RootArgument',
  +name: string,
  +type: ?string,
|};

export type ReaderInlineFragment = {|
  +kind: 'InlineFragment',
  +selections: $ReadOnlyArray<ReaderSelection>,
  +type: string,
|};

export type ReaderLinkedField = {|
  +kind: 'LinkedField',
  +alias: ?string,
  +name: string,
  +storageKey: ?string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
  +concreteType: ?string,
  +plural: boolean,
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderMatchField = {|
  +kind: 'MatchField',
  +alias: ?string,
  +name: string,
  +storageKey: ?string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
  +matchesByType: {
    +[key: string]: {|
      +fragmentPropName: string,
      +fragmentName: string,
    |},
  },
|};

export type ReaderLiteral = {|
  +kind: 'Literal',
  +name: string,
  +type: ?string,
  +value: mixed,
|};

export type ReaderLocalArgument = {|
  +kind: 'LocalArgument',
  +name: string,
  +type: string,
  +defaultValue: mixed,
|};

export type ReaderNode =
  | ReaderCondition
  | ReaderLinkedField
  | ReaderFragment
  | ReaderInlineFragment
  | ReaderSplitOperation;

export type ReaderScalarField = {|
  +kind: 'ScalarField',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
  +storageKey: ?string,
|};

export type ReaderSelection =
  | ReaderCondition
  | ReaderField
  | ReaderFragmentSpread
  | ReaderInlineFragment
  | ReaderMatchField;

export type ReaderSplitOperation = {
  +kind: 'SplitOperation',
  +name: string,
  +metadata: ?{+[key: string]: mixed},
  +selections: $ReadOnlyArray<ReaderSelection>,
};

export type ReaderVariable = {|
  +kind: 'Variable',
  +name: string,
  +type: ?string,
  +variableName: string,
|};

export type ReaderSelectableNode = ReaderFragment | ReaderSplitOperation;

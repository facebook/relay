/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

'use strict';

import type {ConnectionFieldResolver} from './RelayRuntimeTypes';

/**
 * Represents a single operation used to processing and normalize runtime
 * request results.
 */
export type NormalizationOperation = {|
  +kind: 'Operation',
  +name: string,
  +argumentDefinitions: $ReadOnlyArray<NormalizationLocalArgumentDefinition>,
  +selections: $ReadOnlyArray<NormalizationSelection>,
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
  // T45504512: new connection model
  // NOTE: this property is optional because it's expected to be rarely used
  +dynamicKey?: ?NormalizationArgument,
  +filters: ?$ReadOnlyArray<string>,
|};

export type NormalizationScalarHandle = {|
  +kind: 'ScalarHandle',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +handle: string,
  +key: string,
  // T45504512: new connection model
  // NOTE: this property is optional because it's expected to be rarely used
  +dynamicKey?: ?NormalizationArgument,
  +filters: ?$ReadOnlyArray<string>,
|};

export type NormalizationArgument =
  | NormalizationLiteral
  | NormalizationVariable;

export type NormalizationCondition = {|
  +kind: 'Condition',
  +passingValue: boolean,
  +condition: string,
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationClientExtension = {|
  +kind: 'ClientExtension',
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationField =
  | NormalizationScalarField
  | NormalizationLinkedField
  | NormalizationConnectionField;

export type NormalizationInlineFragment = {|
  +kind: 'InlineFragment',
  +selections: $ReadOnlyArray<NormalizationSelection>,
  +type: string,
|};

export type NormalizationLinkedField = {|
  +kind: 'LinkedField',
  +alias: ?string,
  +name: string,
  +storageKey: ?string,
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +concreteType: ?string,
  +plural: boolean,
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationConnectionField = {|
  +kind: 'ConnectionField',
  +alias: ?string,
  +label: string,
  +name: string,
  +resolver: ConnectionFieldResolver,
  +storageKey: ?string,
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +concreteType: ?string,
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationModuleImport = {|
  +kind: 'ModuleImport',
  +documentName: string,
  +fragmentPropName: string,
  +fragmentName: string,
|};

export type NormalizationLiteral = {|
  +kind: 'Literal',
  +name: string,
  +type?: ?string,
  +value: mixed,
|};

export type NormalizationLocalArgumentDefinition = {|
  +kind: 'LocalArgument',
  +name: string,
  +type: string,
  +defaultValue: mixed,
|};

export type NormalizationNode =
  | NormalizationClientExtension
  | NormalizationCondition
  | NormalizationDefer
  | NormalizationLinkedField
  | NormalizationConnectionField
  | NormalizationInlineFragment
  | NormalizationOperation
  | NormalizationSplitOperation
  | NormalizationStream;

export type NormalizationScalarField = {|
  +kind: 'ScalarField',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<NormalizationArgument>,
  +storageKey: ?string,
|};

export type NormalizationSelection =
  | NormalizationCondition
  | NormalizationClientExtension
  | NormalizationDefer
  | NormalizationField
  | NormalizationHandle
  | NormalizationInlineFragment
  | NormalizationModuleImport
  | NormalizationStream;

export type NormalizationSplitOperation = {|
  +kind: 'SplitOperation',
  +name: string,
  +metadata: ?{+[key: string]: mixed},
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationStream = {|
  +if: string | null,
  +kind: 'Stream',
  +label: string,
  +metadata: ?{+[key: string]: mixed},
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationDefer = {|
  +if: string | null,
  +kind: 'Defer',
  +label: string,
  +metadata: ?{+[key: string]: mixed},
  +selections: $ReadOnlyArray<NormalizationSelection>,
|};

export type NormalizationVariable = {|
  +kind: 'Variable',
  +name: string,
  +type?: ?string,
  +variableName: string,
|};

export type NormalizationSelectableNode =
  | NormalizationDefer
  | NormalizationLinkedField
  | NormalizationConnectionField
  | NormalizationOperation
  | NormalizationSplitOperation
  | NormalizationStream;

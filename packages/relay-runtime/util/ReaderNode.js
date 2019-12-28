/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

// flowlint ambiguous-object-type:error

'use strict';

import type {ConnectionMetadata} from '../handlers/connection/RelayConnectionHandler';
import type {ConcreteRequest} from './RelayConcreteNode';

export type ReaderFragmentSpread = {|
  +kind: 'FragmentSpread',
  +name: string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
|};

export type ReaderInlineDataFragmentSpread = {|
  +kind: 'InlineDataFragmentSpread',
  +name: string,
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderFragment = {|
  +kind: 'Fragment',
  +name: string,
  +type: string,
  +metadata: ?{|
    +connection?: $ReadOnlyArray<ConnectionMetadata>,
    +mask?: boolean,
    +plural?: boolean,
    +refetch?: ReaderRefetchMetadata,
  |},
  +argumentDefinitions: $ReadOnlyArray<ReaderArgumentDefinition>,
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

// Marker type for a @refetchable fragment
export type ReaderRefetchableFragment = {|
  ...ReaderFragment,
  +metadata: {|
    +connection?: [ConnectionMetadata],
    +refetch: ReaderRefetchMetadata,
  |},
|};

// Marker Type for a @refetchable fragment with a single use of @connection
export type ReaderPaginationFragment = {|
  ...ReaderFragment,
  +metadata: {|
    +connection: [ConnectionMetadata],
    +refetch: {|
      ...ReaderRefetchMetadata,
      connection: ReaderPaginationMetadata,
    |},
  |},
|};

export type ReaderRefetchMetadata = {|
  +connection: ?ReaderPaginationMetadata,
  +operation: string | ConcreteRequest,
  +fragmentPathInResult: Array<string>,
|};

// Stricter form of ConnectionMetadata
export type ReaderPaginationMetadata = {|
  +backward: {|
    +count: string,
    +cursor: string,
  |} | null,
  +forward: {|
    +count: string,
    +cursor: string,
  |} | null,
  +path: $ReadOnlyArray<string>,
|};

export type ReaderInlineDataFragment = {|
  +kind: 'InlineDataFragment',
  +name: string,
|};

export type ReaderArgument =
  | ReaderListValueArgument
  | ReaderLiteralArgument
  | ReaderObjectValueArgument
  | ReaderVariableArgument;

export type ReaderArgumentDefinition = ReaderLocalArgument | ReaderRootArgument;

export type ReaderCondition = {|
  +kind: 'Condition',
  +passingValue: boolean,
  +condition: string,
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderClientExtension = {|
  +kind: 'ClientExtension',
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderField = ReaderScalarField | ReaderLinkedField;

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

export type ReaderConnection = {|
  +kind: 'Connection',
  +label: string,
  +name: string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
  +edges: ReaderLinkedField,
  +pageInfo: ReaderLinkedField,
|};

export type ReaderModuleImport = {|
  +kind: 'ModuleImport',
  +documentName: string,
  +fragmentPropName: string,
  +fragmentName: string,
|};

export type ReaderListValueArgument = {|
  +kind: 'ListValue',
  +name: string,
  +items: $ReadOnlyArray<ReaderArgument | null>,
|};

export type ReaderLiteralArgument = {|
  +kind: 'Literal',
  +name: string,
  +type?: ?string,
  +value: mixed,
|};

export type ReaderLocalArgument = {|
  +kind: 'LocalArgument',
  +name: string,
  +type: string,
  +defaultValue: mixed,
|};

export type ReaderObjectValueArgument = {|
  +kind: 'ObjectValue',
  +name: string,
  +fields: $ReadOnlyArray<ReaderArgument>,
|};

export type ReaderNode =
  | ReaderCondition
  | ReaderLinkedField
  | ReaderFragment
  | ReaderInlineFragment;

export type ReaderScalarField = {|
  +kind: 'ScalarField',
  +alias: ?string,
  +name: string,
  +args: ?$ReadOnlyArray<ReaderArgument>,
  +storageKey: ?string,
|};

export type ReaderDefer = {|
  +kind: 'Defer',
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderStream = {|
  +kind: 'Stream',
  +selections: $ReadOnlyArray<ReaderSelection>,
|};

export type ReaderSelection =
  | ReaderCondition
  | ReaderConnection
  | ReaderClientExtension
  | ReaderDefer
  | ReaderField
  | ReaderFragmentSpread
  | ReaderInlineDataFragmentSpread
  | ReaderInlineFragment
  | ReaderModuleImport
  | ReaderStream;

export type ReaderVariableArgument = {|
  +kind: 'Variable',
  +name: string,
  +type?: ?string,
  +variableName: string,
|};

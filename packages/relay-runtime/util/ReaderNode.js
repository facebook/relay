/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

'use strict';

import type {ConnectionMetadata} from '../handlers/connection/ConnectionHandler';
import type {NormalizationSelectableNode} from './NormalizationNode';
import type {ConcreteRequest} from './RelayConcreteNode';
import type {JSResourceReference} from 'JSResourceReference';

export type ReaderFragmentSpread = {
  +kind: 'FragmentSpread',
  +name: string,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
};

export type ReaderInlineDataFragmentSpread = {
  +kind: 'InlineDataFragmentSpread',
  +name: string,
  +selections: $ReadOnlyArray<ReaderSelection>,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +argumentDefinitions: $ReadOnlyArray<ReaderArgumentDefinition>,
};

export type ReaderFragment = {
  +kind: 'Fragment',
  +name: string,
  +type: string,
  +abstractKey?: ?string,
  +metadata?: ?{
    +connection?: $ReadOnlyArray<ConnectionMetadata>,
    // Indicates if the fragment has been annotated with `@throwOnFieldError`
    +throwOnFieldError?: boolean,
    // Indicates if the fragment has been annotated with `@catch`
    +catchTo?: CatchFieldTo,
    +hasClientEdges?: boolean,
    +mask?: boolean,
    +plural?: boolean,
    +refetch?: ReaderRefetchMetadata,
  },
  +argumentDefinitions: $ReadOnlyArray<ReaderArgumentDefinition>,
  +selections: $ReadOnlyArray<ReaderSelection>,
};

// Marker type for a @refetchable fragment
export type ReaderRefetchableFragment = {
  ...ReaderFragment,
  +metadata: {
    +connection?: [ConnectionMetadata],
    +hasClientEdges?: boolean,
    +refetch: ReaderRefetchMetadata,
  },
};

// Marker Type for a @refetchable fragment with a single use of @connection
export type ReaderPaginationFragment = {
  ...ReaderFragment,
  +metadata: {
    +connection: [ConnectionMetadata],
    +hasClientEdges?: boolean,
    +refetch: {
      ...ReaderRefetchMetadata,
      connection: ReaderPaginationMetadata,
    },
  },
};

export type RefetchableIdentifierInfo = {
  +identifierField: string,
  +identifierQueryVariableName: string,
};

export type ReaderRefetchMetadata = {
  +connection?: ?ReaderPaginationMetadata,
  +operation: string | ConcreteRequest,
  +fragmentPathInResult: Array<string>,
  +identifierInfo?: ?RefetchableIdentifierInfo,
  +edgesFragment?: ReaderFragment,
};

// Stricter form of ConnectionMetadata
export type ReaderPaginationMetadata = {
  +backward: {
    +count: string,
    +cursor: string,
  } | null,
  +forward: {
    +count: string,
    +cursor: string,
  } | null,
  +path: $ReadOnlyArray<string>,
};

export type ReaderInlineDataFragment = {
  +kind: 'InlineDataFragment',
  +name: string,
};

export type ReaderArgument =
  | ReaderListValueArgument
  | ReaderLiteralArgument
  | ReaderObjectValueArgument
  | ReaderVariableArgument;

export type ReaderArgumentDefinition = ReaderLocalArgument | ReaderRootArgument;

export type ReaderCondition = {
  +kind: 'Condition',
  +passingValue: boolean,
  +condition: string,
  +selections: $ReadOnlyArray<ReaderSelection>,
};

export type ReaderClientExtension = {
  +kind: 'ClientExtension',
  +selections: $ReadOnlyArray<ReaderSelection>,
};

export type ReaderField =
  | ReaderScalarField
  | ReaderLinkedField
  | ReaderRelayResolver
  | ReaderRelayLiveResolver;

export type ReaderRootArgument = {
  +kind: 'RootArgument',
  +name: string,
};

export type ReaderInlineFragment = {
  +kind: 'InlineFragment',
  +selections: $ReadOnlyArray<ReaderSelection>,
  +type: ?string,
  +abstractKey?: ?string,
};

export type ReaderAliasedInlineFragmentSpread = {
  +kind: 'AliasedInlineFragmentSpread',
  +name: string,
  +fragment: ReaderInlineFragment,
};

export type ReaderLinkedField = {
  +kind: 'LinkedField',
  +alias?: ?string,
  +name: string,
  +storageKey?: ?string,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +concreteType?: ?string,
  +plural: boolean,
  +selections: $ReadOnlyArray<ReaderSelection>,
};

export type ReaderActorChange = {
  +kind: 'ActorChange',
  +alias?: ?string,
  +name: string,
  +storageKey?: ?string,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +fragmentSpread: ReaderFragmentSpread,
};

export type ReaderModuleImport = {
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +kind: 'ModuleImport',
  +documentName: string,
  +fragmentPropName: string,
  +fragmentName: string,
  +componentModuleProvider?: () =>
    | mixed
    | Promise<mixed>
    | JSResourceReference<mixed>,
};

export type ReaderListValueArgument = {
  +kind: 'ListValue',
  +name: string,
  +items: $ReadOnlyArray<ReaderArgument | null>,
};

export type ReaderLiteralArgument = {
  +kind: 'Literal',
  +name: string,
  +type?: ?string,
  +value: mixed,
};

export type ReaderLocalArgument = {
  +kind: 'LocalArgument',
  +name: string,
  +defaultValue: mixed,
};

export type ReaderObjectValueArgument = {
  +kind: 'ObjectValue',
  +name: string,
  +fields: $ReadOnlyArray<ReaderArgument>,
};

export type ReaderNode =
  | ReaderCondition
  | ReaderLinkedField
  | ReaderFragment
  | ReaderInlineFragment;

export type ReaderScalarField = {
  +kind: 'ScalarField',
  +alias?: ?string,
  +name: string,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +storageKey?: ?string,
};

export type ReaderDefer = {
  +kind: 'Defer',
  +selections: $ReadOnlyArray<ReaderSelection>,
};

export type ReaderStream = {
  +kind: 'Stream',
  +selections: $ReadOnlyArray<ReaderSelection>,
};

export type RequiredFieldAction = 'NONE' | 'LOG' | 'THROW';

export type ReaderRequiredField = {
  +kind: 'RequiredField',
  +field: ReaderField | ReaderClientEdge,
  +action: RequiredFieldAction,
  // TODO: This field is not used any more, we should be able to remove it.
  +path?: mixed,
};

export type CatchFieldTo = 'RESULT' | 'NULL';

export type ReaderCatchField = {
  +kind: 'CatchField',
  +field: ReaderField | ReaderClientEdge | ReaderAliasedInlineFragmentSpread,
  +to: CatchFieldTo,
  // TODO: This field is not used any more, we should be able to remove it.
  +path?: mixed,
};

export type ResolverFunction = (...args: Array<any>) => mixed; // flowlint-line unclear-type:off
// With ES6 imports, a resolver function might be exported under the `default` key.
export type ResolverModule = ResolverFunction | {default: ResolverFunction};

export type ResolverNormalizationInfo =
  | ResolverOutputTypeNormalizationInfo
  | ResolverWeakModelNormalizationInfo;

export type ResolverOutputTypeNormalizationInfo = {
  +kind: 'OutputType',
  +concreteType: string | null,
  +plural: boolean,
  +normalizationNode: NormalizationSelectableNode,
};

export type ResolverWeakModelNormalizationInfo = {
  +kind: 'WeakModel',
  +concreteType: string | null,
  +plural: boolean,
};

export type ReaderRelayResolver = {
  +kind: 'RelayResolver',
  +alias?: ?string,
  +name: string,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +fragment?: ?ReaderFragmentSpread,
  +path: string,
  +resolverModule: ResolverModule,
  +normalizationInfo?: ResolverNormalizationInfo,
};

export type ReaderRelayLiveResolver = {
  +kind: 'RelayLiveResolver',
  +alias?: ?string,
  +name: string,
  +args?: ?$ReadOnlyArray<ReaderArgument>,
  +fragment?: ?ReaderFragmentSpread,
  +path: string,
  +resolverModule: ResolverModule,
  +normalizationInfo?: ResolverNormalizationInfo,
};

export type ReaderClientEdgeToClientObject = {
  +kind: 'ClientEdgeToClientObject',
  +concreteType: string | null,
  +modelResolvers: {
    [string]: ReaderRelayResolver | ReaderRelayLiveResolver,
  } | null,
  +linkedField: ReaderLinkedField,
  +backingField:
    | ReaderRelayResolver
    | ReaderRelayLiveResolver
    | ReaderClientExtension,
};

export type ReaderClientEdgeToServerObject = {
  +kind: 'ClientEdgeToServerObject',
  +linkedField: ReaderLinkedField,
  +operation: ConcreteRequest,
  +backingField:
    | ReaderRelayResolver
    | ReaderRelayLiveResolver
    | ReaderClientExtension,
};

export type ReaderClientEdge =
  | ReaderClientEdgeToClientObject
  | ReaderClientEdgeToServerObject;

export type ReaderSelection =
  | ReaderCondition
  | ReaderClientEdge
  | ReaderClientExtension
  | ReaderDefer
  | ReaderField
  | ReaderActorChange
  | ReaderFragmentSpread
  | ReaderInlineDataFragmentSpread
  | ReaderAliasedInlineFragmentSpread
  | ReaderInlineFragment
  | ReaderModuleImport
  | ReaderStream
  | ReaderCatchField
  | ReaderRequiredField
  | ReaderRelayResolver;

export type ReaderVariableArgument = {
  +kind: 'Variable',
  +name: string,
  +type?: ?string,
  +variableName: string,
};

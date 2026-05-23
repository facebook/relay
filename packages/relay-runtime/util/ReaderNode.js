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
  readonly kind: 'FragmentSpread',
  readonly name: string,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
};

export type ReaderInlineDataFragmentSpread = {
  readonly kind: 'InlineDataFragmentSpread',
  readonly name: string,
  readonly selections: ReadonlyArray<ReaderSelection>,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly argumentDefinitions: ReadonlyArray<ReaderArgumentDefinition>,
};

export type ReaderFragment = {
  readonly kind: 'Fragment',
  readonly name: string,
  readonly type: string,
  readonly abstractKey?: ?string,
  readonly metadata?: ?{
    readonly connection?: ReadonlyArray<ConnectionMetadata>,
    // Indicates if the fragment has been annotated with `@throwOnFieldError`
    readonly throwOnFieldError?: boolean,
    // Indicates if the fragment has been annotated with `@catch`
    readonly catchTo?: CatchFieldTo,
    readonly hasClientEdges?: boolean,
    readonly mask?: boolean,
    readonly plural?: boolean,
    readonly refetch?: ReaderRefetchMetadata,
    readonly vultureHash?: string,
  },
  readonly argumentDefinitions: ReadonlyArray<ReaderArgumentDefinition>,
  readonly selections: ReadonlyArray<ReaderSelection>,
};

// Marker type for a @refetchable fragment
export type ReaderRefetchableFragment = {
  ...ReaderFragment,
  readonly metadata: {
    readonly connection?: [ConnectionMetadata],
    readonly hasClientEdges?: boolean,
    readonly refetch: ReaderRefetchMetadata,
  },
};

// Marker Type for a @refetchable fragment with a single use of @connection
export type ReaderPaginationFragment = {
  ...ReaderFragment,
  readonly metadata: {
    readonly connection: [ConnectionMetadata],
    readonly hasClientEdges?: boolean,
    readonly refetch: {
      ...ReaderRefetchMetadata,
      connection: ReaderPaginationMetadata,
    },
  },
};

export type RefetchableIdentifierInfo = {
  readonly identifierField: string,
  readonly identifierQueryVariableName: string,
};

export type ReaderRefetchMetadata = {
  readonly connection?: ?ReaderPaginationMetadata,
  readonly operation: string | ConcreteRequest,
  readonly fragmentPathInResult: Array<string>,
  readonly identifierInfo?: ?RefetchableIdentifierInfo,
  readonly edgesFragment?: ReaderFragment,
};

// Stricter form of ConnectionMetadata
export type ReaderPaginationMetadata = {
  readonly backward: {
    readonly count: string,
    readonly cursor: string,
  } | null,
  readonly forward: {
    readonly count: string,
    readonly cursor: string,
  } | null,
  readonly path: ReadonlyArray<string>,
};

export type ReaderInlineDataFragment = {
  readonly kind: 'InlineDataFragment',
  readonly name: string,
};

export type ReaderArgument =
  | ReaderListValueArgument
  | ReaderLiteralArgument
  | ReaderObjectValueArgument
  | ReaderVariableArgument;

export type ReaderArgumentDefinition = ReaderLocalArgument | ReaderRootArgument;

export type ReaderCondition = {
  readonly kind: 'Condition',
  readonly passingValue: boolean,
  readonly condition: string,
  readonly selections: ReadonlyArray<ReaderSelection>,
};

export type ReaderClientExtension = {
  readonly kind: 'ClientExtension',
  readonly selections: ReadonlyArray<ReaderSelection>,
};

export type ReaderField =
  | ReaderScalarField
  | ReaderLinkedField
  | ReaderRelayResolver
  | ReaderRelayLiveResolver;

export type ReaderRootArgument = {
  readonly kind: 'RootArgument',
  readonly name: string,
};

export type ReaderInlineFragment = {
  readonly kind: 'InlineFragment',
  readonly selections: ReadonlyArray<ReaderSelection>,
  readonly type: ?string,
  readonly abstractKey?: ?string,
};

export type ReaderAliasedInlineFragmentSpread = {
  readonly kind: 'AliasedInlineFragmentSpread',
  readonly name: string,
  readonly fragment: ReaderInlineFragment,
};

export type ReaderLinkedField = {
  readonly kind: 'LinkedField',
  readonly alias?: ?string,
  readonly name: string,
  readonly storageKey?: ?string,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly concreteType?: ?string,
  readonly plural: boolean,
  readonly selections: ReadonlyArray<ReaderSelection>,
};

export type ReaderActorChange = {
  readonly kind: 'ActorChange',
  readonly alias?: ?string,
  readonly name: string,
  readonly storageKey?: ?string,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly fragmentSpread: ReaderFragmentSpread,
};

export type ReaderModuleImport = {
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly kind: 'ModuleImport',
  readonly documentName: string,
  readonly fragmentPropName: string,
  readonly fragmentName: string,
  readonly componentModuleProvider?: () =>
    | unknown
    | Promise<unknown>
    | JSResourceReference<unknown>,
};

export type ReaderListValueArgument = {
  readonly kind: 'ListValue',
  readonly name: string,
  readonly items: ReadonlyArray<ReaderArgument | null>,
};

export type ReaderLiteralArgument = {
  readonly kind: 'Literal',
  readonly name: string,
  readonly type?: ?string,
  readonly value: unknown,
};

export type ReaderLocalArgument = {
  readonly kind: 'LocalArgument',
  readonly name: string,
  readonly defaultValue: unknown,
};

export type ReaderObjectValueArgument = {
  readonly kind: 'ObjectValue',
  readonly name: string,
  readonly fields: ReadonlyArray<ReaderArgument>,
};

export type ReaderNode =
  | ReaderCondition
  | ReaderLinkedField
  | ReaderFragment
  | ReaderInlineFragment;

export type ReaderScalarField = {
  readonly kind: 'ScalarField',
  readonly alias?: ?string,
  readonly name: string,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly storageKey?: ?string,
};

export type ReaderDefer = {
  readonly kind: 'Defer',
  readonly selections: ReadonlyArray<ReaderSelection>,
};

export type ReaderStream = {
  readonly kind: 'Stream',
  readonly selections: ReadonlyArray<ReaderSelection>,
};

export type RequiredFieldAction = 'NONE' | 'LOG' | 'THROW';

export type ReaderRequiredField = {
  readonly kind: 'RequiredField',
  readonly field: ReaderField | ReaderClientEdge,
  readonly action: RequiredFieldAction,
  // TODO: This field is not used any more, we should be able to remove it.
  readonly path?: unknown,
};

export type CatchFieldTo = 'RESULT' | 'NULL';

export type ReaderCatchField = {
  readonly kind: 'CatchField',
  readonly field:
    | ReaderField
    | ReaderClientEdge
    | ReaderAliasedInlineFragmentSpread,
  readonly to: CatchFieldTo,
  // TODO: This field is not used any more, we should be able to remove it.
  readonly path?: unknown,
};

export type ResolverFunction = (...args: Array<any>) => unknown; // flowlint-line unclear-type:off
// With ES6 imports, a resolver function might be exported under the `default` key.
export type ResolverModule = ResolverFunction | {default: ResolverFunction};

export type ResolverNormalizationInfo =
  | ResolverOutputTypeNormalizationInfo
  | ResolverWeakModelNormalizationInfo;

export type ResolverOutputTypeNormalizationInfo = {
  readonly kind: 'OutputType',
  readonly concreteType: string | null,
  readonly plural: boolean,
  readonly normalizationNode: NormalizationSelectableNode,
};

export type ResolverWeakModelNormalizationInfo = {
  readonly kind: 'WeakModel',
  readonly concreteType: string | null,
  readonly plural: boolean,
};

export type ReaderRelayResolver = {
  readonly kind: 'RelayResolver',
  readonly alias?: ?string,
  readonly name: string,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly fragment?: ?ReaderFragmentSpread,
  readonly path: string,
  readonly resolverModule: ResolverModule,
  readonly normalizationInfo?: ResolverNormalizationInfo,
};

export type ReaderRelayLiveResolver = {
  readonly kind: 'RelayLiveResolver',
  readonly alias?: ?string,
  readonly name: string,
  readonly args?: ?ReadonlyArray<ReaderArgument>,
  readonly fragment?: ?ReaderFragmentSpread,
  readonly path: string,
  readonly resolverModule: ResolverModule,
  readonly normalizationInfo?: ResolverNormalizationInfo,
};

export type ReaderClientEdgeToClientObject = {
  readonly kind: 'ClientEdgeToClientObject',
  readonly concreteType: string | null,
  readonly modelResolvers: {
    [string]: ReaderRelayResolver | ReaderRelayLiveResolver,
  } | null,
  readonly serverObjectOperations?: {[string]: ConcreteRequest} | null,
  readonly linkedField: ReaderLinkedField,
  readonly backingField:
    | ReaderRelayResolver
    | ReaderRelayLiveResolver
    | ReaderClientExtension,
};

export type ReaderClientEdgeToServerObject = {
  readonly kind: 'ClientEdgeToServerObject',
  readonly linkedField: ReaderLinkedField,
  readonly operation: ConcreteRequest,
  readonly backingField:
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
  readonly kind: 'Variable',
  readonly name: string,
  readonly type?: ?string,
  readonly variableName: string,
};

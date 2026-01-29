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

import type {ResolverFunction, ResolverModule} from './ReaderNode';
import type {ConcreteRequest, ProvidedVariableType} from './RelayConcreteNode';
import type {JSResourceReference} from 'JSResourceReference';

/**
 * Represents a single operation used to processing and normalize runtime
 * request results.
 */
export type NormalizationOperation = {
  +kind: 'Operation',
  +name: string,
  +argumentDefinitions: ReadonlyArray<NormalizationLocalArgumentDefinition>,
  +selections: ReadonlyArray<NormalizationSelection>,
  +clientAbstractTypes?: {
    +[string]: ReadonlyArray<string>,
  },
  +use_exec_time_resolvers?: boolean,
  +exec_time_resolvers_enabled_provider?: ProvidedVariableType,
  +use_experimental_provider?: ProvidedVariableType,
};

export type NormalizationHandle =
  | NormalizationScalarHandle
  | NormalizationLinkedHandle;

export type NormalizationLinkedHandle = {
  +kind: 'LinkedHandle',
  +alias?: ?string,
  +name: string,
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +handle: string,
  +key: string,
  // NOTE: this property is optional because it's expected to be rarely used
  +dynamicKey?: ?NormalizationArgument,
  +filters?: ?ReadonlyArray<string>,
  +handleArgs?: ReadonlyArray<NormalizationArgument>,
};

export type NormalizationScalarHandle = {
  +kind: 'ScalarHandle',
  +alias?: ?string,
  +name: string,
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +handle: string,
  +key: string,
  // NOTE: this property is optional because it's expected to be rarely used
  +dynamicKey?: ?NormalizationArgument,
  +filters?: ?ReadonlyArray<string>,
  +handleArgs?: ReadonlyArray<NormalizationArgument>,
};

export type NormalizationArgument =
  | NormalizationListValueArgument
  | NormalizationLiteralArgument
  | NormalizationObjectValueArgument
  | NormalizationVariableArgument;

export type NormalizationCondition = {
  +kind: 'Condition',
  +passingValue: boolean,
  +condition: string,
  +selections: ReadonlyArray<NormalizationSelection>,
};

export type NormalizationClientExtension = {
  +kind: 'ClientExtension',
  +selections: ReadonlyArray<NormalizationSelection>,
};

export type NormalizationField =
  | NormalizationResolverField
  | NormalizationLiveResolverField
  | NormalizationScalarField
  | NormalizationLinkedField;

export type NormalizationInlineFragment = {
  +kind: 'InlineFragment',
  +selections: ReadonlyArray<NormalizationSelection>,
  +type: string,
  +abstractKey?: ?string,
};

export type NormalizationFragmentSpread = {
  +kind: 'FragmentSpread',
  +fragment: NormalizationSplitOperation,
  +args?: ?ReadonlyArray<NormalizationArgument>,
};

export type NormalizationLinkedField = {
  +kind: 'LinkedField',
  +alias?: ?string,
  +name: string,
  +storageKey?: ?string,
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +concreteType?: ?string,
  +plural: boolean,
  +selections: ReadonlyArray<NormalizationSelection>,
};

export type NormalizationActorChange = {
  +kind: 'ActorChange',
  +linkedField: NormalizationLinkedField,
};

export type NormalizationModuleImport = {
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +kind: 'ModuleImport',
  +documentName: string,
  +fragmentPropName: string,
  +fragmentName: string,
  +componentModuleProvider?: () =>
    | unknown
    | Promise<unknown>
    | JSResourceReference<unknown>,
  +operationModuleProvider?: () =>
    | NormalizationRootNode
    | Promise<NormalizationRootNode>
    | JSResourceReference<NormalizationRootNode>,
};

export type NormalizationListValueArgument = {
  +kind: 'ListValue',
  +name: string,
  +items: ReadonlyArray<NormalizationArgument | null>,
};

export type NormalizationLiteralArgument = {
  +kind: 'Literal',
  +name: string,
  +type?: ?string,
  +value: unknown,
};

export type NormalizationLocalArgumentDefinition = {
  +kind: 'LocalArgument',
  +name: string,
  +defaultValue: unknown,
};

export type NormalizationNode =
  | NormalizationClientExtension
  | NormalizationCondition
  | NormalizationDefer
  | NormalizationInlineFragment
  | NormalizationLinkedField
  | NormalizationOperation
  | NormalizationSplitOperation
  | NormalizationStream;

export type NormalizationScalarField = {
  +kind: 'ScalarField',
  +alias?: ?string,
  +name: string,
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +storageKey?: ?string,
};

export type ResolverReference = {
  +fieldType: string,
  +resolverFunctionName: string,
};

export type ResolverInfo = {
  +resolverFunction: ResolverFunction,
  +rootFragment?: ?NormalizationSplitOperation,
};

type ResolverData =
  | {+resolverModule?: ResolverModule}
  | {+resolverReference?: ResolverReference}
  | {+resolverInfo?: ResolverInfo};

export type NormalizationResolverField = {
  +kind: 'RelayResolver',
  +name: string,
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +fragment?: ?NormalizationInlineFragment,
  +storageKey?: ?string,
  +isOutputType: boolean,
  ...ResolverData,
};

export type NormalizationLiveResolverField = {
  +kind: 'RelayLiveResolver',
  +name: string,
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +fragment?: ?NormalizationInlineFragment,
  +storageKey?: ?string,
  +isOutputType: boolean,
  ...ResolverData,
};

export type NormalizationModelResolvers = {
  [string]: {
    +resolverModule: ResolverModule,
  },
};

export type NormalizationClientEdgeToClientObject = {
  +kind: 'ClientEdgeToClientObject',
  +linkedField: NormalizationLinkedField,
  +backingField: NormalizationResolverField | NormalizationLiveResolverField,
  +modelResolvers?: NormalizationModelResolvers | null,
};

export type NormalizationClientComponent = {
  +args?: ?ReadonlyArray<NormalizationArgument>,
  +kind: 'ClientComponent',
  +fragment: NormalizationNode,
};

export type NormalizationTypeDiscriminator = {
  +kind: 'TypeDiscriminator',
  +abstractKey: string,
};

export type NormalizationSelection =
  | NormalizationCondition
  | NormalizationClientComponent
  | NormalizationClientExtension
  | NormalizationClientEdgeToClientObject
  | NormalizationDefer
  | NormalizationField
  | NormalizationFragmentSpread
  | NormalizationHandle
  | NormalizationInlineFragment
  | NormalizationModuleImport
  | NormalizationStream
  | NormalizationActorChange
  | NormalizationTypeDiscriminator;

export type NormalizationSplitOperation = {
  +argumentDefinitions?: ReadonlyArray<NormalizationLocalArgumentDefinition>,
  +kind: 'SplitOperation',
  +name: string,
  +metadata?: ?{+[key: string]: unknown, ...},
  +selections: ReadonlyArray<NormalizationSelection>,
};

export type NormalizationStream = {
  +if: string | null,
  +kind: 'Stream',
  +label: string,
  +selections: ReadonlyArray<NormalizationSelection>,
};

export type NormalizationDefer = {
  +if: string | null,
  +kind: 'Defer',
  +label: string,
  +selections: ReadonlyArray<NormalizationSelection>,
};

export type NormalizationVariableArgument = {
  +kind: 'Variable',
  +name: string,
  +type?: ?string,
  +variableName: string,
};

export type NormalizationObjectValueArgument = {
  +kind: 'ObjectValue',
  +name: string,
  +fields: ReadonlyArray<NormalizationArgument>,
};

export type NormalizationSelectableNode =
  | NormalizationDefer
  | NormalizationLinkedField
  | NormalizationOperation
  | NormalizationSplitOperation
  | NormalizationStream;

export type NormalizationRootNode =
  | ConcreteRequest
  | NormalizationSplitOperation;

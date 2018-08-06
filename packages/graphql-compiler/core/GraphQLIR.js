/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

import type {
  GraphQLCompositeType,
  GraphQLOutputType,
  GraphQLInputType,
  GraphQLLeafType,
  GraphQLList,
  GraphQLNonNull,
} from 'graphql';

export type Argument = {
  kind: 'Argument',
  metadata: ?{[key: string]: mixed},
  name: string,
  type: ?GraphQLInputType,
  value: ArgumentValue,
};
export type ArgumentDefinition =
  | LocalArgumentDefinition
  | RootArgumentDefinition;
export type ArgumentDependency = {
  argumentName: string,
  fromName: string,
  fromPath: string,
  ifList?: 'first' | 'last' | 'all' | 'each',
  ifNull?: 'error' | 'allow' | 'skip',
  kind: 'ArgumentDependency',
  maxRecurse?: number,
};
export type ArgumentValue = ListValue | Literal | ObjectValue | Variable;
export type Batch = {
  kind: 'Batch',
  fragment: Fragment,
  metadata: {[key: string]: mixed},
  name: string,
  requests: Array<Request>,
};
export type Condition = {
  kind: 'Condition',
  condition: Literal | Variable,
  metadata: ?{[key: string]: mixed},
  passingValue: boolean,
  selections: Array<Selection>,
};
export type DeferrableFragmentSpread = {
  args: Array<Argument>,
  fragmentArgs: Array<Argument>,
  directives: Array<Directive>,
  kind: 'DeferrableFragmentSpread',
  name: string,
  rootFieldVariable: string,
  storageKey: string,
  alias: string,
};
export type DependentRequest = {
  operationName: string,
  argumentDependencies: Array<ArgumentDependency>,
};
export type Directive = {
  args: Array<Argument>,
  kind: 'Directive',
  metadata: ?{[key: string]: mixed},
  name: string,
};
export type Field = LinkedField | ScalarField;
export type Fragment = {
  argumentDefinitions: Array<ArgumentDefinition>,
  directives: Array<Directive>,
  kind: 'Fragment',
  metadata: ?{[key: string]: mixed},
  name: string,
  selections: Array<Selection>,
  type: GraphQLCompositeType,
};
export type FragmentSpread = {
  args: Array<Argument>,
  directives: Array<Directive>,
  kind: 'FragmentSpread',
  metadata: ?{[key: string]: mixed},
  name: string,
};
export type IR =
  | Argument
  | Batch
  | Condition
  | DeferrableFragmentSpread
  | Directive
  | Fragment
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | ListValue
  | Literal
  | LocalArgumentDefinition
  | ObjectFieldValue
  | ObjectValue
  | Request
  | Root
  | RootArgumentDefinition
  | ScalarField
  | Variable;
export type RootArgumentDefinition = {
  kind: 'RootArgumentDefinition',
  metadata: ?{[key: string]: mixed},
  name: string,
  type: GraphQLInputType,
};
export type InlineFragment = {
  directives: Array<Directive>,
  kind: 'InlineFragment',
  metadata: ?{[key: string]: mixed},
  selections: Array<Selection>,
  typeCondition: GraphQLCompositeType,
};
export type Handle = {
  name: string,
  key: string,
  filters: ?Array<string>,
};
export type LinkedField = {
  alias: ?string,
  args: Array<Argument>,
  directives: Array<Directive>,
  handles: ?Array<Handle>,
  kind: 'LinkedField',
  metadata: ?{[key: string]: mixed},
  name: string,
  selections: Array<Selection>,
  type: GraphQLOutputType,
};
export type ListValue = {
  kind: 'ListValue',
  items: Array<ArgumentValue>,
  metadata: ?{[key: string]: mixed},
};
export type Literal = {
  kind: 'Literal',
  metadata: ?{[key: string]: mixed},
  value: mixed,
};
export type LocalArgumentDefinition = {
  defaultValue: mixed,
  kind: 'LocalArgumentDefinition',
  metadata: ?{[key: string]: mixed},
  name: string,
  type: GraphQLInputType,
};
export type Node = Condition | Fragment | InlineFragment | LinkedField | Root;
export type ObjectFieldValue = {
  kind: 'ObjectFieldValue',
  metadata: ?{[key: string]: mixed},
  name: string,
  value: ArgumentValue,
};
export type ObjectValue = {
  kind: 'ObjectValue',
  fields: Array<ObjectFieldValue>,
  metadata: ?{[key: string]: mixed},
};
export type Request = {
  kind: 'Request',
  argumentDependencies: Array<ArgumentDependency>,
  id: ?string,
  name: string,
  root: Root,
  text: ?string,
};
export type Root = {
  argumentDefinitions: Array<LocalArgumentDefinition>,
  directives: Array<Directive>,
  dependentRequests: Array<DependentRequest>,
  kind: 'Root',
  metadata: ?{[key: string]: mixed},
  name: string,
  operation: 'query' | 'mutation' | 'subscription',
  selections: Array<Selection>,
  type: GraphQLCompositeType,
};
export type ScalarFieldType =
  | GraphQLLeafType
  | GraphQLList<ScalarFieldType>
  | GraphQLNonNull<GraphQLLeafType | GraphQLList<ScalarFieldType>>;
export type ScalarField = {
  alias: ?string,
  args: Array<Argument>,
  directives: Array<Directive>,
  handles: ?Array<Handle>,
  kind: 'ScalarField',
  metadata: ?{[key: string]: mixed},
  name: string,
  type: ScalarFieldType,
};
export type Selection =
  | Condition
  | DeferrableFragmentSpread
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | ScalarField;
export type Variable = {
  kind: 'Variable',
  metadata: ?{[key: string]: mixed},
  variableName: string,
  type: ?GraphQLInputType,
};

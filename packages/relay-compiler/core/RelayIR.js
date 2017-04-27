/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayIR
 * @flow
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
  LocalArgumentDefinition |
  RootArgumentDefinition;
export type ArgumentValue = ListValue | Literal | ObjectValue | Variable;
export type Condition = {
  kind: 'Condition',
  condition: Literal | Variable,
  metadata: ?{[key: string]: mixed},
  passingValue: boolean,
  selections: Array<Selection>,
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
  Argument |
  Condition |
  Directive |
  Fragment |
  FragmentSpread |
  InlineFragment |
  LinkedField |
  ListValue |
  Literal |
  LocalArgumentDefinition |
  ObjectFieldValue |
  ObjectValue |
  Root |
  RootArgumentDefinition |
  ScalarField |
  Variable;
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
export type Node =
  Condition |
  Fragment |
  InlineFragment |
  LinkedField |
  Root;
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
export type Root = {
  argumentDefinitions: Array<LocalArgumentDefinition>,
  directives: Array<Directive>,
  kind: 'Root',
  metadata: ?{[key: string]: mixed},
  name: string,
  operation: 'query' | 'mutation' | 'subscription',
  selections: Array<Selection>,
  type: GraphQLCompositeType,
};
export type ScalarFieldType =
  GraphQLLeafType |
  GraphQLList<ScalarFieldType> |
  GraphQLNonNull<
    GraphQLLeafType |
    GraphQLList<ScalarFieldType>
  >;
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
  Condition |
  FragmentSpread |
  InlineFragment |
  LinkedField |
  ScalarField;
export type Variable = {
  kind: 'Variable',
  metadata: ?{[key: string]: mixed},
  variableName: string,
};

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
  GraphQLCompositeType,
  GraphQLOutputType,
  GraphQLInputType,
  GraphQLLeafType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLUnionType,
} from 'graphql';

export type Argument = {|
  +kind: 'Argument',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +type: ?GraphQLInputType,
  +value: ArgumentValue,
|};
export type ArgumentDefinition =
  | LocalArgumentDefinition
  | RootArgumentDefinition;
export type ArgumentValue = ListValue | Literal | ObjectValue | Variable;
export type Condition = {|
  +kind: 'Condition',
  +condition: Literal | Variable,
  +metadata: ?{[key: string]: mixed},
  +passingValue: boolean,
  +selections: $ReadOnlyArray<Selection>,
|};
export type Directive = {|
  +args: $ReadOnlyArray<Argument>,
  +kind: 'Directive',
  +metadata: ?{[key: string]: mixed},
  +name: string,
|};
export type Field = LinkedField | ScalarField | MatchField;
export type Fragment = {|
  +argumentDefinitions: $ReadOnlyArray<ArgumentDefinition>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'Fragment',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: GraphQLCompositeType,
|};
export type FragmentSpread = {|
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'FragmentSpread',
  +metadata: ?{[key: string]: mixed},
  +name: string,
|};
export type IR =
  | Argument
  | Condition
  | Directive
  | Fragment
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | ListValue
  | Literal
  | LocalArgumentDefinition
  | MatchField
  | MatchFragmentSpread
  | ObjectFieldValue
  | ObjectValue
  | Request
  | Root
  | RootArgumentDefinition
  | ScalarField
  | Variable;
export type RootArgumentDefinition = {|
  +kind: 'RootArgumentDefinition',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +type: GraphQLInputType,
|};
export type InlineFragment = {|
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'InlineFragment',
  +metadata: ?{[key: string]: mixed},
  +selections: $ReadOnlyArray<Selection>,
  +typeCondition: GraphQLCompositeType,
|};
export type Handle = {|
  +name: string,
  +key: string,
  +filters: ?$ReadOnlyArray<string>,
|};
export type LinkedField = {|
  +alias: ?string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +handles: ?$ReadOnlyArray<Handle>,
  +kind: 'LinkedField',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: GraphQLOutputType,
|};
export type ListValue = {|
  +kind: 'ListValue',
  +items: $ReadOnlyArray<ArgumentValue>,
  +metadata: ?{[key: string]: mixed},
|};
export type Literal = {|
  +kind: 'Literal',
  +metadata: ?{[key: string]: mixed},
  +value: mixed,
|};
export type LocalArgumentDefinition = {|
  +defaultValue: mixed,
  +kind: 'LocalArgumentDefinition',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +type: GraphQLInputType,
|};
export type MatchFragmentSpread = {|
  +kind: 'MatchFragmentSpread',
  +type: ?GraphQLCompositeType,
  +module: string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +metadata: ?{[key: string]: mixed},
  +name: string,
|};
export type MatchField = {|
  +alias: ?string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +handles: ?$ReadOnlyArray<Handle>,
  +kind: 'MatchField',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +type: GraphQLUnionType | GraphQLNonNull<GraphQLUnionType>,
  +selections: $ReadOnlyArray<Selection>,
|};
export type Node =
  | Condition
  | Fragment
  | InlineFragment
  | LinkedField
  | MatchField
  | Root;
export type ObjectFieldValue = {|
  +kind: 'ObjectFieldValue',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +value: ArgumentValue,
|};
export type ObjectValue = {|
  +kind: 'ObjectValue',
  +fields: $ReadOnlyArray<ObjectFieldValue>,
  +metadata: ?{[key: string]: mixed},
|};
export type Request = {|
  +kind: 'Request',
  +fragment: Fragment,
  +id: ?string,
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +root: Root,
  +text: ?string,
|};
export type Root = {|
  +argumentDefinitions: $ReadOnlyArray<LocalArgumentDefinition>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'Root',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +operation: 'query' | 'mutation' | 'subscription',
  +selections: $ReadOnlyArray<Selection>,
  +type: GraphQLCompositeType,
|};
export type ScalarFieldType =
  | GraphQLLeafType
  | GraphQLList<ScalarFieldType>
  | GraphQLNonNull<GraphQLLeafType | GraphQLList<ScalarFieldType>>;
export type ScalarField = {|
  +alias: ?string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +handles: ?$ReadOnlyArray<Handle>,
  +kind: 'ScalarField',
  +metadata: ?{[key: string]: mixed},
  +name: string,
  +type: ScalarFieldType,
|};
export type Selection =
  | Condition
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | MatchField
  | MatchFragmentSpread
  | ScalarField;
export type Variable = {|
  +kind: 'Variable',
  +metadata: ?{[key: string]: mixed},
  +variableName: string,
  +type: ?GraphQLInputType,
|};

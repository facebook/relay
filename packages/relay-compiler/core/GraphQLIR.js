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
  Source,
} from 'graphql';

export type Metadata = ?{[key: string]: mixed};

export type SourceLocation = {|
  +kind: 'Source',
  +start: number,
  +end: number,
  +source: Source,
|};
export type GeneratedLocation = {|
  +kind: 'Generated',
|};
export type DerivedLocation = {|
  +kind: 'Derived',
  +source: Location,
|};
export type UnknownLocation = {|+kind: 'Unknown'|};

export type Location =
  | SourceLocation
  | GeneratedLocation
  | DerivedLocation
  | UnknownLocation;

export type Argument = {|
  +kind: 'Argument',
  +loc: Location,
  +metadata: Metadata,
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
  +loc: Location,
  +metadata: Metadata,
  +passingValue: boolean,
  +selections: $ReadOnlyArray<Selection>,
|};

export type Directive = {|
  +args: $ReadOnlyArray<Argument>,
  +kind: 'Directive',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
|};

export type Field = LinkedField | ScalarField | ConnectionField;

export type Fragment = {|
  +argumentDefinitions: $ReadOnlyArray<ArgumentDefinition>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'Fragment',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: GraphQLCompositeType,
|};

export type FragmentSpread = {|
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'FragmentSpread',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
|};

export type Defer = {|
  +kind: 'Defer',
  +loc: Location,
  +metadata: Metadata,
  +selections: $ReadOnlyArray<Selection>,
  +label: string,
  +if: ArgumentValue | null,
|};

export type Stream = {|
  +kind: 'Stream',
  +loc: Location,
  +metadata: Metadata,
  +selections: $ReadOnlyArray<Selection>,
  +label: string,
  +if: ArgumentValue | null,
  +initialCount: ArgumentValue,
|};

export type InlineDataFragmentSpread = {|
  +kind: 'InlineDataFragmentSpread',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
|};

export type IR =
  | Argument
  | ClientExtension
  | Condition
  | Defer
  | ConnectionField
  | Directive
  | Fragment
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | ListValue
  | Literal
  | LocalArgumentDefinition
  | ModuleImport
  | ObjectFieldValue
  | ObjectValue
  | Request
  | Root
  | RootArgumentDefinition
  | ScalarField
  | SplitOperation
  | Stream
  | InlineDataFragmentSpread
  | Variable;

export type RootArgumentDefinition = {|
  +kind: 'RootArgumentDefinition',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +type: GraphQLInputType,
|};

export type InlineFragment = {|
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'InlineFragment',
  +loc: Location,
  +metadata: Metadata,
  +selections: $ReadOnlyArray<Selection>,
  +typeCondition: GraphQLCompositeType,
|};

export type Handle = {|
  +name: string,
  +key: string,
  // T45504512: new connection model
  +dynamicKey: Variable | null,
  +filters: ?$ReadOnlyArray<string>,
|};

export type ClientExtension = {|
  +kind: 'ClientExtension',
  +loc: Location,
  +metadata: Metadata,
  +selections: $ReadOnlyArray<Selection>,
|};

export type ConnectionField = {|
  +alias: ?string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'ConnectionField',
  +label: string,
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +resolver: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: GraphQLOutputType,
|};

export type LinkedField = {|
  +alias: ?string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +handles: ?$ReadOnlyArray<Handle>,
  +kind: 'LinkedField',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: GraphQLOutputType,
|};

export type ListValue = {|
  +kind: 'ListValue',
  +items: $ReadOnlyArray<ArgumentValue>,
  +loc: Location,
  +metadata: Metadata,
|};

export type Literal = {|
  +kind: 'Literal',
  +loc: Location,
  +metadata: Metadata,
  +value: mixed,
|};

export type LocalArgumentDefinition = {|
  +defaultValue: mixed,
  +kind: 'LocalArgumentDefinition',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +type: GraphQLInputType,
|};

export type ModuleImport = {|
  +kind: 'ModuleImport',
  +loc: Location,
  // the name of the document in which the @module was defined, used to
  // namespace the result and avoid collisions between modules selected by
  // different consumers on the same record
  +documentName: string,
  // the name of the module to require
  +module: string,
  // a value that uniquely identifies this @module position in the codebase:
  // the documentName plus the relative field path of the @module within that
  // document
  +id: string,
  // the name of the original FragmentSpread on which @module was applied
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
|};

export type Node =
  | ClientExtension
  | Condition
  | Defer
  | ConnectionField
  | Fragment
  | InlineDataFragmentSpread
  | InlineFragment
  | LinkedField
  | ModuleImport
  | Root
  | SplitOperation
  | Stream;

export type ObjectFieldValue = {|
  +kind: 'ObjectFieldValue',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +value: ArgumentValue,
|};

export type ObjectValue = {|
  +kind: 'ObjectValue',
  +fields: $ReadOnlyArray<ObjectFieldValue>,
  +loc: Location,
  +metadata: Metadata,
|};

export type Request = {|
  +kind: 'Request',
  +fragment: Fragment,
  +id: ?string,
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +root: Root,
  +text: ?string,
|};

export type Root = {|
  +argumentDefinitions: $ReadOnlyArray<LocalArgumentDefinition>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'Root',
  +loc: Location,
  +metadata: Metadata,
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
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +type: ScalarFieldType,
|};

export type Selection =
  | ClientExtension
  | Condition
  | Defer
  | ConnectionField
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | ModuleImport
  | ScalarField
  | InlineDataFragmentSpread
  | Stream;

export type Definition = Fragment | Root | SplitOperation;
export type GeneratedDefinition = Fragment | Request | SplitOperation;

export type SplitOperation = {|
  +kind: 'SplitOperation',
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +loc: Location,
  +metadata: Metadata,
  +type: GraphQLCompositeType,
|};

export type Variable = {|
  +kind: 'Variable',
  +loc: Location,
  +metadata: Metadata,
  +variableName: string,
  +type: ?GraphQLInputType,
|};

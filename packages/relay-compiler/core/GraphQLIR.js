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
  LinkedFieldTypeID,
  ScalarFieldTypeID,
  CompositeTypeID,
  InputTypeID,
} from './Schema';
import type {Source} from 'graphql';

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
  +name: string,
  +type: ?InputTypeID,
  +value: ArgumentValue,
|};

export type ArgumentDefinition =
  | LocalArgumentDefinition
  | RootArgumentDefinition;

export type ArgumentValue = Literal | Variable;

export type Condition = {|
  +kind: 'Condition',
  +condition: Literal | Variable,
  +loc: Location,
  +passingValue: boolean,
  +selections: $ReadOnlyArray<Selection>,
|};

export type Directive = {|
  +args: $ReadOnlyArray<Argument>,
  +kind: 'Directive',
  +loc: Location,
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
  +type: CompositeTypeID,
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
  +metadata: ?{|
    +fragmentTypeCondition: CompositeTypeID,
  |},
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
  | Connection
  | ConnectionField
  | Defer
  | Directive
  | Fragment
  | FragmentSpread
  | InlineDataFragmentSpread
  | InlineFragment
  | LinkedField
  | Literal
  | LocalArgumentDefinition
  | ModuleImport
  | Request
  | Root
  | RootArgumentDefinition
  | ScalarField
  | SplitOperation
  | Stream
  | Variable;

export type RootArgumentDefinition = {|
  +kind: 'RootArgumentDefinition',
  +loc: Location,
  +name: string,
  +type: InputTypeID,
|};

export type InlineFragment = {|
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'InlineFragment',
  +loc: Location,
  +metadata: Metadata,
  +selections: $ReadOnlyArray<Selection>,
  +typeCondition: CompositeTypeID,
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

export type Connection = {|
  +args: $ReadOnlyArray<Argument>,
  +kind: 'Connection',
  +label: string,
  +loc: Location,
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +stream: {|
    +deferLabel: string,
    +if: ArgumentValue | null,
    +initialCount: ArgumentValue,
    +streamLabel: string,
  |} | null,
  +type: LinkedFieldTypeID,
|};

export type LinkedField = {|
  +alias: string,
  +args: $ReadOnlyArray<Argument>,
  +connection: boolean,
  +directives: $ReadOnlyArray<Directive>,
  +handles: ?$ReadOnlyArray<Handle>,
  +kind: 'LinkedField',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: LinkedFieldTypeID,
|};

export type ConnectionField = {|
  +alias: string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +kind: 'ConnectionField',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +type: LinkedFieldTypeID,
|};

export type Literal = {|
  +kind: 'Literal',
  +loc: Location,
  +value: mixed,
|};

export type LocalArgumentDefinition = {|
  +defaultValue: mixed,
  +kind: 'LocalArgumentDefinition',
  +loc: Location,
  +name: string,
  +type: InputTypeID,
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
  | Connection
  | ConnectionField
  | Defer
  | Fragment
  | InlineDataFragmentSpread
  | InlineFragment
  | LinkedField
  | ModuleImport
  | Root
  | SplitOperation
  | Stream;

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
  +type: CompositeTypeID,
|};

export type ScalarField = {|
  +alias: string,
  +args: $ReadOnlyArray<Argument>,
  +directives: $ReadOnlyArray<Directive>,
  +handles: ?$ReadOnlyArray<Handle>,
  +kind: 'ScalarField',
  +loc: Location,
  +metadata: Metadata,
  +name: string,
  +type: ScalarFieldTypeID,
|};

export type Selection =
  | ClientExtension
  | Condition
  | Connection
  | ConnectionField
  | Defer
  | FragmentSpread
  | InlineDataFragmentSpread
  | InlineFragment
  | LinkedField
  | ModuleImport
  | ScalarField
  | Stream;

export type Definition = Fragment | Root | SplitOperation;
export type GeneratedDefinition = Fragment | Request | SplitOperation;

export type SplitOperation = {|
  +kind: 'SplitOperation',
  +name: string,
  +selections: $ReadOnlyArray<Selection>,
  +loc: Location,
  +metadata: Metadata,
  +parentSources: Set<string>,
  +type: CompositeTypeID,
|};

export type Variable = {|
  +kind: 'Variable',
  +loc: Location,
  +variableName: string,
  +type: ?InputTypeID,
|};

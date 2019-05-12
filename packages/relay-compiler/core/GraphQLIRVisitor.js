/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type {
  Argument,
  ClientExtension,
  Condition,
  Defer,
  Directive,
  Fragment,
  FragmentSpread,
  InlineFragment,
  LinkedField,
  Literal,
  LocalArgumentDefinition,
  ModuleImport,
  Request,
  Root,
  RootArgumentDefinition,
  ScalarField,
  SplitOperation,
  Stream,
  Variable,
} from './GraphQLIR';

const visit = require('graphql').visit;

const NodeKeys = {
  Argument: ['value'],
  ClientExtension: ['selections'],
  Condition: ['condition', 'selections'],
  Defer: ['selections', 'if'],
  Directive: ['args'],
  Fragment: ['argumentDefinitions', 'directives', 'selections'],
  FragmentSpread: ['args', 'directives'],
  InlineFragment: ['directives', 'selections'],
  LinkedField: ['args', 'directives', 'selections'],
  Literal: [],
  LocalArgumentDefinition: [],
  ModuleImport: ['selections'],
  Request: ['fragment', 'root'],
  Root: ['argumentDefinitions', 'directives', 'selections'],
  RootArgumentDefinition: [],
  ScalarField: ['args', 'directives'],
  SplitOperation: ['selections'],
  Stream: ['selections', 'if', 'initialCount'],
  Variable: [],
};

export type VisitNode =
  | Argument
  | ClientExtension
  | Condition
  | Defer
  | Directive
  | Fragment
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | ModuleImport
  | Literal
  | LocalArgumentDefinition
  | Request
  | Root
  | RootArgumentDefinition
  | ScalarField
  | SplitOperation
  | Stream
  | Variable;

type EnterLeave<T> = {|+enter?: T, +leave?: T|};

export type VisitFn<T: VisitNode> = (
  node: T, // node we're visiting
  key?: any, // index/key to node from parent array/object
  parent?: ?(VisitNode | Array<VisitNode>), // Object immediately above node
  path?: Array<any>, // keys to get from root: [keyForChild, ..., keyForParent]
  ancestors?: Array<VisitNode | Array<VisitNode>>, // [root, child1, ..., grandparent]
  // Note: ancestors includes arrays which contain the visited node
  // These correspond to array indices in `path`.
) => any;

export type NodeVisitorObject<T: VisitNode> =
  | EnterLeave<VisitFn<T>>
  | VisitFn<T>;

export type NodeVisitor =
  | EnterLeave<{|
      Argument?: VisitFn<Argument>,
      ClientExtension?: VisitFn<ClientExtension>,
      Condition?: VisitFn<Condition>,
      Defer?: VisitFn<Defer>,
      Directive?: VisitFn<Directive>,
      Fragment?: VisitFn<Fragment>,
      FragmentSpread?: VisitFn<FragmentSpread>,
      InlineFragment?: VisitFn<InlineFragment>,
      LinkedField?: VisitFn<LinkedField>,
      Literal?: VisitFn<Literal>,
      LocalArgumentDefinition?: VisitFn<LocalArgumentDefinition>,
      ModuleImport?: VisitFn<ModuleImport>,
      Request?: VisitFn<Request>,
      Root?: VisitFn<Root>,
      RootArgumentDefinition?: VisitFn<RootArgumentDefinition>,
      ScalarField?: VisitFn<ScalarField>,
      SplitOperation?: VisitFn<SplitOperation>,
      Stream?: VisitFn<Stream>,
      Variable?: VisitFn<Variable>,
    |}>
  | {|
      Argument?: NodeVisitorObject<Argument>,
      ClientExtension?: VisitFn<ClientExtension>,
      Condition?: NodeVisitorObject<Condition>,
      Defer?: NodeVisitorObject<Defer>,
      Directive?: NodeVisitorObject<Directive>,
      Fragment?: NodeVisitorObject<Fragment>,
      FragmentSpread?: NodeVisitorObject<FragmentSpread>,
      InlineFragment?: NodeVisitorObject<InlineFragment>,
      LinkedField?: NodeVisitorObject<LinkedField>,
      Literal?: NodeVisitorObject<Literal>,
      LocalArgumentDefinition?: NodeVisitorObject<LocalArgumentDefinition>,
      ModuleImport?: NodeVisitorObject<ModuleImport>,
      Request?: NodeVisitorObject<Request>,
      Root?: NodeVisitorObject<Root>,
      RootArgumentDefinition?: NodeVisitorObject<RootArgumentDefinition>,
      ScalarField?: NodeVisitorObject<ScalarField>,
      SplitOperation?: NodeVisitorObject<SplitOperation>,
      Stream?: NodeVisitorObject<Stream>,
      Variable?: NodeVisitorObject<Variable>,
    |};

function visitIR(root: VisitNode, visitor: NodeVisitor): any {
  return (visit: $FlowFixMe)(root, visitor, NodeKeys);
}

module.exports = {visit: visitIR};

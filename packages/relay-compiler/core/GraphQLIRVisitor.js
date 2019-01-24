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

const visit = require('graphql').visit;

import type {
  Argument,
  Condition,
  Defer,
  Directive,
  Fragment,
  FragmentSpread,
  InlineFragment,
  LinkedField,
  Literal,
  LocalArgumentDefinition,
  MatchBranch,
  MatchField,
  Request,
  Root,
  RootArgumentDefinition,
  ScalarField,
  SplitOperation,
  Stream,
  Variable,
} from './GraphQLIR';

const NodeKeys = {
  Argument: ['value'],
  Condition: ['condition', 'selections'],
  Defer: ['selections', 'if'],
  Directive: ['args'],
  Fragment: ['argumentDefinitions', 'directives', 'selections'],
  FragmentSpread: ['args', 'directives'],
  InlineFragment: ['directives', 'selections'],
  LinkedField: ['args', 'directives', 'selections'],
  Literal: [],
  LocalArgumentDefinition: [],
  MatchField: ['args', 'directives', 'selections'],
  MatchBranch: ['selections'],
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
  | Condition
  | Defer
  | Directive
  | Fragment
  | FragmentSpread
  | InlineFragment
  | LinkedField
  | Literal
  | LocalArgumentDefinition
  | MatchField
  | Request
  | Root
  | RootArgumentDefinition
  | ScalarField
  | SplitOperation
  | Stream
  | Variable;

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
  | {enter?: VisitFn<T>, leave?: VisitFn<T>}
  | VisitFn<T>;

export type NodeVisitor =
  | NodeVisitorObject<VisitNode>
  | {
      Argument?: NodeVisitorObject<Argument>,
      Condition?: NodeVisitorObject<Condition>,
      Defer?: NodeVisitorObject<Defer>,
      Directive?: NodeVisitorObject<Directive>,
      Fragment?: NodeVisitorObject<Fragment>,
      FragmentSpread?: NodeVisitorObject<FragmentSpread>,
      InlineFragment?: NodeVisitorObject<InlineFragment>,
      LinkedField?: NodeVisitorObject<LinkedField>,
      Literal?: NodeVisitorObject<Literal>,
      LocalArgumentDefinition?: NodeVisitorObject<LocalArgumentDefinition>,
      MatchBranch?: NodeVisitorObject<MatchBranch>,
      MatchField?: NodeVisitorObject<MatchField>,
      Request?: NodeVisitorObject<Request>,
      Root?: NodeVisitorObject<Root>,
      RootArgumentDefinition?: NodeVisitorObject<RootArgumentDefinition>,
      ScalarField?: NodeVisitorObject<ScalarField>,
      SplitOperation?: NodeVisitorObject<SplitOperation>,
      Stream?: NodeVisitorObject<Stream>,
      Variable?: NodeVisitorObject<Variable>,
    };

function visitIR(root: VisitNode, visitor: NodeVisitor) {
  return (visit: $FlowFixMe)(root, visitor, NodeKeys);
}

module.exports = {visit: visitIR};

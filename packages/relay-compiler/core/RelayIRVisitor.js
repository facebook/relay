/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayIRVisitor
 * @flow
 */
'use strict';

const visit = require('graphql').visit;

import type {
  Argument,
  Condition,
  Directive,
  Fragment,
  FragmentSpread,
  InlineFragment,
  LinkedField,
  Literal,
  LocalArgumentDefinition,
  Root,
  RootArgumentDefinition,
  ScalarField,
  Variable,
} from 'RelayIR';

const NodeKeys = {
  Argument: ['value'],
  Condition: ['condition', 'selections'],
  Directive: ['args'],
  Fragment: ['argumentDefinitions', 'directives', 'selections'],
  FragmentSpread: ['args', 'directives'],
  InlineFragment: ['directives', 'selections'],
  LinkedField: ['args', 'directives', 'selections'],
  Literal: [],
  LocalArgumentDefinition: [],
  Root: ['argumentDefinitions', 'directives', 'selections'],
  RootArgumentDefinition: [],
  ScalarField: ['args', 'directives'],
  Variable: [],
};

export type VisitNode =
  Argument |
  Condition |
  Directive |
  Fragment |
  FragmentSpread |
  InlineFragment |
  LinkedField |
  Literal |
  LocalArgumentDefinition |
  Root |
  RootArgumentDefinition |
  ScalarField |
  Variable;

export type VisitFn<T: VisitNode> = (
  node: T, // node we're visiting
  key?: any, // index/key to node from parent array/object
  parent?: ?VisitNode, // Object immediately above node
  path?: Array<any>, // keys to get from root: [keyForChild, ..., keyForParent]
  ancestors?: Array<VisitNode>, // [root, child1, ..., grandparent]
  // Note: ancestors.length may not == path.length: path includes array indices
) => any;

export type NodeVisitorObject<T: VisitNode> =
  { enter?: VisitFn<T>, leave?: VisitFn<T> } | VisitFn<T>;

export type NodeVisitor = NodeVisitorObject<VisitNode> | {
  Argument?: NodeVisitorObject<Argument>,
  Condition?: NodeVisitorObject<Condition>,
  Directive?: NodeVisitorObject<Directive>,
  Fragment?: NodeVisitorObject<Fragment>,
  FragmentSpread?: NodeVisitorObject<FragmentSpread>,
  InlineFragment?: NodeVisitorObject<InlineFragment>,
  LinkedField?: NodeVisitorObject<LinkedField>,
  Literal?: NodeVisitorObject<Literal>,
  LocalArgumentDefinition?: NodeVisitorObject<LocalArgumentDefinition>,
  Root?: NodeVisitorObject<Root>,
  RootArgumentDefinition?: NodeVisitorObject<RootArgumentDefinition>,
  ScalarField?: NodeVisitorObject<ScalarField>,
  Variable?: NodeVisitorObject<Variable>,
};

function visitIR(root: VisitNode, visitor: NodeVisitor) {
  return visit(root, visitor, NodeKeys);
}

module.exports = {visit: visitIR};

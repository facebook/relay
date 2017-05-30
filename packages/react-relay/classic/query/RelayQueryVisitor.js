/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryVisitor
 * @flow
 * @format
 */

'use strict';

const RelayQuery = require('RelayQuery');

/**
 * @internal
 *
 * Base class for traversing a Relay Query.
 *
 * Subclasses can optionally implement methods to customize the traversal:
 *
 * - `visitField(field, state)`: Called for each field.
 * - `visitFragment(fragment, state)`: Called for each fragment.
 * - `visitQuery(fragment, state)`: Called for the top level query.
 *
 * A `state` variable is passed along to all callbacks and can be used to
 * accumulate data while traversing (effectively passing data back up the tree),
 * or modify the behavior of later callbacks (effectively passing data down the
 * tree).
 *
 * There are two additional methods for controlling the traversal:
 *
 * - `traverse(parent, state)`: Visits all children of `parent`. Subclasses
 *   may override in order to short-circuit traversal. Note that
 *   `visit{Field,Fragment,Query}` are //not// called on `parent`, as it will
 *   already have been visited by the time this method is called.
 * - `visit(child, state)`: Processes the `child` node, calling the appropriate
 *   `visit{Field,Fragment,Query}` method based on the node type.
 *
 * By convention, each of the callback methods returns the visited node. This is
 * used by the `RelayQueryTransform` subclass to implement mapping and filtering
 * behavior, but purely-visitor subclases do not need to follow this convention.
 *
 * @see RelayQueryTransform
 */
class RelayQueryVisitor<Ts> {
  visit(node: RelayQuery.Node, nextState: Ts): ?RelayQuery.Node {
    if (node instanceof RelayQuery.Field) {
      return this.visitField(node, nextState);
    } else if (node instanceof RelayQuery.Fragment) {
      return this.visitFragment(node, nextState);
    } else if (node instanceof RelayQuery.Root) {
      return this.visitRoot(node, nextState);
    }
  }

  traverse<Tn: RelayQuery.Node>(node: Tn, nextState: Ts): ?Tn {
    if (node.canHaveSubselections()) {
      this.traverseChildren(
        node,
        nextState,
        function(child) {
          this.visit(child, nextState);
        },
        this,
      );
    }
    return node;
  }

  traverseChildren(
    node: RelayQuery.Node,
    nextState: Ts,
    callback: (
      child: RelayQuery.Node,
      index: number,
      children: Array<RelayQuery.Node>,
    ) => void,
    context: any,
  ): void {
    const children = node.getChildren();
    for (let index = 0; index < children.length; index++) {
      callback.call(context, children[index], index, children);
    }
  }

  visitField(node: RelayQuery.Field, nextState: Ts): ?RelayQuery.Node {
    return this.traverse(node, nextState);
  }

  visitFragment(node: RelayQuery.Fragment, nextState: Ts): ?RelayQuery.Node {
    return this.traverse(node, nextState);
  }

  visitRoot(node: RelayQuery.Root, nextState: Ts): ?RelayQuery.Node {
    return this.traverse(node, nextState);
  }
}

module.exports = RelayQueryVisitor;

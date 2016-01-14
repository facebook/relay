/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryIndexPath
 * @typechecks
 * @flow
 */

'use strict';

const RelayQuery = require('RelayQuery');

const base62 = require('base62');
const invariant = require('invariant');

/**
 * @internal
 *
 * Index paths are used to construct serialization keys for fields (in order to
 * automatically generate unique aliases for a field with different arguments).
 *
 * NOTE: During `traverse`, instances of this are *mutable*. In order to safely
 * reference instances from outside a traversal, you must use `clone`.
 */
class RelayQueryIndexPath {
  pathStack: Array<Array<number>>;

  constructor(pathStack?: Array<Array<number>>) {
    this.pathStack = pathStack || [[]];
  }

  /**
   * Traverses over the children of `node` while mutating this instance to keep
   * track of the child indexes traversed.
   */
  traverse(
    node: RelayQuery.Node,
    callback: (
      child: RelayQuery.Node,
      index: number,
      children: Array<RelayQuery.Node>
    ) => void
  ): void {
    const pathStack = this.pathStack;
    if (node instanceof RelayQuery.Field) {
      pathStack.push([]);
    }
    const currentPath = pathStack[pathStack.length - 1];
    const children = node.getChildren();
    for (let index = 0; index < children.length; index++) {
      currentPath.push(index);
      callback(children[index], index, children);
      currentPath.pop();
    }
    if (node instanceof RelayQuery.Field) {
      pathStack.pop();
    }
  }

  /**
   * Creates a clone of this instance that will not be mutated during traversal.
   */
  clone(): RelayQueryIndexPath {
    return new RelayQueryIndexPath([...this.pathStack.map(path => [...path])]);
  }

  /**
   * Pops off the last path from the stack. This is useful for creating index
   * paths as you traverse up the ancestors of a field.
   */
  pop(): RelayQueryIndexPath {
    const pathStack = this.pathStack;
    invariant(
      pathStack.length > 1,
      'RelayQueryIndexPath.pop(): Cannot pop last path off the stack.'
    );
    return new RelayQueryIndexPath(pathStack.slice(0, pathStack.length - 1));
  }

  /**
   * Iterates over each index path on the stack. This is useful for creating
   * index paths as you traverse down a "path" of fields.
   */
  forEach(
    callback: (indexPath: RelayQueryIndexPath, index: number) => void
  ): void {
    this.pathStack.forEach((path, index, pathStack) => {
      callback(new RelayQueryIndexPath(pathStack.slice(0, index + 1)), index);
    });
  }

  /**
   * Gets a component of a field serialization key from the index path.
   */
  getSerializationKey(): string {
    return this.pathStack.map(
      path => path.map(serializeIndex).join('')
    ).join('');
  }
}

function serializeIndex(index: number): string {
  // NOTE: Optimized to produce shorter keys for smaller indexes.
  return index < 62 ? base62(index) : ('_' + base62(index) + '_');
}

module.exports = RelayQueryIndexPath;

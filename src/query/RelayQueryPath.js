/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryPath
 * @flow
 * @typechecks
 */

'use strict';

var RelayNodeInterface = require('RelayNodeInterface');
var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayQuery = require('RelayQuery');
var RelayQuerySerializer = require('RelayQuerySerializer');

var invariant = require('invariant');

import type {DataID} from 'RelayInternalTypes';

var {ID, TYPENAME} = RelayNodeInterface;
// Placeholder to mark fields as non-scalar
var EMPTY_FRAGMENT = RelayQuery.Fragment.build(
  '$RelayQueryPath',
  'Node'
);

/**
 * @internal
 *
 * Represents the path (root plus fields) within a query that fetched a
 * particular node. Each step of the path may represent a root query (for
 * refetchable nodes) or the field path from the nearest refetchable node.
 */
class RelayQueryPath {
  _name: string;
  _node: RelayQuery.Root | RelayQuery.Field;
  _parent: ?RelayQueryPath;

  constructor(
    node: RelayQuery.Root | RelayQuery.Field,
    parent?: RelayQueryPath
  ) {
    if (node instanceof RelayQuery.Root) {
      invariant(
        !parent,
        'RelayQueryPath: Root paths may not have a parent.'
      );
      this._name = node.getName();
    } else {
      invariant(
        parent,
        'RelayQueryPath: A parent is required for field paths.'
      );
      this._name = parent.getName();
    }
    this._node = node;
    this._parent = parent;
  }

  /**
   * Returns true if this is a root path (the node is a root node with an ID),
   * false otherwise.
   */
  isRootPath(): boolean {
    return !this._parent;
  }

  /**
   * Gets the parent path, throwing if it does not exist. Use `!isRootPath()`
   * to check if there is a parent.
   */
  getParent(): RelayQueryPath {
    var parent = this._parent;
    invariant(
      parent,
      'RelayQueryPath.getParent(): Cannot get the parent of a root path.'
    );
    return parent;
  }

  /**
   * Helper to get the name of the root query node.
   */
  getName(): string {
    return this._name;
  }

  /**
   * Gets a new path that describes how to access the given `node` via the
   * current path. Returns a new, root path if `dataID` is provided and
   * refetchable, otherwise returns an extension of the current path.
   */
  getPath(
    node: RelayQuery.Field,
    dataID: DataID
  ): RelayQueryPath {
    if (GraphQLStoreDataHandler.isClientID(dataID)) {
      return new RelayQueryPath(node, this);
    } else {
      var idField = RelayQuery.Field.build(ID, null, null, {
        parentType: RelayNodeInterface.NODE_TYPE,
      });
      var typeField = RelayQuery.Field.build(TYPENAME, null, null, {
        parentType: RelayNodeInterface.NODE_TYPE,
      });
      var root = RelayQuery.Root.build(
        RelayNodeInterface.NODE,
        dataID,
        [idField, typeField],
        {identifyingArgName: RelayNodeInterface.ID},
        this.getName()
      );
      return new RelayQueryPath(root);
    }
  }

  /**
   * Returns a new root query that follows only the fields in this path and then
   * appends the specified field/fragment at the node reached by the path.
   *
   * The query also includes any ID fields along the way.
   */
  getQuery(
    appendNode: RelayQuery.Fragment | RelayQuery.Field
  ): RelayQuery.Root {
    var node = this._node;
    var path = this;
    var child = appendNode;
    while (node instanceof RelayQuery.Field) {
      var idFieldName = node.getInferredPrimaryKey();
      if (idFieldName) {
        child = node.clone([
          child,
          node.getFieldByStorageKey(idFieldName),
          node.getFieldByStorageKey(TYPENAME),
        ]);
      } else {
        child = node.clone([child]);
      }
      path = path._parent;
      invariant(
        path,
        'RelayQueryPath.getQuery(): Expected field to have a parent path.'
      );
      node = path._node;
    }
    invariant(child, 'RelayQueryPath: Expected a leaf node.');
    invariant(
      node instanceof RelayQuery.Root,
      'RelayQueryPath: Expected a root node.'
    );
    const metadata = {...node.__concreteNode__.metadata};
    const identifyingArg = node.getIdentifyingArg();
    if (identifyingArg && identifyingArg.name != null) {
      metadata.identifyingArgName = identifyingArg.name;
    }
    return RelayQuery.Root.build(
      node.getFieldName(),
      (identifyingArg && identifyingArg.value) || null,
      [
        child,
        (node: $FlowIssue).getFieldByStorageKey(ID),
        (node: $FlowIssue).getFieldByStorageKey(TYPENAME),
      ],
      metadata,
      this.getName()
    );
  }

  toJSON(): mixed {
    var path = [];
    var next = this;
    while (next) {
      path.unshift(RelayQuerySerializer.toJSON(getShallowClone(next._node)));
      next = next._parent;
    }
    return path;
  }

  static fromJSON(data: mixed): RelayQueryPath {
    invariant(
      Array.isArray(data) && data.length > 0,
      'RelayQueryPath.fromJSON(): expected an array with at least one item.'
    );
    var root = RelayQuerySerializer.fromJSON(data[0]);
    invariant(
      root instanceof RelayQuery.Root,
      'RelayQueryPath.fromJSON(): invalid path, expected first node to be ' +
      'a `RelayQueryRoot`.'
    );
    var path = new RelayQueryPath(root);

    for (var ii = 1; ii < data.length; ii++) {
      var field = RelayQuerySerializer.fromJSON(data[ii]);
      invariant(
        field instanceof RelayQuery.Field,
        'RelayQueryPath.fromJSON(): invalid path, expected node at index %s ' +
        'to be a `RelayQueryField`.',
        ii
      );
      path = new RelayQueryPath(field, path);
    }
    return path;
  }
}

/**
 * Creates a shallow version of `node` with only a primary key field. If the
 * node is not scalar and would otherwise be empty, an empty fragment is added.
 */
function getShallowClone(
  node: RelayQuery.Root | RelayQuery.Field
): RelayQuery.Node {
  var idFieldName = node instanceof RelayQuery.Field ?
    node.getInferredPrimaryKey() :
    ID;
  var children = [];
  var idField = idFieldName && node.getFieldByStorageKey(idFieldName);
  if (idField) {
    children.push(idField);
  }
  var typeField = node.getFieldByStorageKey(TYPENAME);
  if (typeField) {
    children.push(typeField);
  }
  // Add an empty fragment if children are empty to ensure the clone result
  // is non-null.
  if (!children.length) {
    children.push(EMPTY_FRAGMENT);
  }
  return (node.clone(children): any);
}

module.exports = RelayQueryPath;

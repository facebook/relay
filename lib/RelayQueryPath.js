/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayQueryPath
 * 
 * @typechecks
 */

'use strict';

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _extends = require('babel-runtime/helpers/extends')['default'];

var RelayNodeInterface = require('./RelayNodeInterface');
var RelayQuery = require('./RelayQuery');
var RelayRecord = require('./RelayRecord');
var RelayRecordState = require('./RelayRecordState');

var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ID = RelayNodeInterface.ID;
var NODE_TYPE = RelayNodeInterface.NODE_TYPE;
var TYPENAME = RelayNodeInterface.TYPENAME;

var idField = RelayQuery.Field.build({
  fieldName: ID,
  type: 'String'
});
var typeField = RelayQuery.Field.build({
  fieldName: TYPENAME,
  type: 'String'
});

/**
 * @internal
 *
 * Represents the path (root plus fields) within a query that fetched a
 * particular node. Each step of the path may represent a root query (for
 * refetchable nodes) or the field path from the nearest refetchable node.
 */

var RelayQueryPath = (function () {
  function RelayQueryPath(node, parent) {
    _classCallCheck(this, RelayQueryPath);

    if (node instanceof RelayQuery.Root) {
      !!parent ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryPath: Root paths may not have a parent.') : invariant(false) : undefined;
      this._name = node.getName();
    } else {
      !parent ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryPath: A parent is required for field paths.') : invariant(false) : undefined;
      this._name = parent.getName();
    }
    this._node = node;
    this._parent = parent;
  }

  /**
   * Returns true if this is a root path (the node is a root node with an ID),
   * false otherwise.
   */

  RelayQueryPath.prototype.isRootPath = function isRootPath() {
    return !this._parent;
  };

  /**
   * Gets the parent path, throwing if it does not exist. Use `!isRootPath()`
   * to check if there is a parent.
   */

  RelayQueryPath.prototype.getParent = function getParent() {
    var parent = this._parent;
    !parent ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryPath.getParent(): Cannot get the parent of a root path.') : invariant(false) : undefined;
    return parent;
  };

  /**
   * Helper to get the name of the root query node.
   */

  RelayQueryPath.prototype.getName = function getName() {
    return this._name;
  };

  /**
   * Gets a new path that describes how to access the given `node` via the
   * current path. Returns a new, root path if `dataID` is provided and
   * refetchable, otherwise returns an extension of the current path.
   */

  RelayQueryPath.prototype.getPath = function getPath(node, dataID) {
    if (RelayRecord.isClientID(dataID)) {
      return new RelayQueryPath(node, this);
    } else {
      var root = RelayQuery.Root.build(this.getName(), RelayNodeInterface.NODE, dataID, [idField, typeField], {
        identifyingArgName: RelayNodeInterface.ID,
        identifyingArgType: RelayNodeInterface.ID_TYPE,
        isAbstract: true,
        isDeferred: false,
        isPlural: false
      }, NODE_TYPE);
      return new RelayQueryPath(root);
    }
  };

  /**
   * Returns a new root query that follows only the fields in this path and then
   * appends the specified field/fragment at the node reached by the path.
   *
   * The query also includes any ID fields along the way.
   */

  RelayQueryPath.prototype.getQuery = function getQuery(store, appendNode) {
    var node = this._node;
    var path = this;
    var child = appendNode;
    while (node instanceof RelayQuery.Field || node instanceof RelayQuery.Fragment) {
      var idFieldName = node instanceof RelayQuery.Field ? node.getInferredPrimaryKey() : ID;
      if (idFieldName) {
        child = node.clone([child, node.getFieldByStorageKey(idFieldName), node.getFieldByStorageKey(TYPENAME)]);
      } else {
        child = node.clone([child]);
      }
      path = path._parent;
      !path ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryPath.getQuery(): Expected a parent path.') : invariant(false) : undefined;
      node = path._node;
    }
    !child ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryPath: Expected a leaf node.') : invariant(false) : undefined;
    !(node instanceof RelayQuery.Root) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'RelayQueryPath: Expected a root node.') : invariant(false) : undefined;
    var children = [child, node.getFieldByStorageKey(ID), node.getFieldByStorageKey(TYPENAME)];
    var metadata = _extends({}, node.getConcreteQueryNode().metadata);
    var identifyingArg = node.getIdentifyingArg();
    if (identifyingArg && identifyingArg.name != null) {
      metadata.identifyingArgName = identifyingArg.name;
    }
    // At this point `children` will be a partial query such as:
    //   id
    //   __typename
    //   fieldOnFoo { ${appendNode} }
    //
    // In which `fieldOnFoo` is a field of type `Foo`, and cannot be queried on
    // `Node`. To make the query valid it must be wrapped in a conditioning
    // fragment based on the concrete type of the root id:
    //   node(id: $rootID) {
    //     ... on TypeOFRootID {
    //        # above Fragment
    //     }
    //   }
    if (identifyingArg && identifyingArg.value != null) {
      var identifyingArgValue = identifyingArg.value;
      if (typeof identifyingArgValue !== 'string' && typeof identifyingArgValue !== 'number') {
        // TODO #8054994: Supporting aribtrary identifying value types
        !false ? process.env.NODE_ENV !== 'production' ? invariant(false, 'Relay: Expected argument to root field `%s` to be a string or ' + 'number, got `%s`.', node.getFieldName(), JSON.stringify(identifyingArgValue)) : invariant(false) : undefined;
      }
      var rootID = store.getDataID(node.getFieldName(), '' + identifyingArgValue);
      var rootType = rootID && store.getType(rootID);
      if (rootType != null) {
        children = [RelayQuery.Fragment.build(this.getName(), rootType, children)];
      } else {
        var recordState = rootID != null ? store.getRecordState(rootID) : RelayRecordState.UNKNOWN;
        process.env.NODE_ENV !== 'production' ? warning(false, 'RelayQueryPath: No typename found for %s record `%s`. ' + 'Generating a possibly invalid query.', recordState.toLowerCase(), identifyingArgValue) : undefined;
      }
    }
    return RelayQuery.Root.build(this.getName(), node.getFieldName(), identifyingArg && identifyingArg.value || null, children, metadata, node.getType());
  };

  return RelayQueryPath;
})();

module.exports = RelayQueryPath;
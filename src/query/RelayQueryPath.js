/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

import type {DataID} from 'RelayInternalTypes';
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
const RelayRecord = require('RelayRecord');
const RelayRecordState = require('RelayRecordState');
import type RelayRecordStore from 'RelayRecordStore';

const invariant = require('invariant');
const warning = require('warning');

const {ID, NODE_TYPE, TYPENAME} = RelayNodeInterface;

const idField = RelayQuery.Field.build({
  fieldName: ID,
  type: 'String',
});
const typeField = RelayQuery.Field.build({
  fieldName: TYPENAME,
  type: 'String',
});

/**
 * @internal
 *
 * Represents the path (root plus fields) within a query that fetched a
 * particular node. Each step of the path may represent a root query (for
 * refetchable nodes) or the field path from the nearest refetchable node.
 */
class RelayQueryPath {
  _name: string;
  _node: RelayQuery.Root | RelayQuery.Field | RelayQuery.Fragment;
  _parent: ?RelayQueryPath;

  constructor(
    node: RelayQuery.Root | RelayQuery.Field | RelayQuery.Fragment,
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
    node: RelayQuery.Field | RelayQuery.Fragment,
    dataID: DataID
  ): RelayQueryPath {
    if (RelayRecord.isClientID(dataID)) {
      return new RelayQueryPath(node, this);
    } else {
      const root = RelayQuery.Root.build(
        this.getName(),
        RelayNodeInterface.NODE,
        dataID,
        [idField, typeField],
        {
          identifyingArgName: RelayNodeInterface.ID,
          identifyingArgType: RelayNodeInterface.ID_TYPE,
          isAbstract: true,
          isDeferred: false,
          isPlural: false,
        },
        NODE_TYPE
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
    store: RelayRecordStore,
    appendNode: RelayQuery.Fragment | RelayQuery.Field
  ): RelayQuery.Root {
    let node = this._node;
    let path = this;
    let child = appendNode;
    while (
      node instanceof RelayQuery.Field ||
      node instanceof RelayQuery.Fragment
    ) {
      const idFieldName = node instanceof RelayQuery.Field ?
        node.getInferredPrimaryKey() :
        ID;
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
        'RelayQueryPath.getQuery(): Expected a parent path.'
      );
      node = path._node;
    }
    invariant(child, 'RelayQueryPath: Expected a leaf node.');
    invariant(
      node instanceof RelayQuery.Root,
      'RelayQueryPath: Expected a root node.'
    );
    let children = [
      child,
      (node: $FlowIssue).getFieldByStorageKey(ID),
      (node: $FlowIssue).getFieldByStorageKey(TYPENAME),
    ];
    const metadata = {...node.getConcreteQueryNode().metadata};
    const identifyingArg = node.getIdentifyingArg();
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
      const identifyingArgValue = identifyingArg.value;
      if (
        typeof identifyingArgValue !== 'string' &&
        typeof identifyingArgValue !== 'number'
      ) {
        // TODO #8054994: Supporting aribtrary identifying value types
        invariant(
          false,
          'Relay: Expected argument to root field `%s` to be a string or ' +
          'number, got `%s`.',
          node.getFieldName(),
          JSON.stringify(identifyingArgValue)
        );
      }
      const rootID = store.getDataID(
        node.getFieldName(),
        '' + identifyingArgValue
      );
      const rootType = rootID && store.getType(rootID);
      if (rootType != null) {
        children = [RelayQuery.Fragment.build(
          this.getName(),
          rootType,
          children
        )];
      } else {
        const recordState = rootID != null ?
          store.getRecordState(rootID) :
          RelayRecordState.UNKNOWN;
        warning(
          false,
          'RelayQueryPath: No typename found for %s record `%s`. ' +
          'Generating a possibly invalid query.',
          recordState.toLowerCase(),
          identifyingArgValue
        );
      }
    }
    return RelayQuery.Root.build(
      this.getName(),
      node.getFieldName(),
      (identifyingArg && identifyingArg.value) || null,
      children,
      metadata,
      node.getType()
    );
  }
}

module.exports = RelayQueryPath;

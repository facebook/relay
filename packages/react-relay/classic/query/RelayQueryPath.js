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
 * @format
 */

'use strict';

const RelayClassicRecordState = require('RelayClassicRecordState');
const RelayNodeInterface = require('RelayNodeInterface');
const RelayQuery = require('RelayQuery');
const RelayRecord = require('RelayRecord');

const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');
const warning = require('warning');

const {ConnectionInterface} = require('RelayRuntime');

import type {DataID} from 'RelayInternalTypes';
import type RelayRecordStore from 'RelayRecordStore';

const {ID, ID_TYPE, NODE, NODE_TYPE, TYPENAME} = RelayNodeInterface;

const idField = RelayQuery.Field.build({
  fieldName: ID,
  type: 'String',
});
const typeField = RelayQuery.Field.build({
  fieldName: TYPENAME,
  type: 'String',
});

export type ClientPath = {
  node: RelayQuery.Field | RelayQuery.Fragment,
  parent: QueryPath,
  type: 'client',
};
type NodePath = {
  dataID: DataID,
  name: string,
  routeName: string,
  type: 'node',
};
type RootPath = {
  root: RelayQuery.Root,
  type: 'root',
};
type RootRecordPath = {
  type: 'rootRecord',
};

// Placeholder path used to write data to root record (ROOT_ID).
const ROOT_RECORD_PATH = {
  type: 'rootRecord',
};

export type QueryPath = ClientPath | NodePath | RootPath | RootRecordPath;

/**
 * @internal
 *
 * Represents the path (root plus fields) within a query that fetched a
 * particular node. Each step of the path may represent a root query (for
 * refetchable nodes) or the field path from the nearest refetchable node.
 */
const RelayQueryPath = {
  getRootRecordPath(): QueryPath {
    return ROOT_RECORD_PATH;
  },

  createForID(dataID: DataID, name: string, routeName: ?string): QueryPath {
    invariant(
      !RelayRecord.isClientID(dataID),
      'RelayQueryPath.createForID: Expected dataID to be a server id, got ' +
        '`%s`.',
      dataID,
    );
    return {
      dataID,
      name,
      routeName: routeName || '$RelayQuery',
      type: 'node',
    };
  },

  create(root: RelayQuery.Root): QueryPath {
    if (root.getFieldName() === NODE) {
      const identifyingArg = root.getIdentifyingArg();
      if (identifyingArg && typeof identifyingArg.value === 'string') {
        return {
          dataID: identifyingArg.value,
          name: root.getName(),
          routeName: root.getRoute().name,
          type: 'node',
        };
      }
    }
    return {
      root,
      type: 'root',
    };
  },

  getPath(
    parent: QueryPath,
    node: RelayQuery.Field | RelayQuery.Fragment,
    dataID: ?DataID,
  ): QueryPath {
    if (dataID == null || RelayRecord.isClientID(dataID)) {
      return {
        node,
        parent,
        type: 'client',
      };
    } else if (parent.type === 'node' && parent.dataID === dataID) {
      return parent;
    } else {
      return {
        dataID,
        name: RelayQueryPath.getName(parent),
        routeName: RelayQueryPath.getRouteName(parent),
        type: 'node',
      };
    }
  },

  isRootPath(path: QueryPath): boolean {
    return path.type === 'node' || path.type === 'root';
  },

  getParent(path: QueryPath): QueryPath {
    invariant(
      path.type === 'client',
      'RelayQueryPath: Cannot get the parent of a root path.',
    );
    return path.parent;
  },

  getName(path: QueryPath): string {
    while (path.type === 'client') {
      path = path.parent;
    }
    if (path === ROOT_RECORD_PATH) {
      return 'RootRecordPath';
    } else if (path.type === 'root') {
      return path.root.getName();
    } else if (path.type === 'node') {
      return path.name;
    } else {
      invariant(false, 'RelayQueryPath.getName(): Invalid path `%s`.', path);
    }
  },

  getRouteName(path: QueryPath): string {
    while (path.type === 'client') {
      path = path.parent;
    }
    if (path === ROOT_RECORD_PATH) {
      return '$RelayQueryPath';
    } else if (path.type === 'root') {
      return path.root.getRoute().name;
    } else if (path.type === 'node') {
      return path.routeName;
    } else {
      invariant(
        false,
        'RelayQueryPath.getRouteName(): Invalid path `%s`.',
        path,
      );
    }
  },

  getQuery(
    store: RelayRecordStore,
    path: QueryPath,
    appendNode: RelayQuery.Fragment | RelayQuery.Field,
  ): RelayQuery.Root {
    let child = appendNode;
    let prevField;
    const {EDGES} = ConnectionInterface.get();

    while (path.type === 'client') {
      const node = path.node;
      if (node instanceof RelayQuery.Field) {
        const schemaName = node.getSchemaName();
        warning(
          !prevField || prevField !== EDGES || !node.isConnection(),
          'RelayQueryPath.getQuery(): Cannot generate accurate query for ' +
            'path with connection `%s`. Consider adding an `id` field to each ' +
            '`node` to make them refetchable.',
          schemaName,
        );
        prevField = schemaName;
      }
      const idFieldName =
        node instanceof RelayQuery.Field ? node.getInferredPrimaryKey() : ID;
      if (idFieldName) {
        child = node.clone([
          child,
          node.getFieldByStorageKey(idFieldName),
          node.getFieldByStorageKey(TYPENAME),
        ]);
      } else {
        child = node.clone([child]);
      }
      path = path.parent;
    }
    invariant(
      path.type !== 'rootRecord',
      'RelayQueryPath: Attempted to construct a classic query, but the ' +
        'record was initially fetched with new Relay APIs. Ensure that ' +
        'deprecated components such as RelayContainer are not nested in ' +
        'new APIs such as QueryRenderer or FragmentContainer.',
    );
    const root =
      path.type === 'root' ? path.root : createRootQueryFromNodePath(path);
    const children = [
      child,
      root.getFieldByStorageKey(ID),
      root.getFieldByStorageKey(TYPENAME),
    ];
    const rootChildren = getRootFragmentForQuery(store, root, children);
    const pathQuery = root.cloneWithRoute(rootChildren, appendNode.getRoute());
    // for flow
    invariant(
      pathQuery instanceof RelayQuery.Root,
      'RelayQueryPath: Expected the root of path `%s` to be a query.',
      RelayQueryPath.getName(path),
    );
    return pathQuery;
  },
};

function createRootQueryFromNodePath(nodePath: NodePath): RelayQuery.Root {
  return RelayQuery.Root.build(
    nodePath.name,
    NODE,
    nodePath.dataID,
    [idField, typeField],
    {
      identifyingArgName: ID,
      identifyingArgType: ID_TYPE,
      isAbstract: true,
      isDeferred: false,
      isPlural: false,
    },
    NODE_TYPE,
    nodePath.routeName,
  );
}

function getRootFragmentForQuery(
  store: RelayRecordStore,
  root: RelayQuery.Root,
  children: Array<?RelayQuery.Node>,
): Array<RelayQuery.Node> {
  const nextChildren = [];
  // $FlowIssue: Flow isn't recognizing that `filter(x => !!x)` returns a list
  // of non-null values.
  children.forEach(child => {
    if (child) {
      nextChildren.push(child);
    }
  });
  if (!root.isAbstract()) {
    // No need to wrap child nodes of a known concrete type.
    return nextChildren;
  }
  const identifyingArgKeys = [];
  forEachRootCallArg(root, ({identifyingArgKey}) => {
    identifyingArgKeys.push(identifyingArgKey);
  });
  const identifyingArgKey = identifyingArgKeys[0];
  const rootID = store.getDataID(root.getStorageKey(), identifyingArgKey);
  const rootType = rootID && store.getType(rootID);

  if (rootType != null) {
    return [RelayQuery.Fragment.build(root.getName(), rootType, nextChildren)];
  } else {
    const rootState =
      rootID != null
        ? store.getRecordState(rootID)
        : RelayClassicRecordState.UNKNOWN;
    warning(
      false,
      'RelayQueryPath: No typename found for %s record `%s`. Generating a ' +
        'possibly invalid query.',
      rootState.toLowerCase(),
      rootID,
    );
    return nextChildren;
  }
}

module.exports = RelayQueryPath;

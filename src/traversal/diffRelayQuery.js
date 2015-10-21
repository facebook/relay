/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule diffRelayQuery
 * @flow
 * @typechecks
 */

'use strict';

var GraphQLStoreDataHandler = require('GraphQLStoreDataHandler');
var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayNodeInterface = require('RelayNodeInterface');
var RelayProfiler = require('RelayProfiler');
var RelayQuery = require('RelayQuery');
var RelayQueryPath = require('RelayQueryPath');
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';

var forEachRootCallArg = require('forEachRootCallArg');
var invariant = require('invariant');
var warning = require('warning');

var {ID, TYPENAME} = RelayNodeInterface;
var {EDGES, NODE, PAGE_INFO} = RelayConnectionInterface;
var idField = RelayQuery.Field.build(ID, null, null, {
  parentType: RelayNodeInterface.NODE_TYPE,
  requisite: true,
});
var typeField = RelayQuery.Field.build(TYPENAME, null, null, {
  parentType: RelayNodeInterface.NODE_TYPE,
  requisite: true,
});
var nodeWithID = RelayQuery.Field.build(
  RelayNodeInterface.NODE,
  null,
  [idField, typeField],
);

import type {DataID} from 'RelayInternalTypes';

type DiffScope = {
  connectionField: ?RelayQuery.Field;
  dataID: DataID,
  edgeID: ?DataID,
  rangeInfo: ?RangeInfo;
};

/**
 * @internal
 *
 * Computes the difference between the data requested in `root` and the data
 * available in `store`. It returns a minimal set of queries that will fulfill
 * the difference, or an empty array if the query can be resolved locally.
 */
function diffRelayQuery(
  root: RelayQuery.Root,
  store: RelayRecordStore
): Array<RelayQuery.Root> {
  var path = new RelayQueryPath(root);
  var queries = [];

  var visitor = new RelayDiffQueryBuilder(store);
  const rootIdentifyingArg = root.getIdentifyingArg();
  const rootIdentifyingArgValue =
    (rootIdentifyingArg && rootIdentifyingArg.value) || null;
  var isPluralCall = (
    Array.isArray(rootIdentifyingArgValue) &&
    rootIdentifyingArgValue.length > 1
  );
  let metadata;
  if (rootIdentifyingArg != null) {
    metadata = {};
    metadata.identifyingArgName = rootIdentifyingArg.name;
    if (rootIdentifyingArg.type != null) {
      metadata.identifyingArgType = rootIdentifyingArg.type;
    }
  }
  const fieldName = root.getFieldName();
  const storageKey = root.getStorageKey();
  forEachRootCallArg(root, identifyingArgValue => {
    var nodeRoot;
    if (isPluralCall) {
      invariant(
        identifyingArgValue != null,
        'diffRelayQuery(): Unexpected null or undefined value in root call ' +
        'argument array for query, `%s(...).',
        fieldName
      );
      nodeRoot = RelayQuery.Root.build(
        fieldName,
        [identifyingArgValue],
        root.getChildren(),
        metadata,
        root.getName()
      );
    } else {
      // Reuse `root` if it only maps to one result.
      nodeRoot = root;
    }

    // The whole query must be fetched if the root dataID is unknown.
    var dataID = store.getDataID(storageKey, identifyingArgValue);
    if (dataID == null) {
      queries.push(nodeRoot);
      return;
    }

    // Diff the current dataID
    var scope = makeScope(dataID);
    var diffNode = visitor.visit(nodeRoot, path, scope);
    if (diffNode) {
      invariant(
        diffNode instanceof RelayQuery.Root,
        'diffRelayQuery(): Expected result to be a root query.'
      );
      queries.push(diffNode);
    }
  });
  return queries.concat(visitor.getSplitQueries());
}

/**
 * @internal
 *
 * A transform for (node + store) -> [diff query]. It is analagous to
 * `RelayQueryTransform` with the main differences as follows:
 * - there is no `state` (which allowed for passing data up and down the tree).
 * - data is passed down via `scope`, which flows from a parent field down
 *   through intermediary fragments to the nearest child field.
 *
 * New top-level queries are available via `getSplitQueries()`.
 */
class RelayDiffQueryBuilder {
  _store: RelayRecordStore;
  _splitQueries: Array<RelayQuery.Root>;

  constructor(store: RelayRecordStore) {
    this._store = store;
    this._splitQueries = [];
  }

  splitQuery(
    root: RelayQuery.Root
  ): void {
    this._splitQueries.push(root);
  }

  getSplitQueries(): Array<RelayQuery.Root> {
    return this._splitQueries;
  }

  visit(
    node: RelayQuery.Node,
    path: RelayQueryPath,
    scope: DiffScope
  ): ?RelayQuery.Node {
    if (node instanceof RelayQuery.Field) {
      return this.visitField(node, path, scope);
    } else if (node instanceof RelayQuery.Fragment) {
      return this.visitFragment(node, path, scope);
    } else if (node instanceof RelayQuery.Root) {
      return this.visitRoot(node, path, scope);
    }
  }

  visitRoot(
    node: RelayQuery.Root,
    path: RelayQueryPath,
    scope: DiffScope
  ): ?RelayQuery.Node {
    return this.traverse(node, path, scope);
  }

  visitFragment(
    node: RelayQuery.Fragment,
    path: RelayQueryPath,
    scope: DiffScope
  ): ?RelayQuery.Node {
    return this.traverse(node, path, scope);
  }

  /**
   * Diffs the field conditionally based on the `scope` from the nearest
   * ancestor field.
   */
  visitField(
    node: RelayQuery.Field,
    path: RelayQueryPath,
    {connectionField, dataID, edgeID, rangeInfo}: DiffScope
  ): ?RelayQuery.Node {
    // special case when inside a connection traversal
    if (connectionField && rangeInfo) {
      if (edgeID) {
        // When traversing a specific connection edge only look at `edges`
        if (node.getSchemaName() === EDGES) {
          return this.diffConnectionEdge(
            connectionField,
            node, // edge field
            path.getPath(node, edgeID),
            edgeID,
            rangeInfo
          );
        } else {
          return null;
        }
      } else {
        // When traversing connection metadata fields, edges/page_info are
        // only kept if there are range extension calls. Other fields fall
        // through to regular diffing.
        if (
          node.getSchemaName() === EDGES ||
          node.getSchemaName() === PAGE_INFO
        ) {
          return rangeInfo.diffCalls.length > 0 ? node : null;
        }
      }
    }

    // default field diffing algorithm
    if (node.isScalar()) {
      return this.diffScalar(node, dataID);
    } else if (node.isGenerated()) {
      return node;
    } else if (node.isConnection()) {
      return this.diffConnection(node, path, dataID);
    } else if (node.isPlural()) {
      return this.diffPluralLink(node, path, dataID);
    } else {
      return this.diffLink(node, path, dataID);
    }
  }

  /**
   * Visit all the children of the given `node` and merge their results.
   */
  traverse(
    node: RelayQuery.Node,
    path: RelayQueryPath,
    scope: DiffScope
  ): ?RelayQuery.Node {
    var diffNode;
    var diffChildren;
    var hasDiffField = false;

    node.getChildren().forEach(child => {
      var diffChild = this.visit(child, path, scope);

      // Diff uses child nodes and keeps requisite fields
      if (diffChild) {
        diffChildren = diffChildren || [];
        diffChildren.push(diffChild);
        hasDiffField = hasDiffField || !diffChild.isGenerated();
      } else if (child.isRequisite() && !scope.rangeInfo) {
        // The presence of `rangeInfo` indicates that we are traversing
        // connection metadata fields, in which case `visitField` will ensure
        // that `edges` and `page_info` are kept when necessary. The requisite
        // check alone could cause these fields to be added back when not
        // needed.
        //
        // Example: `friends.first(3) {count, edges {...}, page_info {...} }
        // If all `edges` were fetched but `count` is unfetched, the diff
        // should be `friends.first(3) {count}` and not include `page_info`.
        diffChildren = diffChildren || [];
        diffChildren.push(child);
      }
    });

    // Only return diff node if there are non-generated fields
    if (diffChildren && hasDiffField) {
      diffNode = node.clone(diffChildren);
    }

    return diffNode;
  }

  /**
   * Diff a scalar field such as `name` or `id`.
   */
  diffScalar(
    field: RelayQuery.Field,
    dataID: DataID,
  ): ?RelayQuery.Node {
    if (this._store.getField(dataID, field.getStorageKey()) === undefined) {
      return field;
    }
    return null;
  }

  /**
   * Diff a field-of-fields such as `profile_picture {...}`. Returns early if
   * the field has not been fetched, otherwise the result of traversal.
   */
  diffLink(
    field: RelayQuery.Field,
    path: RelayQueryPath,
    dataID: DataID,
  ): ?RelayQuery.Node {
    var nextDataID =
      this._store.getLinkedRecordID(dataID, field.getStorageKey());
    if (nextDataID === undefined) {
      return field;
    }
    if (nextDataID === null) {
      return null;
    }

    return this.traverse(
      field,
      path.getPath(field, nextDataID),
      makeScope(nextDataID)
    );
  }

  /**
   * Diffs a non-connection plural field against each of the fetched items.
   * Note that scalar plural fields are handled by `_diffScalar`.
   */
  diffPluralLink(
    field: RelayQuery.Field,
    path: RelayQueryPath,
    dataID: DataID
  ): ?RelayQuery.Node {
    var linkedIDs =
      this._store.getLinkedRecordIDs(dataID, field.getStorageKey());
    if (linkedIDs === undefined) {
      // not fetched
      return field;
    } else if (linkedIDs === null || linkedIDs.length === 0) {
      // empty array means nothing to fetch
      return null;
    } else if (field.getInferredRootCallName() === NODE) {
      // The items in this array are fetchable and may have been filled in
      // from other sources, so check them all. For example, `Story{actors}`
      // is an array (but not a range), and the Actors in that array likely
      // had data fetched for them elsewhere (like `viewer(){actor}`).
      linkedIDs.forEach(itemID => {
        var diffNode = this.traverse(
          field,
          path.getPath(field, itemID),
          makeScope(itemID)
        );
        if (diffNode) {
          this.splitQuery(buildRoot(
            itemID,
            diffNode.getChildren(),
            path.getName()
          ));
        }
      });
    } else {
      // The items in this array are not fetchable by ID, so nothing else
      // could have fetched additional data for individual items. Therefore,
      // we only need to diff the first record to figure out which fields have
      // previously been fetched.
      var sampleItemID = linkedIDs[0];
      return this.traverse(
        field,
        path.getPath(field, sampleItemID),
        makeScope(sampleItemID)
      );
    }
    return null;
  }

  /**
   * Diff a connection field such as `news_feed.first(3)`. Returns early if
   * the range has not been fetched or the entire range has already been
   * fetched. Otherwise the diff output is a clone of `field` with updated
   * after/first and before/last calls.
   */
  diffConnection(
    field: RelayQuery.Field,
    path: RelayQueryPath,
    dataID: DataID,
  ): ?RelayQuery.Node {
    var store: RelayRecordStore = this._store;
    var connectionID = store.getLinkedRecordID(dataID, field.getStorageKey());
    var rangeInfo = store.getRangeMetadata(
      connectionID,
      field.getCallsWithValues()
    );
    // Keep the field if the connection is unfetched
    if (connectionID === undefined) {
      return field;
    }
    // Skip if the connection is deleted.
    if (connectionID === null) {
      return null;
    }
    // If metadata fields but not edges are fetched, diff as a normal field.
    // In practice, `rangeInfo` is `undefined` if unfetched, `null` if the
    // connection was deleted (in which case `connectionID` is null too).
    if (rangeInfo == null) {
      return this.traverse(
        field,
        path.getPath(field, connectionID),
        makeScope(connectionID)
      );
    }
    var {diffCalls, filteredEdges} = rangeInfo;

    // check existing edges for missing fields
    filteredEdges.forEach(edge => {
      // Flow loses type information in closures
      if (rangeInfo && connectionID) {
        var scope = {
          connectionField: field,
          dataID: connectionID,
          edgeID: edge.edgeID,
          rangeInfo,
        };
        // missing fields from edges will result in split queries and no
        // diffed fields
        this.traverse(
          field,
          path.getPath(field, edge.edgeID),
          scope
        );
      }
    });

    // Scope has null `edgeID` to skip looking at `edges` fields.
    var scope = {
      connectionField: field,
      dataID: connectionID,
      edgeID: null,
      rangeInfo,
    };
    // diff non-`edges` fields such as `count`
    var diffNode = this.traverse(
      field,
      path.getPath(field, connectionID),
      scope
    );
    if (diffCalls.length && diffNode instanceof RelayQuery.Field) {
      diffNode = diffNode.cloneFieldWithCalls(
        diffNode.getChildren(),
        diffCalls
      );
    }

    return diffNode;
  }

  /**
   * Diff an `edges` field for the edge rooted at `edgeID`, splitting a new
   * root query to fetch any missing data (via a `node(id)` root if the
   * field is refetchable or a `...{connection.find(id){}}` query if the
   * field is not refetchable).
   */
  diffConnectionEdge(
    connectionField: RelayQuery.Field,
    edgeField: RelayQuery.Field,
    path: RelayQueryPath,
    edgeID: DataID,
    rangeInfo: RangeInfo
  ): void {
    var nodeID = this._store.getLinkedRecordID(edgeID, NODE);
    if (!nodeID || GraphQLStoreDataHandler.isClientID(nodeID)) {
      warning(
        false,
        'RelayDiffQueryBuilder: connection `node{*}` can only be refetched ' +
        'if the node is refetchable by `id`. Cannot refetch data for field ' +
        '`%s`.',
        connectionField.getStorageKey()
      );
      return;
    }

    var diffNode = this.traverse(
      edgeField,
      path.getPath(edgeField, edgeID),
      makeScope(edgeID)
    );

    if (diffNode) {
      var {
        edges: diffEdgesField,
        node: diffNodeField
      } = splitNodeAndEdgesFields(diffNode);

      // split missing `node` fields into a `node(id)` root query
      if (diffNodeField) {
        this.splitQuery(buildRoot(
          nodeID,
          diffNodeField.getChildren(),
          path.getName()
        ));
      }

      // split missing `edges` fields into a `connection.find(id)` query
      // if `find` is supported, otherwise warn
      if (diffEdgesField) {
        if (connectionField.isFindable()) {
          diffEdgesField = diffEdgesField
            .clone(diffEdgesField.getChildren().concat(nodeWithID));
          var connectionFind = connectionField.cloneFieldWithCalls(
            [diffEdgesField],
            rangeInfo.filterCalls.concat({name: 'find', value: nodeID})
          );
          if (connectionFind) {
            // current path has `parent`, `connection`, `edges`; pop to parent
            var connectionParent = path.getParent().getParent();
            this.splitQuery(connectionParent.getQuery(connectionFind));
          }
        } else {
          warning(
            false,
            'RelayDiffQueryBuilder: connection `edges{*}` fields can only be ' +
            'refetched if the connection supports the `find` call. Cannot ' +
            'refetch data for field `%s`.',
            connectionField.getStorageKey()
          );
        }
      }
    }

    return;
  }
}

/**
 * Helper to construct a plain scope for the given `dataID`.
 */
function makeScope(dataID: DataID): DiffScope {
  return {
    connectionField: null,
    dataID,
    edgeID: null,
    rangeInfo: null,
  };
}

/**
 * Returns a clone of the input with `edges` and `node` sub-fields split into
 * separate `edges` and `node` roots. Example:
 *
 * Input:
 * edges {
 *   edge_field,
 *   node {
 *     a,
 *     b
 *   },
 *   ${
 *     Fragment {
 *       edge_field_2,
 *       node {
 *         c
 *       }
 *     }
 *   }
 * }
 *
 * Output:
 * node:
 *   edges {
 *     a,      // flattened
 *     b,      // flattend
 *     ${
 *       Fragment {
 *         c  // flattened
 *       }
 *     }
 *   }
 * edges:
 *   edges {
 *     edge_field,
 *     ${
 *       Fragment {
 *         edge_field_2
 *       }
 *     }
 *   }
 */
function splitNodeAndEdgesFields(
  edgeOrFragment: RelayQuery.Node
): {
  edges: ?RelayQuery.Node,
  node: ?RelayQuery.Node
} {
  var children = edgeOrFragment.getChildren();
  var edgeChildren = [];
  var hasNodeChild = false;
  var nodeChildren = [];
  var hasEdgeChild = false;
  for (var ii = 0; ii < children.length; ii++) {
    var child = children[ii];
    if (child instanceof RelayQuery.Field) {
      if (child.getSchemaName() === NODE) {
        var subFields = child.getChildren();
        nodeChildren = nodeChildren.concat(subFields);
        // can skip if `node` only has an `id` field
        hasNodeChild = (
          hasNodeChild ||
          subFields.length !== 1 ||
          !(subFields[0] instanceof RelayQuery.Field) ||
          /* $FlowFixMe(>=0.13.0) - subFields[0] needs to be in a local for Flow to
           * narrow its type, otherwise Flow thinks its a RelayQueryNode without
           * method `getSchemaName`
           */
          subFields[0].getSchemaName() !== 'id'
        );
      } else {
        edgeChildren.push(child);
        hasEdgeChild = hasEdgeChild || !child.isRequisite();
      }
    } else if (child instanceof RelayQuery.Fragment) {
      var {edges, node} = splitNodeAndEdgesFields(child);
      if (edges) {
        edgeChildren.push(edges);
        hasEdgeChild = true;
      }
      if (node) {
        nodeChildren.push(node);
        hasNodeChild = true;
      }
    }
  }
  return {
    edges: hasEdgeChild ? edgeOrFragment.clone(edgeChildren) : null,
    node: hasNodeChild ? edgeOrFragment.clone(nodeChildren) : null,
  };
}

function buildRoot(
  rootID: DataID,
  children: Array<RelayQuery.Node>,
  name: string
): RelayQuery.Root {
  // Child fields are always collapsed into fragments so a root `id` field
  // must be added.
  var fragments = [idField, typeField];
  var childTypes = {};
  children.forEach(child => {
    if (child instanceof RelayQuery.Field) {
      var parentType = child.getParentType();
      childTypes[parentType] = childTypes[parentType] || [];
      childTypes[parentType].push(child);
    } else {
      fragments.push(child);
    }
  });
  Object.keys(childTypes).map(type => {
    fragments.push(RelayQuery.Fragment.build(
      'diffRelayQuery',
      type,
      childTypes[type]
    ));
  });
  return RelayQuery.Root.build(
    NODE,
    rootID,
    fragments,
    {identifyingArgName: RelayNodeInterface.ID},
    name
  );
}

module.exports = RelayProfiler.instrument('diffRelayQuery', diffRelayQuery);

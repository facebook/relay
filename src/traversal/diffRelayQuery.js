/**
 * Copyright (c) 2013-present, Facebook, Inc.
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

const RelayConnectionInterface = require('RelayConnectionInterface');
import type RelayFragmentTracker from 'RelayFragmentTracker';
const RelayNodeInterface = require('RelayNodeInterface');
const RelayProfiler = require('RelayProfiler');
const RelayQuery = require('RelayQuery');
import type {QueryPath} from 'RelayQueryPath';
const RelayQueryPath = require('RelayQueryPath');
import type RelayQueryTracker from 'RelayQueryTracker';
const RelayRecord = require('RelayRecord');
import type RelayRecordStore from 'RelayRecordStore';
import type {RangeInfo} from 'RelayRecordStore';

const forEachRootCallArg = require('forEachRootCallArg');
const invariant = require('invariant');
const isCompatibleRelayFragmentType = require('isCompatibleRelayFragmentType');
const warning = require('warning');

const {ID, ID_TYPE, NODE_TYPE, TYPENAME} = RelayNodeInterface;
const {EDGES, NODE, PAGE_INFO} = RelayConnectionInterface;
const idField = RelayQuery.Field.build({
  fieldName: ID,
  metadata: {
    isRequisite: true,
  },
  type: 'String',
});
const typeField = RelayQuery.Field.build({
  fieldName: TYPENAME,
  metadata: {
    isRequisite: true,
  },
  type: 'String',
});
const nodeWithID = RelayQuery.Field.build({
  fieldName: RelayNodeInterface.NODE,
  children: [idField, typeField],
  metadata: {
    canHaveSubselections: true,
  },
  type: NODE_TYPE,
});

import type {DataID} from 'RelayInternalTypes';

type DiffScope = {
  connectionField: ?RelayQuery.Field;
  dataID: DataID,
  edgeID: ?DataID,
  rangeInfo: ?RangeInfo;
};
type DiffOutput = {
  diffNode: ?RelayQuery.Node;
  trackedNode: ?RelayQuery.Node;
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
  store: RelayRecordStore,
  queryTracker: RelayQueryTracker,
  fragmentTracker: RelayFragmentTracker,
): Array<RelayQuery.Root> {
  const path = RelayQueryPath.create(root);
  const queries = [];

  const visitor = new RelayDiffQueryBuilder(
    store,
    queryTracker,
    fragmentTracker
  );
  const rootIdentifyingArg = root.getIdentifyingArg();
  const rootIdentifyingArgValue =
    (rootIdentifyingArg && rootIdentifyingArg.value) || null;
  const isPluralCall = (
    Array.isArray(rootIdentifyingArgValue) &&
    rootIdentifyingArgValue.length > 1
  );
  let metadata;
  if (rootIdentifyingArg != null) {
    metadata = {
      identifyingArgName: rootIdentifyingArg.name,
      identifyingArgType: rootIdentifyingArg.type != null ?
        rootIdentifyingArg.type :
        ID_TYPE,
      isAbstract: true,
      isDeferred: false,
      isPlural: false,
    };
  }
  const fieldName = root.getFieldName();
  const storageKey = root.getStorageKey();
  forEachRootCallArg(root, ({identifyingArgValue, identifyingArgKey}) => {
    let nodeRoot;
    if (isPluralCall) {
      invariant(
        identifyingArgValue != null,
        'diffRelayQuery(): Unexpected null or undefined value in root call ' +
        'argument array for query, `%s(...).',
        fieldName
      );
      nodeRoot = RelayQuery.Root.build(
        root.getName(),
        fieldName,
        [identifyingArgValue],
        root.getChildren(),
        metadata,
        root.getType()
      );
    } else {
      // Reuse `root` if it only maps to one result.
      nodeRoot = root;
    }

    // The whole query must be fetched if the root dataID is unknown.
    const dataID = store.getDataID(storageKey, identifyingArgKey);
    if (dataID == null) {
      queries.push(nodeRoot);
      return;
    }

    // Diff the current dataID
    const scope = makeScope(dataID);
    const diffOutput = visitor.visit(nodeRoot, path, scope);
    const diffNode = diffOutput ? diffOutput.diffNode : null;
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
 * A transform for (node + store) -> (diff + tracked queries). It is analagous
 * to `RelayQueryTransform` with the main differences as follows:
 * - there is no `state` (which allowed for passing data up and down the tree).
 * - data is passed down via `scope`, which flows from a parent field down
 *   through intermediary fragments to the nearest child field.
 * - data is passed up via the return type `{diffNode, trackedNode}`, where:
 *   - `diffNode`: subset of the input that could not diffed out
 *   - `trackedNode`: subset of the input that must be tracked
 *
 * The provided `queryTracker` is updated whenever the traversal of a node
 * results in a `trackedNode` being created. New top-level queries are not
 * returned up the tree, and instead are available via `getSplitQueries()`.
 */
class RelayDiffQueryBuilder {
  _store: RelayRecordStore;
  _splitQueries: Array<RelayQuery.Root>;
  _queryTracker: RelayQueryTracker;
  _fragmentTracker: RelayFragmentTracker;

  constructor(
    store: RelayRecordStore,
    queryTracker: RelayQueryTracker,
    fragmentTracker: RelayFragmentTracker,
  ) {
    this._store = store;
    this._splitQueries = [];
    this._queryTracker = queryTracker;
    this._fragmentTracker = fragmentTracker;
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
    path: QueryPath,
    scope: DiffScope
  ): ?DiffOutput {
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
    path: QueryPath,
    scope: DiffScope
  ): ?DiffOutput {
    return this.traverse(node, path, scope);
  }

  visitFragment(
    node: RelayQuery.Fragment,
    path: QueryPath,
    scope: DiffScope
  ): ?DiffOutput {
    return this.traverse(node, path, scope);
  }

  /**
   * Diffs the field conditionally based on the `scope` from the nearest
   * ancestor field.
   */
  visitField(
    node: RelayQuery.Field,
    path: QueryPath,
    {connectionField, dataID, edgeID, rangeInfo}: DiffScope
  ): ?DiffOutput {
    // special case when inside a connection traversal
    if (connectionField && rangeInfo) {
      if (edgeID) {
        // When traversing a specific connection edge only look at `edges`
        if (node.getSchemaName() === EDGES) {
          return this.diffConnectionEdge(
            connectionField,
            node, // edge field
            RelayQueryPath.getPath(path, node, edgeID),
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
          return rangeInfo.diffCalls.length > 0 ?
            {
              diffNode: node,
              trackedNode: null,
            } :
            null;
        }
      }
    }

    // default field diffing algorithm
    if (!node.canHaveSubselections()) {
      return this.diffScalar(node, dataID);
    } else if (node.isGenerated()) {
      return {
        diffNode: node,
        trackedNode: null,
      };
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
    path: QueryPath,
    scope: DiffScope
  ): ?DiffOutput {
    let diffNode;
    let diffChildren;
    let trackedNode;
    let trackedChildren;
    let hasDiffField = false;
    let hasTrackedField = false;

    node.getChildren().forEach(child => {
      if (child instanceof RelayQuery.Field) {
        const diffOutput = this.visitField(child, path, scope);
        const diffChild = diffOutput ? diffOutput.diffNode : null;
        const trackedChild = diffOutput ? diffOutput.trackedNode : null;

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
        // Tracker uses tracked children and keeps requisite fields
        if (trackedChild) {
          trackedChildren = trackedChildren || [];
          trackedChildren.push(trackedChild);
          hasTrackedField = hasTrackedField || !trackedChild.isGenerated();
        } else if (child.isRequisite()) {
          trackedChildren = trackedChildren || [];
          trackedChildren.push(child);
        }
      } else if (child instanceof RelayQuery.Fragment) {
        const isCompatibleType = isCompatibleRelayFragmentType(
          child,
          this._store.getType(scope.dataID)
        );
        if (isCompatibleType) {
          if (child.isTrackingEnabled()) {
            const hash = child.getCompositeHash();
            if (this._fragmentTracker.isTracked(scope.dataID, hash)) {
              return {
                diffNode: null,
                trackedNode: null,
              };
            }
          }

          const diffOutput = this.traverse(child, path, scope);
          const diffChild = diffOutput ? diffOutput.diffNode : null;
          const trackedChild = diffOutput ? diffOutput.trackedNode : null;

          if (diffChild) {
            diffChildren = diffChildren || [];
            diffChildren.push(diffChild);
            hasDiffField = true;
          }
          if (trackedChild) {
            trackedChildren = trackedChildren || [];
            trackedChildren.push(trackedChild);
            hasTrackedField = true;
          }
        } else {
          // Non-matching fragment types are similar to requisite fields:
          // they don't need to be diffed against and should only be included
          // if something *else* is missing from the node.
          diffChildren = diffChildren || [];
          diffChildren.push(child);
        }
      }
    });

    // Only return diff/tracked node if there are non-generated fields
    if (diffChildren && hasDiffField) {
      diffNode = node.clone(diffChildren);
    }
    if (trackedChildren && hasTrackedField) {
      trackedNode = node.clone(trackedChildren);
    }
    // Record tracked nodes. Fragments can be skipped because these will
    // always be composed into, and therefore tracked by, their nearest
    // non-fragment parent.
    if (trackedNode && !(trackedNode instanceof RelayQuery.Fragment)) {
      this._queryTracker.trackNodeForID(trackedNode, scope.dataID, path);
    }

    return {
      diffNode,
      trackedNode,
    };
  }

  /**
   * Diff a scalar field such as `name` or `id`.
   */
  diffScalar(
    field: RelayQuery.Field,
    dataID: DataID,
  ): ?DiffOutput {
    if (this._store.getField(dataID, field.getStorageKey()) === undefined) {
      return {
        diffNode: field,
        trackedNode: null,
      };
    }
    return null;
  }

  /**
   * Diff a field-of-fields such as `profile_picture {...}`. Returns early if
   * the field has not been fetched, otherwise the result of traversal.
   */
  diffLink(
    field: RelayQuery.Field,
    path: QueryPath,
    dataID: DataID,
  ): ?DiffOutput {
    const nextDataID =
      this._store.getLinkedRecordID(dataID, field.getStorageKey());
    if (nextDataID === undefined) {
      return {
        diffNode: field,
        trackedNode: null,
      };
    }
    if (nextDataID === null) {
      return {
        diffNode: null,
        trackedNode: field,
      };
    }

    return this.traverse(
      field,
      RelayQueryPath.getPath(path, field, nextDataID),
      makeScope(nextDataID)
    );
  }

  /**
   * Diffs a non-connection plural field against each of the fetched items.
   * Note that scalar plural fields are handled by `_diffScalar`.
   */
  diffPluralLink(
    field: RelayQuery.Field,
    path: QueryPath,
    dataID: DataID
  ): ?DiffOutput {
    const linkedIDs =
      this._store.getLinkedRecordIDs(dataID, field.getStorageKey());
    if (linkedIDs === undefined) {
      // not fetched
      return {
        diffNode: field,
        trackedNode: null,
      };
    } else if (linkedIDs === null || linkedIDs.length === 0) {
      // Don't fetch if array is null or empty, but still track the fragment
      return {
        diffNode: null,
        trackedNode: field,
      };
    } else if (field.getInferredRootCallName() === NODE) {
      // The items in this array are fetchable and may have been filled in
      // from other sources, so check them all. For example, `Story{actors}`
      // is an array (but not a range), and the Actors in that array likely
      // had data fetched for them elsewhere (like `viewer(){actor}`).
      let hasSplitQueries = false;
      linkedIDs.forEach(itemID => {
        const itemState = this.traverse(
          field,
          RelayQueryPath.getPath(path, field, itemID),
          makeScope(itemID)
        );
        if (itemState) {
          // If any child was tracked then `field` will also be tracked
          hasSplitQueries =
            hasSplitQueries || !!itemState.trackedNode || !!itemState.diffNode;
          // split diff nodes into root queries
          if (itemState.diffNode) {
            this.splitQuery(buildRoot(
              itemID,
              itemState.diffNode.getChildren(),
              RelayQueryPath.getName(path),
              field.getType()
            ));
          }
        }
      });
      // if sub-queries are split then this *entire* field will be tracked,
      // therefore we don't need to merge the `trackedNode` from each item
      if (hasSplitQueries) {
        return {
          diffNode: null,
          trackedNode: field,
        };
      }
    } else {
      // The items in this array are not fetchable by ID, so nothing else
      // could have fetched additional data for individual items. Therefore,
      // we only need to diff the first record to figure out which fields have
      // previously been fetched.
      const sampleItemID = linkedIDs[0];
      return this.traverse(
        field,
        RelayQueryPath.getPath(path, field, sampleItemID),
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
    path: QueryPath,
    dataID: DataID,
  ): ?DiffOutput {
    const store: RelayRecordStore = this._store;
    const connectionID = store.getLinkedRecordID(dataID, field.getStorageKey());
    const rangeInfo = store.getRangeMetadata(
      connectionID,
      field.getCallsWithValues()
    );
    // Keep the field if the connection is unfetched
    if (connectionID === undefined) {
      return {
        diffNode: field,
        trackedNode: null,
      };
    }
    // Don't fetch if connection is null, but continue to track the fragment
    if (connectionID === null) {
      return {
        diffNode: null,
        trackedNode: field,
      };
    }
    // If metadata fields but not edges are fetched, diff as a normal field.
    // In practice, `rangeInfo` is `undefined` if unfetched, `null` if the
    // connection was deleted (in which case `connectionID` is null too).
    if (rangeInfo == null) {
      return this.traverse(
        field,
        RelayQueryPath.getPath(path, field, connectionID),
        makeScope(connectionID)
      );
    }
    const {diffCalls, filteredEdges} = rangeInfo;

    // check existing edges for missing fields
    let hasSplitQueries = false;
    filteredEdges.forEach(edge => {
      const scope = {
        connectionField: field,
        dataID: connectionID,
        edgeID: edge.edgeID,
        rangeInfo,
      };
      const diffOutput = this.traverse(
        field,
        RelayQueryPath.getPath(path, field, edge.edgeID),
        scope
      );
      // If any edges were missing data (resulting in a split query),
      // then the entire original connection field must be tracked.
      if (diffOutput) {
        hasSplitQueries = hasSplitQueries || !!diffOutput.trackedNode;
      }
    });

    // Scope has null `edgeID` to skip looking at `edges` fields.
    const scope = {
      connectionField: field,
      dataID: connectionID,
      edgeID: null,
      rangeInfo,
    };
    // diff non-`edges` fields such as `count`
    const diffOutput = this.traverse(
      field,
      RelayQueryPath.getPath(path, field, connectionID),
      scope
    );
    var diffNode = diffOutput ? diffOutput.diffNode : null;
    var trackedNode = diffOutput ? diffOutput.trackedNode : null;
    if (diffCalls.length && diffNode instanceof RelayQuery.Field) {
      diffNode = diffNode.cloneFieldWithCalls(
        diffNode.getChildren(),
        diffCalls
      );
    }
    // if a sub-query was split, then we must track the entire field, which will
    // be a superset of the `trackedNode` from traversing any metadata fields.
    // Example:
    // dataID: `4`
    // node: `friends.first(3)`
    // diffNode: null
    // splitQueries: `node(friend1) {...}`, `node(friend2) {...}`
    //
    // In this case the two fetched `node` queries do not reflect the fact that
    // `friends.first(3)` were fetched for item `4`, so `friends.first(3)` has
    // to be tracked as-is.
    if (hasSplitQueries) {
      trackedNode = field;
    }

    return {
      diffNode,
      trackedNode,
    };
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
    path: QueryPath,
    edgeID: DataID,
    rangeInfo: RangeInfo
  ): DiffOutput {

    let hasSplitQueries = false;
    const diffOutput = this.traverse(
      edgeField,
      RelayQueryPath.getPath(path, edgeField, edgeID),
      makeScope(edgeID)
    );
    const diffNode = diffOutput ? diffOutput.diffNode : null;
    const trackedNode = diffOutput ? diffOutput.trackedNode : null;
    const nodeID = this._store.getLinkedRecordID(edgeID, NODE);

    if (diffNode) {
      if (!nodeID || RelayRecord.isClientID(nodeID)) {
        warning(
          connectionField.isConnectionWithoutNodeID(),
          'RelayDiffQueryBuilder: Field `node` on connection `%s` cannot be ' +
          'retrieved if it does not have an `id` field. If you expect fields ' +
          'to be retrieved on this field, add an `id` field in the schema. ' +
          'If you choose to ignore this warning, you can silence it by ' +
          'adding `@relay(isConnectionWithoutNodeID: true)` to the ' +
          'connection field.',
          connectionField.getStorageKey()
        );
      } else {
        /* eslint-disable prefer-const */
        let {
          edges: diffEdgesField,
          node: diffNodeField,
        } = splitNodeAndEdgesFields(diffNode);
        /* eslint-enable prefer-const */

        // split missing `node` fields into a `node(id)` root query
        if (diffNodeField) {
          hasSplitQueries = true;
          const nodeField = edgeField.getFieldByStorageKey('node');
          invariant(
            nodeField,
            'RelayDiffQueryBuilder: Expected connection `%s` to have a ' +
            '`node` field.',
            connectionField.getSchemaName()
          );
          this.splitQuery(buildRoot(
            nodeID,
            diffNodeField.getChildren(),
            RelayQueryPath.getName(path),
            nodeField.getType()
          ));
        }

        // split missing `edges` fields into a `connection.find(id)` query
        // if `find` is supported, otherwise warn
        if (diffEdgesField) {
          if (connectionField.isFindable()) {
            diffEdgesField = diffEdgesField
              .clone(diffEdgesField.getChildren().concat(nodeWithID));
            const connectionFind = connectionField.cloneFieldWithCalls(
              [diffEdgesField],
              rangeInfo.filterCalls.concat({name: 'find', value: nodeID})
            );
            if (connectionFind) {
              hasSplitQueries = true;
              // current path has `parent`, `connection`, `edges`; pop to parent
              const connectionParent = RelayQueryPath.getParent(
                RelayQueryPath.getParent(path)
              );
              const connectionQuery = RelayQueryPath.getQuery(
                this._store,
                connectionParent,
                connectionFind
              );
              this.splitQuery(connectionQuery);
            }
          } else {
            warning(
              false,
              'RelayDiffQueryBuilder: connection `edges{*}` fields can only ' +
              'be refetched if the connection supports the `find` call. ' +
              'Cannot refetch data for field `%s`.',
              connectionField.getStorageKey()
            );
          }
        }
      }
    }

    // Connection edges will never return diff nodes; instead missing fields
    // are fetched by new root queries. Tracked nodes are returned if either
    // a child field was tracked or missing fields were split into a new query.
    // The returned `trackedNode` is never tracked directly: instead it serves
    // as an indicator to `diffConnection` that the entire connection field must
    // be tracked.
    return {
      diffNode: null,
      trackedNode: hasSplitQueries ? edgeField : trackedNode,
    };
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
  const children = edgeOrFragment.getChildren();
  const edgeChildren = [];
  let nodeChild = null;
  let nodeChildren = [];
  let hasEdgeChild = false;
  for (let ii = 0; ii < children.length; ii++) {
    const child = children[ii];
    if (child instanceof RelayQuery.Field) {
      if (child.getSchemaName() === NODE) {
        const subFields = child.getChildren();
        nodeChildren = nodeChildren.concat(subFields);
        // can skip if `node` only has an `id` field
        if (!nodeChild) {
          if (subFields.length === 1) {
            const subField = subFields[0];
            if (
              !(subField instanceof RelayQuery.Field) ||
              subField.getSchemaName() !== 'id'
            ) {
              nodeChild = child;
            }
          } else {
            nodeChild = child;
          }
        }
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
        nodeChild = node;
      }
    }
  }

  return {
    edges: hasEdgeChild ? edgeOrFragment.clone(edgeChildren) : null,
    node: nodeChild && RelayQuery.Fragment.build(
      'diffRelayQuery',
      nodeChild.getType(),
      nodeChildren,
      {
        isAbstract: nodeChild.isAbstract(),
      }
    ),
  };
}

function buildRoot(
  rootID: DataID,
  nodes: Array<RelayQuery.Node>,
  name: string,
  type: string
): RelayQuery.Root {
  const children = [idField, typeField];
  const fields = [];
  nodes.forEach(node => {
    if (node instanceof RelayQuery.Field) {
      fields.push(node);
    } else {
      children.push(node);
    }
  });
  children.push(RelayQuery.Fragment.build(
    'diffRelayQuery',
    type,
    fields
  ));

  return RelayQuery.Root.build(
    name,
    NODE,
    rootID,
    children,
    {
      identifyingArgName: ID,
      identifyingArgType: ID_TYPE,
      isAbstract: true,
      isDeferred: false,
      isPlural: false,
    },
    NODE_TYPE
  );
}

module.exports = RelayProfiler.instrument('diffRelayQuery', diffRelayQuery);

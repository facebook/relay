/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule intersectRelayQuery
 * @typechecks
 * @flow
 */

'use strict';

var RelayConnectionInterface = require('RelayConnectionInterface');
var RelayQuery = require('RelayQuery');
var RelayQueryTransform = require('RelayQueryTransform');

var invariant = require('invariant');

type UnterminatedRangeFilter = (node: RelayQuery.Field) => boolean;

/**
 * @internal
 *
 * `intersectRelayQuery(subjectNode, patternNode)` returns a node with fields in
 * `subjectNode` that also exist in `patternNode`. `patternNode` is expected to
 * be flattened (and not contain fragments).
 *
 * If any field in `patternNode` is unterminated (i.e. has no sub-fields), we
 * treat the field as though it contains every descendant sub-field.
 *
 * If `filterUnterminatedRange` is supplied, it will be invoked with any fields
 * from `subjectNode` that are connections and unterminated in `patternNode`. If
 * it returns true, the `edges` and `page_info` fields will be filtered out.
 */
function intersectRelayQuery<Tn: RelayQuery.Node>(
  subjectNode: Tn,
  patternNode: RelayQuery.Node,
  filterUnterminatedRange?: UnterminatedRangeFilter,
): ?Tn {
  filterUnterminatedRange = filterUnterminatedRange || returnsFalse;
  var visitor = new RelayQueryIntersector(filterUnterminatedRange);
  return visitor.traverse(subjectNode, patternNode);
}

class RelayQueryIntersector extends RelayQueryTransform<RelayQuery.Node> {
  _filterUnterminatedRange: UnterminatedRangeFilter;

  constructor(filterUnterminatedRange: UnterminatedRangeFilter) {
    super();
    this._filterUnterminatedRange = filterUnterminatedRange;
  }

  traverse<Tn: RelayQuery.Node>(
    subjectNode: Tn,
    patternNode: RelayQuery.Node,
  ): ?Tn {
    if (subjectNode.isScalar()) {
      // Since `patternNode` exists, `subjectNode` must be in the intersection.
      return subjectNode;
    }
    if (!hasChildren(patternNode)) {
      if (subjectNode instanceof RelayQuery.Field &&
          subjectNode.isConnection() &&
          this._filterUnterminatedRange(subjectNode)) {
        return filterRangeFields(subjectNode);
      }
      // Unterminated `patternNode` is the same as containing every descendant
      // sub-field, so `subjectNode` must be in the intersection.
      return subjectNode;
    }
    return subjectNode.clone(subjectNode.getChildren().map(subjectChild => {
      if (subjectChild instanceof RelayQuery.Fragment) {
        return this.visit(subjectChild, patternNode);
      }
      if (subjectChild instanceof RelayQuery.Field) {
        var schemaName = subjectChild.getSchemaName();
        var patternChild;
        var patternChildren = patternNode.getChildren();
        for (var ii = 0; ii < patternChildren.length; ii++) {
          var child = patternChildren[ii];
          invariant(
            child instanceof RelayQuery.Field,
            'intersectRelayQuery(): Nodes in `patternNode` must be fields.'
          );
          if (child.getSchemaName() === schemaName) {
            patternChild = child;
            break;
          }
        }
        if (patternChild) {
          return this.visit(subjectChild, patternChild);
        }
      }
      return null;
    }));
  }
}

/**
 * @private
 */
class RelayQueryRangeFilter extends RelayQueryTransform<void> {
  visitField(node: RelayQuery.Field): ?RelayQuery.Node {
    var schemaName = node.getSchemaName();
    if (schemaName === RelayConnectionInterface.EDGES ||
        schemaName === RelayConnectionInterface.PAGE_INFO) {
      return null;
    } else {
      return node;
    }
  }
}

var rangeFilter = new RelayQueryRangeFilter();
function filterRangeFields<Tn: RelayQuery.Field>(node: Tn): ?Tn {
  return rangeFilter.traverse(node, undefined);
}

function returnsFalse(): boolean {
  return false;
}

function hasChildren(node: RelayQuery.Node): boolean {
  return !node.getChildren().every(isGenerated);
}

function isGenerated(node: RelayQuery.Node): boolean {
  return node.isGenerated();
}

module.exports = intersectRelayQuery;

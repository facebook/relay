/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule intersectRelayQuery
 * @typechecks
 * 
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var RelayConnectionInterface = require('./RelayConnectionInterface');
var RelayQuery = require('./RelayQuery');
var RelayQueryTransform = require('./RelayQueryTransform');

var invariant = require('fbjs/lib/invariant');

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
function intersectRelayQuery(subjectNode, patternNode, filterUnterminatedRange) {
  filterUnterminatedRange = filterUnterminatedRange || returnsFalse;
  var visitor = new RelayQueryIntersector(filterUnterminatedRange);
  return visitor.traverse(subjectNode, patternNode);
}

var RelayQueryIntersector = (function (_RelayQueryTransform) {
  _inherits(RelayQueryIntersector, _RelayQueryTransform);

  function RelayQueryIntersector(filterUnterminatedRange) {
    _classCallCheck(this, RelayQueryIntersector);

    _RelayQueryTransform.call(this);
    this._filterUnterminatedRange = filterUnterminatedRange;
  }

  /**
   * @private
   */

  RelayQueryIntersector.prototype.traverse = function traverse(subjectNode, patternNode) {
    var _this = this;

    if (!subjectNode.canHaveSubselections()) {
      // Since `patternNode` exists, `subjectNode` must be in the intersection.
      return subjectNode;
    }
    if (!hasChildren(patternNode)) {
      if (subjectNode instanceof RelayQuery.Field && subjectNode.isConnection() && this._filterUnterminatedRange(subjectNode)) {
        return filterRangeFields(subjectNode);
      }
      // Unterminated `patternNode` is the same as containing every descendant
      // sub-field, so `subjectNode` must be in the intersection.
      return subjectNode;
    }
    return subjectNode.clone(subjectNode.getChildren().map(function (subjectChild) {
      if (subjectChild instanceof RelayQuery.Fragment) {
        return _this.visit(subjectChild, patternNode);
      }
      if (subjectChild instanceof RelayQuery.Field) {
        var schemaName = subjectChild.getSchemaName();
        var patternChild;
        var patternChildren = patternNode.getChildren();
        for (var ii = 0; ii < patternChildren.length; ii++) {
          var child = patternChildren[ii];
          !(child instanceof RelayQuery.Field) ? process.env.NODE_ENV !== 'production' ? invariant(false, 'intersectRelayQuery(): Nodes in `patternNode` must be fields.') : invariant(false) : undefined;
          if (child.getSchemaName() === schemaName) {
            patternChild = child;
            break;
          }
        }
        if (patternChild) {
          return _this.visit(subjectChild, patternChild);
        }
      }
      return null;
    }));
  };

  return RelayQueryIntersector;
})(RelayQueryTransform);

var RelayQueryRangeFilter = (function (_RelayQueryTransform2) {
  _inherits(RelayQueryRangeFilter, _RelayQueryTransform2);

  function RelayQueryRangeFilter() {
    _classCallCheck(this, RelayQueryRangeFilter);

    _RelayQueryTransform2.apply(this, arguments);
  }

  RelayQueryRangeFilter.prototype.visitField = function visitField(node) {
    var schemaName = node.getSchemaName();
    if (schemaName === RelayConnectionInterface.EDGES || schemaName === RelayConnectionInterface.PAGE_INFO) {
      return null;
    } else {
      return node;
    }
  };

  return RelayQueryRangeFilter;
})(RelayQueryTransform);

var rangeFilter = new RelayQueryRangeFilter();
function filterRangeFields(node) {
  return rangeFilter.traverse(node, undefined);
}

function returnsFalse() {
  return false;
}

function hasChildren(node) {
  return !node.getChildren().every(isGenerated);
}

function isGenerated(node) {
  return node.isGenerated();
}

module.exports = intersectRelayQuery;
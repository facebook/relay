/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenRelayQuery
 * 
 * @typechecks
 */

'use strict';

var _inherits = require('babel-runtime/helpers/inherits')['default'];

var _classCallCheck = require('babel-runtime/helpers/class-call-check')['default'];

var _Array$from = require('babel-runtime/core-js/array/from')['default'];

Object.defineProperty(exports, '__esModule', {
  value: true
});
var Map = require('fbjs/lib/Map');
var RelayProfiler = require('./RelayProfiler');
var RelayQuery = require('./RelayQuery');
var RelayQueryVisitor = require('./RelayQueryVisitor');

var sortTypeFirst = require('./sortTypeFirst');

/**
 * @internal
 *
 * `flattenRelayQuery(query)` returns a clone of `query` with fields inside of
 * fragments recursively flattened into the nearest ancestor field.
 *
 * The result can be null if `node` only contains empty fragments or fragments
 * that only contain empty fragments.
 */
function flattenRelayQuery(node, options) {
  var flattener = new RelayQueryFlattener(options && options.shouldRemoveFragments);
  var state = {
    node: node,
    type: node.getType(),
    flattenedFieldMap: new Map(),
    flattenedFragmentMap: new Map()
  };
  flattener.traverse(node, state);
  return toQuery(node, state, !!(options && options.preserveEmptyNodes));
}

function toQuery(node, _ref, preserveEmptyNodes) {
  var flattenedFieldMap = _ref.flattenedFieldMap;
  var flattenedFragmentMap = _ref.flattenedFragmentMap;

  var children = [];
  var aliases = _Array$from(flattenedFieldMap.keys()).sort(sortTypeFirst);
  aliases.forEach(function (alias) {
    var field = flattenedFieldMap.get(alias);
    if (field) {
      children.push(toQuery(field.node, field, preserveEmptyNodes));
    }
  });
  _Array$from(flattenedFragmentMap.keys()).forEach(function (type) {
    var fragment = flattenedFragmentMap.get(type);
    if (fragment) {
      children.push(toQuery(fragment.node, fragment, preserveEmptyNodes));
    }
  });
  // Pattern nodes may contain non-scalar fields without children that
  // should not be removed.
  if (preserveEmptyNodes && node.canHaveSubselections() && !children.length) {
    return node;
  }
  return node.clone(children);
}

var RelayQueryFlattener = (function (_RelayQueryVisitor) {
  _inherits(RelayQueryFlattener, _RelayQueryVisitor);

  function RelayQueryFlattener(shouldRemoveFragments) {
    _classCallCheck(this, RelayQueryFlattener);

    _RelayQueryVisitor.call(this);
    this._shouldRemoveFragments = !!shouldRemoveFragments;
  }

  RelayQueryFlattener.prototype.visitFragment = function visitFragment(node, state) {
    var type = node.getType();
    if (this._shouldRemoveFragments || type === state.type) {
      this.traverse(node, state);
      return;
    }
    var flattenedFragment = state.flattenedFragmentMap.get(type);
    if (!flattenedFragment) {
      flattenedFragment = {
        node: node,
        type: type,
        flattenedFieldMap: new Map(),
        flattenedFragmentMap: new Map()
      };
      state.flattenedFragmentMap.set(type, flattenedFragment);
    }
    this.traverse(node, flattenedFragment);
  };

  RelayQueryFlattener.prototype.visitField = function visitField(node, state) {
    var hash = node.getShallowHash();
    var flattenedField = state.flattenedFieldMap.get(hash);
    if (!flattenedField) {
      flattenedField = {
        node: node,
        type: node.getType(),
        flattenedFieldMap: new Map(),
        flattenedFragmentMap: new Map()
      };
      state.flattenedFieldMap.set(hash, flattenedField);
    }
    this.traverse(node, flattenedField);
  };

  return RelayQueryFlattener;
})(RelayQueryVisitor);

module.exports = RelayProfiler.instrument('flattenRelayQuery', flattenRelayQuery);
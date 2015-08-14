/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenRelayQuery
 * @flow
 * @typechecks
 */

'use strict';

var RelayProfiler = require('RelayProfiler');
import type RelayQuery from 'RelayQuery';
var RelayQueryVisitor = require('RelayQueryVisitor');

var sortTypeFirst = require('sortTypeFirst');

type FlattenedQuery = {
  node: RelayQuery.Node;
  flattenedFieldMap: {[key: string]: FlattenedQuery};
};

/**
 * @internal
 *
 * `flattenRelayQuery(query)` returns a clone of `query` with fields inside of
 * fragments recursively flattened into the nearest ancestor field.
 *
 * The result can be null if `node` only contains empty fragments or fragments
 * that only contain empty fragments.
 */
function flattenRelayQuery<Tn: RelayQuery.Node>(node: Tn): ?Tn {
  var flattener = new RelayQueryFlattener();
  var flattenedFieldMap = {};
  flattener.traverse(node, {node, flattenedFieldMap});
  return toQuery(node, flattenedFieldMap);
}

function toQuery<Tn: RelayQuery.Node>(
  node: Tn,
  flattenedFieldMap: {[key: string]: FlattenedQuery}
): ?Tn {
  var keys = Object.keys(flattenedFieldMap).sort(sortTypeFirst);
  return node.clone(
    keys.map(alias => {
      var field = flattenedFieldMap[alias];
      if (field) {
        return toQuery(field.node, field.flattenedFieldMap);
      }
    })
  );
}

class RelayQueryFlattener extends RelayQueryVisitor<FlattenedQuery> {
  visitField(
    node: RelayQuery.Field,
    state: FlattenedQuery
  ): ?RelayQuery.Node {
    var serializationKey = node.getSerializationKey();
    var flattenedField = state.flattenedFieldMap[serializationKey];
    if (!flattenedField) {
      flattenedField = {
        node,
        flattenedFieldMap: {}
      };
      state.flattenedFieldMap[serializationKey] = flattenedField;
    }
    this.traverse(node, flattenedField);
  }
}

module.exports = RelayProfiler.instrument(
  'flattenRelayQuery',
  flattenRelayQuery
);

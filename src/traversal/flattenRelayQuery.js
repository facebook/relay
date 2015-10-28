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

/* @flow */
class FlattenedMap {
  hash:  { [key: string]: Object };
  array: [ string ];

  constructor() {
    this.hash = {};
    this.array = [];
  }

  get(key): FlattenedQuery {
    var hashValue = this.hash[key];
    return hashValue && hashValue.value || undefined;
  }

  set(key, value) {
    var old = this.hash[key];
    if (old) { this.array.splice(old.index, 1); }
    this.hash[key] = { value: value, index: this.array.length };
    this.array.push(key);
  }

  keys(): [ string ] {
    return this.array;
  }
}

type FlattenedQuery = {
  node: RelayQuery.Node;
  // flattenedFieldMap: {[key: string]: FlattenedQuery};
  flattenedFieldMap: FlattenedMap;
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
  var flattenedFieldMap = new FlattenedMap();
  flattener.traverse(node, {node, flattenedFieldMap});
  return toQuery(node, flattenedFieldMap);
}

function toQuery<Tn: RelayQuery.Node>(
  node: Tn,
  flattenedFieldMap: FlattenedMap
): ?Tn {
  var keys = flattenedFieldMap.keys().sort(sortTypeFirst);
  return node.clone(
    keys.map(alias => {
      var field = flattenedFieldMap.get(alias);
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
    var flattenedField = state.flattenedFieldMap.get(serializationKey);
    if (!flattenedField) {
      flattenedField = {
        node,
        flattenedFieldMap: new FlattenedMap()
      };
      state.flattenedFieldMap.set(serializationKey, flattenedField);
    }
    this.traverse(node, flattenedField);
  }
}

module.exports = RelayProfiler.instrument(
  'flattenRelayQuery',
  flattenRelayQuery
);

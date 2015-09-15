/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule refragmentRelayQuery
 * @flow
 * @typechecks
 */

'use strict';

var RelayQuery = require('RelayQuery');

var invariant = require('invariant');

type FieldMap = {[key: string]: TypedQueryMap};
type TypedQueryMap = {
  node: RelayQuery.Node;
  fieldsByType: {[type: string]: FieldMap};
};

/**
 * @internal
 *
 * `refragmentRelayQuery(query)` returns a clone of `query` such that child
 * fields of dynamically-typed nodes are split into fragments by type. This is
 * necessary when refetching information about a record. The fields fetched for
 * a record may only be available via certain types:
 *
 * ```
 * // Input:
 * {
 *   id,    // fetched via a field of type `Node`
 *   name,  // fetched via a field of type `User`
 * }
 *
 * // Becomes:
 * {
 *   ...on Node { id },
 *   ...on User { name },
 * }
 * ```
 */
function refragmentRelayQuery<Tn: RelayQuery.Node>(node: Tn): ?Tn {
  // Refragmenting is not necessary in these cases:
  // - fragments are primarily constructed by end users, and their fields are
  //   validated at transpile-time.
  // - fields that have a concrete type will always have valid fields.
  if (
    node instanceof RelayQuery.Fragment ||
    (node instanceof RelayQuery.Field && !node.isUnionOrInterface())
  ) {
    return node.clone(node.getChildren().map(refragmentRelayQuery));
  }

  // In all other cases, the fields of a node may be type-dependent:
  // - fields with union/interface types may have varying fields that must
  //   be fragmented.
  // - root fields are fragmented for simplicity, though they can eventually
  //   be annotated with the `isUnionOrInterface` metadata and be treated as
  //   fields.
  var children = [];
  var fieldsByType = {};
  node.getChildren().forEach(child => {
    var clone = refragmentRelayQuery(child);
    if (clone == null) {
      return;
    }
    if (clone instanceof RelayQuery.Fragment) {
      children.push(clone);
    } else {
      invariant(
        clone instanceof RelayQuery.Field,
        'refragmentRelayQuery(): invalid node type, expected a `Field` or ' +
        '`Fragment`.'
      );
      var parentType = clone.getParentType();
      var fields = fieldsByType[parentType];
      if (!fields) {
        fieldsByType[parentType] = fields = [];
      }
      fields.push(clone);
    }
  });
  Object.keys(fieldsByType).forEach(type => {
    children.push(RelayQuery.Fragment.build(
      'refragmentRelayQuery',
      type,
      fieldsByType[type]
    ));
  });
  return node.clone(children);
}

module.exports = refragmentRelayQuery;

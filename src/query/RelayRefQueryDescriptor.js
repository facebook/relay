/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule RelayRefQueryDescriptor
 * @flow
 * @typechecks
 */

'use strict';

import type RelayQuery from 'RelayQuery';

export type NodePath = Array<RelayQuery.Node>;

/**
 * @internal
 *
 * Represents a node that will eventually become a "ref query".
 *
 * Includes the "path" context (ancestor nodes) that can be used to construct an
 * appropriate the JSONPath for the query.
 *
 * @see splitDeferredRelayQueries
 */
class RelayRefQueryDescriptor {
  node: RelayQuery.Node;
  path: NodePath;

  constructor(node: RelayQuery.Node, path: NodePath) {
    this.node = node;
    this.path = path;
  }
}

module.exports = RelayRefQueryDescriptor;

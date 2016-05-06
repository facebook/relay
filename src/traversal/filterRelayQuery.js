/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule filterRelayQuery
 * @flow
 */

'use strict';

import type RelayQuery from 'RelayQuery';

type Filter = (node: RelayQuery.Node) => boolean;

/**
 * @internal
 *
 * `filterRelayQuery` filters query nodes for which `callback` returns false.
 * This is intended as a generic filter module and therefore contains no special
 * logic for handling requisite or generated fields.
 */
function filterRelayQuery(
  node: RelayQuery.Node,
  callback: Filter
): ?RelayQuery.Node {
  if (callback(node)) {
    return node.clone(node.getChildren().map(
      child => filterRelayQuery(child, callback)
    ));
  }
  return null;
}

module.exports = filterRelayQuery;

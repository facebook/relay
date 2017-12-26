/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 * @format
 */

'use strict';

import type RelayQuery from '../query/RelayQuery';

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
  callback: Filter,
): ?RelayQuery.Node {
  if (callback(node)) {
    return node.clone(
      node.getChildren().map(child => filterRelayQuery(child, callback)),
    );
  }
  return null;
}

module.exports = filterRelayQuery;

/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

/**
 * Generate an edge client id for edges on connections based on the range it
 * belongs to and the node it contains.
 *
 * @internal
 */
function generateClientEdgeID(rangeID: string, nodeID: string): string {
  return 'client:' + rangeID + ':' + nodeID;
}

module.exports = generateClientEdgeID;

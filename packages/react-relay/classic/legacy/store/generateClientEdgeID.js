/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule generateClientEdgeID
 * @flow
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

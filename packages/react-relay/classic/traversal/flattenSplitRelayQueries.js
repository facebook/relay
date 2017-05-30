/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule flattenSplitRelayQueries
 * @flow
 * @format
 */

'use strict';

import type RelayQuery from 'RelayQuery';
import type {SplitQueries} from 'splitDeferredRelayQueries';

/**
 * Flattens the nested structure returned by `splitDeferredRelayQueries`.
 *
 * Right now our internals discard the information about the relationship
 * between the queries that is encoded in the nested structure.
 *
 * @internal
 */
function flattenSplitRelayQueries(
  splitQueries: SplitQueries,
): Array<RelayQuery.Root> {
  const flattenedQueries = [];
  const queue = [splitQueries];
  while (queue.length) {
    splitQueries = queue.shift();
    const {required, deferred} = splitQueries;
    if (required) {
      flattenedQueries.push(required);
    }
    if (deferred.length) {
      queue.push(...deferred);
    }
  }
  return flattenedQueries;
}

module.exports = flattenSplitRelayQueries;

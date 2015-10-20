/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule fetchRelayQuery
 * @typechecks
 * @flow
 */

'use strict';

var Promise = require('Promise');
var RelayNetworkLayer = require('RelayNetworkLayer');
var RelayProfiler = require('RelayProfiler');
var RelayQueryRequest = require('RelayQueryRequest');
import type RelayQuery from 'RelayQuery';

var resolveImmediate = require('resolveImmediate');

var queue: ?Array<RelayQueryRequest> = null;

/**
 * @internal
 *
 * Schedules the supplied `query` to be sent to the server.
 *
 * This is a low-level transport API; application code should use higher-level
 * interfaces exposed by RelayContainer for retrieving data transparently via
 * queries defined on components.
 */
function fetchRelayQuery(query: RelayQuery.Root): Promise {
  if (!queue) {
    queue = [];
    var currentQueue = queue;
    resolveImmediate(() => {
      queue = null;
      profileQueue(currentQueue);
      processQueue(currentQueue);
    });
  }
  var request = new RelayQueryRequest(query);
  queue.push(request);
  return request.getPromise();
}

function processQueue(currentQueue: Array<RelayQueryRequest>): void {
  RelayNetworkLayer.sendQueries(currentQueue);
}

/**
 * Profiles time from request to receiving the first server response.
 */
function profileQueue(currentQueue: Array<RelayQueryRequest>): void {
  // TODO #8783781: remove aggregate `fetchRelayQuery` profiler
  var firstResultProfiler = RelayProfiler.profile('fetchRelayQuery');
  currentQueue.forEach(query => {
    var profiler = RelayProfiler.profile('fetchRelayQuery.query');
    query.getPromise().finally(() => {
      profiler.stop();
      if (firstResultProfiler) {
        firstResultProfiler.stop();
        firstResultProfiler = null;
      }
    });
  });
}

module.exports = fetchRelayQuery;

'use strict';

var Promise = require('fbjs/lib/Promise');

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule fetchRelayQuery
 * @typechecks
 * 
 */

'use strict';

var RelayNetworkLayer = require('./RelayNetworkLayer');
var RelayProfiler = require('./RelayProfiler');
var RelayQueryRequest = require('./RelayQueryRequest');

var resolveImmediate = require('fbjs/lib/resolveImmediate');

var queue = null;

/**
 * @internal
 *
 * Schedules the supplied `query` to be sent to the server.
 *
 * This is a low-level transport API; application code should use higher-level
 * interfaces exposed by RelayContainer for retrieving data transparently via
 * queries defined on components.
 */
function fetchRelayQuery(query) {
  if (!queue) {
    (function () {
      queue = [];
      var currentQueue = queue;
      resolveImmediate(function () {
        queue = null;
        profileQueue(currentQueue);
        processQueue(currentQueue);
      });
    })();
  }
  var request = new RelayQueryRequest(query);
  queue.push(request);
  return request.getPromise();
}

function processQueue(currentQueue) {
  RelayNetworkLayer.sendQueries(currentQueue);
}

/**
 * Profiles time from request to receiving the first server response.
 */
function profileQueue(currentQueue) {
  // TODO #8783781: remove aggregate `fetchRelayQuery` profiler
  var firstResultProfiler = RelayProfiler.profile('fetchRelayQuery');
  currentQueue.forEach(function (query) {
    var profiler = RelayProfiler.profile('fetchRelayQuery.query');
    var onSettle = function onSettle() {
      profiler.stop();
      if (firstResultProfiler) {
        firstResultProfiler.stop();
        firstResultProfiler = null;
      }
    };
    query.getPromise().done(onSettle, onSettle);
  });
}

module.exports = fetchRelayQuery;
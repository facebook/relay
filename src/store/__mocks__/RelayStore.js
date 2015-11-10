/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');
var RelayDeferredFragmentState = require('RelayDeferredFragmentState');
var RelayStore = jest.genMockFromModule('RelayStore');
var RelayStoreData = require('RelayStoreData');

var resolveImmediate = require('resolveImmediate');

/**
 * Mock object to simulate the behavior of a request. Example usage:
 *
 *   RelayStore.primeCache(...);
 *   RelayStore.primeCache.mock.requests[0].block();
 *   RelayStore.primeCache.mock.requests[0].fail(new Error());
 *
 * A normal request should follow one of the following behaviors:
 *
 *   block? -> resolve* -> succeed
 *   block? -> resolve* -> fail
 *
 */
function genMockRequest(args) {
  var ready = false;
  return {
    abort() {
      args[1]({aborted: true, done: false, error: null, ready, stale: false});
    },
    block() {
      args[1]({aborted: false, done: false, error: null, ready, stale: false});
    },
    resolve(config) {
      var stale = config ? !!config.stale : false;
      ready = true;
      args[1]({aborted: false, done: false, error: null, ready, stale});
    },
    succeed() {
      ready = true;
      args[1]({aborted: false, done: true, error: null, ready, stale: false});
    },
    fail(error) {
      args[1]({aborted: false, done: false, error, ready, stale: false});
    },
  };
}

var storeData = new RelayStoreData();

RelayStore.primeCache.mock.abort = [];
RelayStore.primeCache.mock.requests = [];
RelayStore.primeCache.mockImplementation((...args) => {
  var request = genMockRequest(args);
  var returnValue = {
    abort: jest.genMockFunction().mockImplementation(() => {
      resolveImmediate(request.abort);
    })
  };
  RelayStore.primeCache.mock.abort.push(returnValue.abort);
  RelayStore.primeCache.mock.requests.push(request);
  return returnValue;
});

RelayStore.forceFetch.mock.abort = [];
RelayStore.forceFetch.mock.requests = [];
RelayStore.forceFetch.mockImplementation((...args) => {
  var request = genMockRequest(args);
  var returnValue = {
    abort: jest.genMockFunction().mockImplementation(() => {
      resolveImmediate(request.abort);
    })
  };
  RelayStore.forceFetch.mock.abort.push(returnValue.abort);
  RelayStore.forceFetch.mock.requests.push(request);
  return returnValue;
});

RelayStore.hasOptimisticUpdate.mockImplementation((dataID) => {
  return storeData.hasOptimisticUpdate(dataID);
});

RelayStore.resolve.mockImplementation((...args) => {
  return new GraphQLStoreQueryResolver(storeData, ...args);
});

RelayStore.createDeferredFragmentState.mockImplementation((...args) => {
  return new RelayDeferredFragmentState(
    storeData.getDeferredQueryTracker(),
    storeData.getPendingQueryTracker(),
    ...args
  );
});

RelayStore.buildFragmentQueryForDataID.mockImplementation((...args) => {
  return storeData.buildFragmentQueryForDataID(...args);
});

RelayStore._getStoreData = jest.genMockFunction().mockImplementation(() => storeData);

module.exports = RelayStore;

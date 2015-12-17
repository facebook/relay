/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var RelayStore = jest.genMockFromModule('RelayStore');
const RelayRecordStore = require('RelayRecordStore');

const resolveImmediate = require('resolveImmediate');

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

RelayStore.primeCache.mock.abort = [];
RelayStore.primeCache.mock.requests = [];
RelayStore.primeCache.mockImplementation((...args) => {
  var request = genMockRequest(args);
  var returnValue = {
    abort: jest.genMockFunction().mockImplementation(() => {
      resolveImmediate(request.abort);
    }),
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
    }),
  };
  RelayStore.forceFetch.mock.abort.push(returnValue.abort);
  RelayStore.forceFetch.mock.requests.push(request);
  return returnValue;
});

RelayStore.mock = {
  setMockRecords: records => {
    RelayStore.mock.recordStore = new RelayRecordStore({records});
  },
  recordStore: null,
};

module.exports = RelayStore;

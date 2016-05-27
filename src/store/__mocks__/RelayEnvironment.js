/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const RelayEnvironment = require.requireActual('RelayEnvironment');
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
  let ready = false;
  let error = null;
  return {
    abort() {
      args[1]({aborted: true, done: false, error, ready, stale: false});
    },
    block() {
      args[1]({aborted: false, done: false, error, ready, stale: false});
    },
    resolve(config) {
      const stale = config ? !!config.stale : false;
      ready = true;
      args[1]({aborted: false, done: false, error, ready, stale});
    },
    succeed() {
      ready = true;
      args[1]({aborted: false, done: true, error, ready, stale: false});
    },
    fail(e) {
      error = e;
      args[1]({aborted: false, done: false, error, ready, stale: false});
    },
  };
}

class MockRelayEnvironment extends RelayEnvironment {
  constructor() {
    super();

    for (const method of ['getFragmentResolver', 'read']) {
      this[method] = jest.fn(RelayEnvironment.prototype[method]);
    }

    this.primeCache = jest.fn();
    this.primeCache.mock.abort = [];
    this.primeCache.mock.requests = [];
    this.primeCache.mockImplementation((...args) => {
      const request = genMockRequest(args);
      const returnValue = {
        abort: jest.fn(() => {
          resolveImmediate(request.abort);
        }),
      };
      this.primeCache.mock.abort.push(returnValue.abort);
      this.primeCache.mock.requests.push(request);
      return returnValue;
    });

    this.forceFetch = jest.fn();
    this.forceFetch.mock.abort = [];
    this.forceFetch.mock.requests = [];
    this.forceFetch.mockImplementation((...args) => {
      const request = genMockRequest(args);
      const returnValue = {
        abort: jest.fn(() => {
          resolveImmediate(request.abort);
        }),
      };
      this.forceFetch.mock.abort.push(returnValue.abort);
      this.forceFetch.mock.requests.push(request);
      return returnValue;
    });

    this.mock = {
      setMockRecords: records => {
        this.mock.recordStore = new RelayRecordStore({records});
      },
      recordStore: null,
    };
  }
}

module.exports = MockRelayEnvironment;

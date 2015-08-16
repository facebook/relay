/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var GraphQLQueryRunner = jest.genMockFromModule('GraphQLQueryRunner');

var resolveImmediate = require('resolveImmediate');

/**
 * Mock object to simulate the behavior of a request. Example usage:
 *
 *   GraphQLQueryRunner.run(...);
 *   GraphQLQueryRunner.run.mock.requests[0].block();
 *   GraphQLQueryRunner.run.mock.requests[0].fail(new Error());
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
    resolve() {
      ready = true;
      args[1]({aborted: false, done: false, error: null, ready, stale: false});
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

GraphQLQueryRunner.run.mock.abort = [];
GraphQLQueryRunner.run.mock.requests = [];
GraphQLQueryRunner.run.mockImplementation((...args) => {
  var request = genMockRequest(args);
  var returnValue = {
    abort: jest.genMockFunction().mockImplementation(() => {
      resolveImmediate(request.abort);
    })
  };
  GraphQLQueryRunner.run.mock.abort.push(returnValue.abort);
  GraphQLQueryRunner.run.mock.requests.push(request);
  return returnValue;
});

GraphQLQueryRunner.forceFetch.mock.abort = [];
GraphQLQueryRunner.forceFetch.mock.requests = [];
GraphQLQueryRunner.forceFetch.mockImplementation((...args) => {
  var request = genMockRequest(args);
  var returnValue = {
    abort: jest.genMockFunction().mockImplementation(() => {
      resolveImmediate(request.abort);
    })
  };
  GraphQLQueryRunner.forceFetch.mock.abort.push(returnValue.abort);
  GraphQLQueryRunner.forceFetch.mock.requests.push(request);
  return returnValue;
});

module.exports = GraphQLQueryRunner;

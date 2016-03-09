/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

const GraphQLQueryRunner = jest.genMockFromModule('GraphQLQueryRunner');

const resolveImmediate = require('resolveImmediate');

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
  let ready = false;
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

GraphQLQueryRunner.mockImplementation(function() {
  this.run.mock.abort = [];
  this.run.mock.requests = [];
  this.run.mockImplementation((...args) => {
    const request = genMockRequest(args);
    const returnValue = {
      abort: jest.genMockFunction().mockImplementation(() => {
        resolveImmediate(request.abort);
      }),
    };
    this.run.mock.abort.push(returnValue.abort);
    this.run.mock.requests.push(request);
    return returnValue;
  });

  this.forceFetch.mock.abort = [];
  this.forceFetch.mock.requests = [];
  this.forceFetch.mockImplementation((...args) => {
    const request = genMockRequest(args);
    const returnValue = {
      abort: jest.genMockFunction().mockImplementation(() => {
        resolveImmediate(request.abort);
      }),
    };
    this.forceFetch.mock.abort.push(returnValue.abort);
    this.forceFetch.mock.requests.push(request);
    return returnValue;
  });

  return this;
});

module.exports = GraphQLQueryRunner;

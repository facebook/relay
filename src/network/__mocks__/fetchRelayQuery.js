/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var fetchRelayQuery = jest.genMockFromModule('fetchRelayQuery');

/**
 * Mock object to simulate the behavior of a request. Example usage:
 *
 *   // Successful fetch.
 *   fetchRelayQuery(queryA);
 *   fetchRelayQuery.mock.requests[0].resolve(response);
 *
 *   // Fetch with partial error.
 *   fetchRelayQuery(queryB);
 *   fetchRelayQuery.mock.requests[0].resolve(response, error);
 *
 *   // Failed fetch.
 *   fetchRelayQuery(queryC);
 *   fetchRelayQuery.mock.requests[0].reject(error);
 *
 */
function genMockRequest(resolve, reject) {
  fetchRelayQuery.mock.requests.push({
    resolve(response, error) {
      resolve({error: error || null, response});
    },
    reject,
  });
}

fetchRelayQuery.mock.requests = [];
fetchRelayQuery.mockImplementation(() => new Promise(genMockRequest));

module.exports = fetchRelayQuery;

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */

'use strict';

const RelayNetworkLayer = require.requireActual('../RelayNetworkLayer');

function RelayNetworkLayerMock() {
  const networkLayer = new RelayNetworkLayer();

  networkLayer.fetchRelayQuery = jest.fn(() => new Promise(genMockRequest));
  const requests = (networkLayer.fetchRelayQuery.mock.requests = []);

  networkLayer.sendMutation = jest.fn();

  return networkLayer;

  /**
   * Mock object to simulate the behavior of a request. Example usage:
   *
   *   // Successful fetch.
   *   networkLayer.fetchRelayQuery(queryA);
   *   networkLayer.fetchRelayQuery.mock.requests[0].resolve(response);
   *
   *   // Fetch with partial error.
   *   networkLayer.fetchRelayQuery(queryB);
   *   networkLayer.fetchRelayQuery.mock.requests[0].resolve(response, error);
   *
   *   // Failed fetch.
   *   networkLayer.fetchRelayQuery(queryC);
   *   networkLayer.fetchRelayQuery.mock.requests[0].reject(error);
   *
   */
  function genMockRequest(resolve, reject) {
    requests.push({
      resolve(response, error) {
        resolve({error: error || null, response});
      },
      reject,
    });
  }
}

RelayNetworkLayerMock.prototype = RelayNetworkLayer.prototype;

module.exports = RelayNetworkLayerMock;

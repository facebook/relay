/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';


const Relay = require('Relay');
const RelayRoute = require('RelayRoute');
const RelayStore = require('RelayStore');

describe('GenericRelayRootContainer', () => {
  var MockContainer;
  var mockRoute;

  beforeEach(() => {
    mockRoute = RelayRoute.genMockInstance();

    MockContainer = Relay.createGenericContainer('MockComponent', {
      fragments: {
        foo: jest.genMockFunction().mockImplementation(
          () => Relay.QL`fragment on Node{id,name}`
        ),
      },
    });
  });



  it('calls callback when data is available', () => {
    const updateCallback = jest.genMockFunction();
    const rootContainer = new Relay.GenericRootContainer(updateCallback);

    rootContainer.update(MockContainer, mockRoute, false);
    expect(updateCallback).not.toBeCalled();
    RelayStore.primeCache.mock.requests[0].resolve();
    expect(updateCallback).toBeCalled();
  });

});

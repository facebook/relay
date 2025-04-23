/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 * @oncall relay
 */

const RelayNetwork = require('../../network/RelayNetwork');
const RelayModernEnvironment = require('../RelayModernEnvironment');
const RelayModernStore = require('../RelayModernStore');

describe('new Environment()', () => {
  it('creates a properly configured Relay Store if one is not provided', () => {
    const log = () => {};
    const operationLoader = {
      get: jest.fn(),
      load: jest.fn(),
    };
    const getDataID = () => 'lol';
    const shouldProcessClientComponents = true;
    const network = RelayNetwork.create(jest.fn());
    const environment = new RelayModernEnvironment({
      network,
      log,
      operationLoader,
      getDataID,
      shouldProcessClientComponents,
    });

    const store = environment.getStore();

    if (!(store instanceof RelayModernStore)) {
      throw new Error('Expected store to be an instance of RelayModernStore');
    }
    expect(store.__log).toBe(log);
  });
});

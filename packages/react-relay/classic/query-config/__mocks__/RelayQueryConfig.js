/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 * @format
 */

'use strict';

const RelayQueryConfig = require.requireActual('../RelayQueryConfig');

RelayQueryConfig.genMock = jest.fn(staticProperties => {
  class MockQueryConfig extends RelayQueryConfig {}
  MockQueryConfig.routeName = 'MockQueryConfig';
  Object.assign(MockQueryConfig, staticProperties);
  return MockQueryConfig;
});

RelayQueryConfig.genMockInstance = jest.fn(
  () => new (RelayQueryConfig.genMock())(),
);

module.exports = RelayQueryConfig;

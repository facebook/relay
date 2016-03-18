/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

'use strict';

const RelayQueryConfig = require.requireActual('RelayQueryConfig');

RelayQueryConfig.genMock = jest.fn(staticProperties => {
  class MockQueryConfig extends RelayQueryConfig {}
  MockQueryConfig.routeName = 'MockQueryConfig';
  Object.assign(MockQueryConfig, staticProperties);
  return MockQueryConfig;
});

RelayQueryConfig.genMockInstance = jest.fn(
  () => new (RelayQueryConfig.genMock())()
);

module.exports = RelayQueryConfig;

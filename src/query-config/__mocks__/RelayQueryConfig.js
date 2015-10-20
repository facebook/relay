/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @typechecks
 */

'use strict';

var RelayQueryConfig = require.requireActual('RelayQueryConfig');

RelayQueryConfig.genMock = jest.genMockFunction().mockImplementation(() => {
  class MockQueryConfig extends RelayQueryConfig {}
  MockQueryConfig.routeName = 'MockQueryConfig';
  return MockQueryConfig;
});

RelayQueryConfig.genMockInstance = jest.genMockFunction().mockImplementation(
  () => new (RelayQueryConfig.genMock())()
);

module.exports = RelayQueryConfig;

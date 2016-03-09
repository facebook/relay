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

const RelayRoute = require.requireActual('RelayRoute');

RelayRoute.genMock = jest.genMockFunction().mockImplementation(() => {
  class MockRoute extends RelayRoute {}
  MockRoute.routeName = 'MockRoute';
  MockRoute.path = '/jest';
  return MockRoute;
});

RelayRoute.genMockInstance = jest.genMockFunction().mockImplementation(
  () => new (RelayRoute.genMock())()
);

module.exports = RelayRoute;

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

const RelayRoute = require.requireActual('../RelayRoute');

RelayRoute.genMock = jest.fn(() => {
  class MockRoute extends RelayRoute {}
  MockRoute.routeName = 'MockRoute';
  MockRoute.path = '/jest';
  return MockRoute;
});

RelayRoute.genMockInstance = jest.fn(() => new (RelayRoute.genMock())());

module.exports = RelayRoute;

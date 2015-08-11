/**
 * @typechecks
 */

'use strict';

var RelayRoute = require.requireActual('RelayRoute');

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

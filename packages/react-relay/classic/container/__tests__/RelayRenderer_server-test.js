/**
 * Copyright 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails oncall+relay
 * @format
 */

'use strict';

jest
  .mock('../../query-config/RelayQueryConfig')
  .mock('../../store/RelayEnvironment');

require('configureForRelayOSS');

const React = require('React');
const ReactDOMServer = require('ReactDOMServer');
const Relay = require('../../RelayPublic');
const RelayEnvironment = require('../../store/RelayEnvironment');
const RelayQueryConfig = require('../../query-config/RelayQueryConfig');
const RelayRenderer = require('../RelayRenderer');

describe('RelayRenderer', function() {
  let MockContainer;

  let queryConfig;
  let environment;

  beforeEach(() => {
    jest.resetModules();

    class MockComponent extends React.Component {
      render() {
        return <div />;
      }
    }
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();
  });

  it('does not run queries on the server', () => {
    ReactDOMServer.renderToString(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
    );
    expect(environment.forceFetch).not.toBeCalled();
    expect(environment.primeCache).not.toBeCalled();
  });
});

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @emails oncall+relay
 */

'use strict';

require('configureForRelayOSS');

jest.dontMock('RelayRenderer');

const React = require('React');
const ReactDOM = require('ReactDOM');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.context', () => {
  let MockContainer;

  let queryConfig;
  let environment;

  beforeEach(() => {
    jest.resetModuleRegistry();

    const MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();

    const container = document.createElement('div');
    const contextTypes = {
      relay: Relay.PropTypes.Environment,
      route: Relay.PropTypes.QueryConfig.isRequired,
    };
    jasmine.addMatchers({
      toRenderQueryConfig() {
        return {
          compare(actual, expected) {
            let context;
            class MockChild extends React.Component {
              render() {
                context = this.context;
                return null;
              }
            }
            MockChild.contextTypes = contextTypes;
            const element = React.cloneElement(actual, {
              render() {
                return <MockChild />;
              },
            });
            ReactDOM.render(element, container);
            const mockRequests = expected.environment.primeCache.mock.requests;
            mockRequests[mockRequests.length - 1].block();
            return {
              pass:
                context.relay === expected.environment &&
                context.route === expected.queryConfig,
            };
          },
        };
      },
    });
  });

  it('sets query config and Relay context on React context', () => {
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    ).toRenderQueryConfig({queryConfig, environment});
  });

  it('updates query config on React context', () => {
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    ).toRenderQueryConfig({queryConfig, environment});

    const newQueryConfig = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={newQueryConfig}
        environment={environment}
      />
    ).toRenderQueryConfig({queryConfig: newQueryConfig, environment});
  });

  it('updates Relay context on React context', () => {
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />
    ).toRenderQueryConfig({queryConfig, environment});

    const newRelayEnvironment = new RelayEnvironment();
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={newRelayEnvironment}
      />
    ).toRenderQueryConfig({queryConfig, environment: newRelayEnvironment});
  });
});

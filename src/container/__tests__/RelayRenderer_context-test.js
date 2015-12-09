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
const RelayContext = require('RelayContext');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

describe('RelayRenderer.context', () => {
  let MockComponent;
  let MockContainer;

  let relayContext;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    relayContext = new RelayContext();

    const container = document.createElement('div');
    const contextTypes = {
      relay: Relay.PropTypes.Context.isRequired,
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
            const mockRequests = relayContext.primeCache.mock.requests;
            mockRequests[mockRequests.length - 1].block();
            return {
              pass: context.relay === relayContext && context.route === expected,
            };
          },
        };
      },
    });
  });

  it('sets query config on context', () => {
    const queryConfig = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />
    ).toRenderQueryConfig(queryConfig);
  });

  it('updates query config on context', () => {
    const queryConfigA = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfigA}
        relayContext={relayContext}
      />
    ).toRenderQueryConfig(queryConfigA);

    const queryConfigB = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfigB}
        relayContext={relayContext}
      />
    ).toRenderQueryConfig(queryConfigB);
  });
});

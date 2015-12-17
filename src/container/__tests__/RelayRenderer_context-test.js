/**
 * Copyright 2013-2015, Facebook, Inc.
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
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');
const RelayStore = require('RelayStore');

describe('RelayRenderer.context', () => {
  let MockComponent;
  let MockContainer;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    const container = document.createElement('div');
    const contextTypes = {
      route: Relay.PropTypes.QueryConfig.isRequired,
    };
    jasmine.addMatchers({
      toRenderQueryConfig() {
        return {
          compare(actual, expected) {
            class MockChild extends React.Component {
              render() {
                actual = this.context.route;
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
            const mockRequests = RelayStore.primeCache.mock.requests;
            mockRequests[mockRequests.length - 1].block();
            return {
              pass: actual === expected,
            };
          },
        };
      },
    });
  });

  it('sets query config on context', () => {
    const queryConfig = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />
    ).toRenderQueryConfig(queryConfig);
  });

  it('updates query config on context', () => {
    const queryConfigA = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfigA} />
    ).toRenderQueryConfig(queryConfigA);

    const queryConfigB = RelayQueryConfig.genMockInstance();
    expect(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfigB} />
    ).toRenderQueryConfig(queryConfigB);
  });
});

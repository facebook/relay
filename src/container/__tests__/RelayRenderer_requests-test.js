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

const getRelayQueries = require('getRelayQueries');

describe('RelayRenderer', function() {
  let MockComponent;
  let MockContainer;

  let container;
  let queryConfig;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = document.createElement('div');
    queryConfig = RelayQueryConfig.genMockInstance();
    ReactDOM.render(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />,
      container
    );
  });

  it('primes queries created from `Component` and `queryConfig`', () => {
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(RelayStore.primeCache).toBeCalled();
  });

  it('does nothing when `Component` and `queryConfig` are unchanged', () => {
    ReactDOM.render(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([[MockContainer, queryConfig]]);
    expect(RelayStore.primeCache.mock.calls.length).toBe(1);
  });

  it('does nothing when `Component` and `queryConfig` are resolved', () => {
    RelayStore.primeCache.mock.requests[0].succeed();

    ReactDOM.render(
      <RelayRenderer Component={MockContainer} queryConfig={queryConfig} />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([[MockContainer, queryConfig]]);
    expect(RelayStore.primeCache.mock.calls.length).toBe(1);
  });

  it('primes new queries when `Component` changes', () => {
    const AnotherComponent = React.createClass({render: () => <div />});
    const AnotherContainer = Relay.createContainer(AnotherComponent, {
      fragments: {},
    });
    ReactDOM.render(
      <RelayRenderer
        Component={AnotherContainer}
        queryConfig={queryConfig}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [AnotherContainer, queryConfig],
    ]);
    expect(RelayStore.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `queryConfig` changes', () => {
    var anotherRoute = RelayQueryConfig.genMockInstance();
    ReactDOM.render(
      <RelayRenderer Component={MockContainer} queryConfig={anotherRoute} />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, anotherRoute],
    ]);
    expect(RelayStore.primeCache.mock.calls.length).toBe(2);
  });

  it('force fetches when the `forceFetch` prop is true', () => {
    ReactDOM.render(
      <RelayRenderer
        Component={MockContainer}
        queryConfig={queryConfig}
        forceFetch={true}
      />,
      container
    );
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(RelayStore.forceFetch).toBeCalled();
  });
});

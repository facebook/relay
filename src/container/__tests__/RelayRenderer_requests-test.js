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

const getRelayQueries = require('getRelayQueries');

describe('RelayRenderer', function() {
  let MockComponent;
  let MockContainer;

  let container;
  let queryConfig;
  let relayContext;

  beforeEach(() => {
    jest.resetModuleRegistry();

    MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = document.createElement('div');
    queryConfig = RelayQueryConfig.genMockInstance();
    relayContext = new RelayContext();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />,
      container
    );
  });

  it('primes queries created from `Component` and `queryConfig`', () => {
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(relayContext.primeCache).toBeCalled();
  });

  it('does nothing when `Component` and `queryConfig` are unchanged', () => {
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([[MockContainer, queryConfig]]);
    expect(relayContext.primeCache.mock.calls.length).toBe(1);
  });

  it('does nothing when `Component` and `queryConfig` are resolved', () => {
    relayContext.primeCache.mock.requests[0].succeed();

    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([[MockContainer, queryConfig]]);
    expect(relayContext.primeCache.mock.calls.length).toBe(1);
  });

  it('primes new queries when `Component` changes', () => {
    const AnotherComponent = React.createClass({render: () => <div />});
    const AnotherContainer = Relay.createContainer(AnotherComponent, {
      fragments: {},
    });
    ReactDOM.render(
      <RelayRenderer
        Container={AnotherContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [AnotherContainer, queryConfig],
    ]);
    expect(relayContext.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `queryConfig` changes', () => {
    const anotherQueryConfig = RelayQueryConfig.genMockInstance();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={anotherQueryConfig}
        relayContext={relayContext}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, anotherQueryConfig],
    ]);
    expect(relayContext.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `relayContext` changes', () => {
    const anotherRelayContext = new RelayContext();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={anotherRelayContext}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, queryConfig],
    ]);
    expect(relayContext.primeCache.mock.calls.length).toBe(1);
    expect(anotherRelayContext.primeCache.mock.calls.length).toBe(1);
  });

  it('force fetches when the `forceFetch` prop is true', () => {
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        forceFetch={true}
      />,
      container
    );
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(relayContext.forceFetch).toBeCalled();
  });

  it('calls `onForceFetch` hook if supplied', () => {
    const onForceFetch = jest.genMockFunction();
    const onPrimeCache = jest.genMockFunction();

    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        relayContext={relayContext}
        forceFetch={true}
        onForceFetch={onForceFetch}
        onPrimeCache={onPrimeCache}
      />,
      container
    );
    expect(onForceFetch).toBeCalled();
    expect(onPrimeCache).not.toBeCalled();
  });

  it('calls `onPrimeCache` hook if supplied', () => {
    const anotherQueryConfig = RelayQueryConfig.genMockInstance();
    const onForceFetch = jest.genMockFunction();
    const onPrimeCache = jest.genMockFunction();

    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={anotherQueryConfig}
        relayContext={relayContext}
        onForceFetch={onForceFetch}
        onPrimeCache={onPrimeCache}
      />,
      container
    );
    expect(onForceFetch).not.toBeCalled();
    expect(onPrimeCache).toBeCalled();
  });
});

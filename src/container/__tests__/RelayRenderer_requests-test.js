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

jest.unmock('RelayRenderer');

const React = require('React');
const ReactDOM = require('ReactDOM');
const Relay = require('Relay');
const RelayEnvironment = require('RelayEnvironment');
const RelayQueryConfig = require('RelayQueryConfig');
const RelayRenderer = require('RelayRenderer');

const getRelayQueries = require('getRelayQueries');

describe('RelayRenderer', function() {
  let MockContainer;

  let container;
  let queryConfig;
  let environment;

  beforeEach(() => {
    jest.resetModules();

    const MockComponent = React.createClass({render: () => <div />});
    MockContainer = Relay.createContainer(MockComponent, {
      fragments: {},
    });

    container = document.createElement('div');
    queryConfig = RelayQueryConfig.genMockInstance();
    environment = new RelayEnvironment();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
      container
    );
  });

  it('primes queries created from `Component` and `queryConfig`', () => {
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(environment.primeCache).toBeCalled();
  });

  it('does nothing when `Component` and `queryConfig` are unchanged', () => {
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([[MockContainer, queryConfig]]);
    expect(environment.primeCache.mock.calls.length).toBe(1);
  });

  it('does nothing when `Component` and `queryConfig` are resolved', () => {
    environment.primeCache.mock.requests[0].succeed();

    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
      />,
      container
    );
    expect(getRelayQueries.mock.calls[0]).toEqual([MockContainer, queryConfig]);
    expect(environment.primeCache.mock.calls.length).toBe(1);
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
        environment={environment}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [AnotherContainer, queryConfig],
    ]);
    expect(environment.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `queryConfig` changes', () => {
    const anotherQueryConfig = RelayQueryConfig.genMockInstance();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={anotherQueryConfig}
        environment={environment}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, anotherQueryConfig],
    ]);
    expect(environment.primeCache.mock.calls.length).toBe(2);
  });

  it('primes new queries when `environment` changes', () => {
    const anotherRelayEnvironment = new RelayEnvironment();
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={anotherRelayEnvironment}
      />,
      container
    );
    expect(getRelayQueries.mock.calls).toEqual([
      [MockContainer, queryConfig],
      [MockContainer, queryConfig],
    ]);
    expect(environment.primeCache.mock.calls.length).toBe(1);
    expect(anotherRelayEnvironment.primeCache.mock.calls.length).toBe(1);
  });

  it('force fetches when the `forceFetch` prop is true', () => {
    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
        forceFetch={true}
      />,
      container
    );
    expect(getRelayQueries).toBeCalledWith(MockContainer, queryConfig);
    expect(environment.forceFetch).toBeCalled();
  });

  it('calls `onForceFetch` hook if supplied', () => {
    const onForceFetch = jest.fn();
    const onPrimeCache = jest.fn();

    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={queryConfig}
        environment={environment}
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
    const onForceFetch = jest.fn();
    const onPrimeCache = jest.fn();

    ReactDOM.render(
      <RelayRenderer
        Container={MockContainer}
        queryConfig={anotherQueryConfig}
        environment={environment}
        onForceFetch={onForceFetch}
        onPrimeCache={onPrimeCache}
      />,
      container
    );
    expect(onForceFetch).not.toBeCalled();
    expect(onPrimeCache).toBeCalled();
  });
});
